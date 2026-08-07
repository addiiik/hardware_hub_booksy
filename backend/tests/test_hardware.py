import pytest
import models

def test_create_duplicate_serial_number(client, db_session):
    existing_item = models.HardwareItem(
        name="MacBook Pro",
        serial_number="SN12345",
        brand="Apple",
        category=models.CategoryEnum.LAPTOP,
        status=models.StatusEnum.AVAILABLE
    )
    db_session.add(existing_item)
    db_session.commit()

    payload = {
        "device_name": "Another MacBook",
        "serial_number": "SN12345",
        "brand": "Apple",
        "category": "Laptop",
        "status": "Available",
        "purchase_date": "2023-01-01",
        "rentable": True
    }
    
    response = client.post("/api/admin/hardware", json=payload)
    
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_cannot_rent_item_in_repair(client, db_session):
    broken_item = models.HardwareItem(
        name="Dell Monitor",
        serial_number="DELL999",
        brand="Dell",
        category=models.CategoryEnum.MONITOR,
        status=models.StatusEnum.IN_REPAIR,
        rentable=True
    )
    db_session.add(broken_item)
    db_session.commit()

    response = client.post(f"/api/hardware/{broken_item.id}/toggle-rent")

    assert response.status_code == 400
    assert response.json()["detail"] == "Cannot rent an item that is currently in repair"


def test_cannot_rent_item_already_in_use(client, db_session):
    in_use_item = models.HardwareItem(
        name="iPhone 13",
        serial_number="IPHONE-001",
        brand="Apple",
        category=models.CategoryEnum.SMARTPHONE,
        status=models.StatusEnum.IN_USE, 
        rentable=True
    )
    db_session.add(in_use_item)
    db_session.commit()
    
    active_rental = models.Rental(
        item_id=in_use_item.id,
        user_id="another-user-id",
    )
    db_session.add(active_rental)
    db_session.commit()

    from main import app
    from api.deps import get_current_user
    
    app.dependency_overrides[get_current_user] = lambda: models.User(
        id="test-user-id", role="employee"
    )

    response = client.post(f"/api/hardware/{in_use_item.id}/toggle-rent")

    assert response.status_code == 403
    assert response.json()["detail"] == "Not authorized to return this rental"