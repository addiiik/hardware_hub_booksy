import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from database import Base

class CategoryEnum(str, enum.Enum):
    LAPTOP = "Laptop"
    SMARTPHONE = "Smartphone"
    TABLET = "Tablet"
    MONITOR = "Monitor"
    PERIPHERAL = "Peripheral"
    AUDIO = "Audio"
    ACCESSORY = "Accessory"
    NETWORKING = "Networking"
    OTHER = "Other"

class StatusEnum(str, enum.Enum):
    AVAILABLE = "Available"
    IN_USE = "In Use"
    IN_REPAIR = "In Repair"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="employee")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    rentals = relationship("Rental", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class HardwareItem(Base):
    __tablename__ = "hardware_items"

    id = Column(Integer, primary_key=True, index=True)
    serial_number = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    
    category = Column(Enum(CategoryEnum), nullable=False, default=CategoryEnum.PERIPHERAL)
    status = Column(Enum(StatusEnum), nullable=False, default=StatusEnum.AVAILABLE)
    
    purchase_date = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    history = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    rentals = relationship("Rental", back_populates="item")


class Rental(Base):
    __tablename__ = "rentals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("hardware_items.id"), nullable=False)
    rented_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    returned_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="rentals")
    item = relationship("HardwareItem", back_populates="rentals")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")