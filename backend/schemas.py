from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    role: str

    class Config:
        from_attributes = True