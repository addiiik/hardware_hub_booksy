from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, computed_field, field_validator
from datetime import datetime
import models

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)

    @field_validator('email')
    @classmethod
    def validate_booksy_domain(cls, value: str) -> str:
        if not value.endswith('@booksy.com'):
            raise ValueError('You must use your @booksy.com email address')
        return value

class UserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserBasicResponse(BaseModel):
    first_name: str
    last_name: str
    email: str

    class Config:
        from_attributes = True

class RentalBaseResponse(BaseModel):
    id: int
    user_id: str
    user: UserBasicResponse 
    rented_at: datetime
    returned_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class NoteCreateRequest(BaseModel):
    content: str = Field(..., min_length=1)

class NoteResponse(BaseModel):
    id: int
    content: str
    created_at: datetime
    author: UserBasicResponse 

    class Config:
        from_attributes = True

class RepairBaseResponse(BaseModel):
    id: int
    repair_start_date: datetime
    repair_end_date: Optional[datetime]

    class Config:
        from_attributes = True

class HardwareItemBasicResponse(BaseModel):
    id: int
    name: str
    serial_number: str
    brand: str
    category: str
    purchase_date: Optional[str]
    created_at: Optional[datetime] = None
    status: str
    rentable: bool
    rentals: List[RentalBaseResponse] = [] 

    class Config:
        from_attributes = True

class HardwareItemResponse(BaseModel):
    id: int
    name: str
    serial_number: str
    brand: str
    category: str
    purchase_date: Optional[str]
    created_at: Optional[datetime] = None
    status: str
    rentable: bool
    rentals: List[RentalBaseResponse] = []
    repairs: List[RepairBaseResponse] = []
    notes: List[NoteResponse] = []

    embedding: Optional[list] = Field(default=None, exclude=True)
    
    @computed_field
    @property
    def is_ai_indexed(self) -> bool:
        return getattr(self, "embedding", None) is not None

    class Config:
        from_attributes = True

class MyRentalResponse(BaseModel):
    id: int
    rented_at: datetime
    item: HardwareItemResponse

    class Config:
        from_attributes = True

class UserCreateRequest(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=1)
    password: str = Field(..., min_length=6)
    role: models.RoleEnum

class HardwareCreateRequest(BaseModel):
    device_name: str = Field(..., min_length=1)
    serial_number: str = Field(..., min_length=1)
    brand: str = Field(..., min_length=1)
    category: models.CategoryEnum
    status: models.StatusEnum = models.StatusEnum.AVAILABLE
    purchase_date: str | None = None
    rentable: bool = True

class NotificationResponse(BaseModel):
    id: int
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True