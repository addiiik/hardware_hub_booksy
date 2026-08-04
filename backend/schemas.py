from pydantic import BaseModel, EmailStr, Field, field_validator

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

    class Config:
        from_attributes = True