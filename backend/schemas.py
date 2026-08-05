from pydantic import BaseModel, EmailStr, Field, field_validator
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

class HardwareItemResponse(BaseModel):
    id: int
    name: str
    serial_number: str
    brand: str
    category: str
    purchase_date: str
    status: str
    rentable: bool

    class Config:
        from_attributes = True

class MyRentalResponse(BaseModel):
    id: int
    rented_at: datetime
    item: HardwareItemResponse

    class Config:
        from_attributes = True

class RepairResponse(BaseModel):
    id: int
    item_id: int
    repair_start_date: datetime
    repair_end_date: datetime | None
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