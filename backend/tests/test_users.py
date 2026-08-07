import models

def test_create_user_success(client):
    payload = {
        "first_name": "Alice",
        "last_name": "Smith",
        "email": "alice.smith@booksy.com",
        "password": "strongpassword123",
        "role": "employee"
    }
    
    response = client.post("/api/admin/users", json=payload)
    
    assert response.status_code == 201
    assert response.json()["first_name"] == "Alice"
    assert response.json()["email"] == "alice.smith@booksy.com"

def test_create_user_duplicate_email(client, db_session):
    existing_user = models.User(
        first_name="Bob",
        last_name="Jones",
        email="bob.jones@booksy.com",
        password="hashedpassword",
        role=models.RoleEnum.EMPLOYEE
    )
    db_session.add(existing_user)
    db_session.commit()

    payload = {
        "first_name": "Another",
        "last_name": "Bob",
        "email": "bob.jones@booksy.com",
        "password": "newpassword123",
        "role": "employee"
    }
    
    response = client.post("/api/admin/users", json=payload)
    
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_create_user_invalid_email_domain(client):
    payload = {
        "first_name": "Charlie",
        "last_name": "Brown",
        "email": "charlie@gmail.com",
        "password": "strongpassword123",
        "role": "employee"
    }
    
    response = client.post("/api/admin/users", json=payload)
    
    assert response.status_code == 422
    assert "must use your @booksy.com email" in str(response.json())