import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Enum, JSON
from sqlalchemy.orm import relationship
from core.database import Base

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

class RentalTypeEnum(str, enum.Enum):
    REGULAR = "Regular"
    MAINTENANCE = "Maintenance"

class RoleEnum(str, enum.Enum):
    EMPLOYEE = "employee"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.EMPLOYEE)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    rentals = relationship("Rental", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    notes = relationship("Note", back_populates="author")


class HardwareItem(Base):
    __tablename__ = "hardware_items"

    id = Column(Integer, primary_key=True, index=True)
    serial_number = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    
    category = Column(Enum(CategoryEnum), nullable=False, default=CategoryEnum.PERIPHERAL)
    status = Column(Enum(StatusEnum), nullable=False, default=StatusEnum.AVAILABLE)
    purchase_date = Column(String, nullable=True)
    
    rentable = Column(Boolean, default=True, nullable=False)

    embedding = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    rentals = relationship("Rental", back_populates="item", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="item", cascade="all, delete-orphan")
    repairs = relationship("Repair", back_populates="item", cascade="all, delete-orphan")


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("hardware_items.id"), nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    item = relationship("HardwareItem", back_populates="notes")
    author = relationship("User", back_populates="notes")


class Rental(Base):
    __tablename__ = "rentals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("hardware_items.id"), nullable=False)
    rented_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    returned_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="rentals")
    item = relationship("HardwareItem", back_populates="rentals")


class Repair(Base):
    __tablename__ = "repairs"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("hardware_items.id"), nullable=False)
    repair_start_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    repair_end_date = Column(DateTime(timezone=True), nullable=True)

    item = relationship("HardwareItem", back_populates="repairs")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")