import bcrypt
import models

def test_login_success(client, db_session):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(b"securepassword", salt).decode('utf-8')
    
    user = models.User(
        first_name="John",
        last_name="Doe",
        email="john.doe@booksy.com",
        password=hashed_password,
        role=models.RoleEnum.EMPLOYEE,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()

    payload = {
        "email": "john.doe@booksy.com",
        "password": "securepassword"
    }
    
    response = client.post("/api/auth/login", json=payload)
    
    assert response.status_code == 200
    assert response.json()["email"] == "john.doe@booksy.com"
    assert "access_token" in response.cookies

def test_login_invalid_credentials(client):
    payload = {
        "email": "nonexistent@booksy.com",
        "password": "wrongpassword"
    }
    
    response = client.post("/api/auth/login", json=payload)
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

def test_login_deactivated_account(client, db_session):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(b"securepassword", salt).decode('utf-8')
    
    deactivated_user = models.User(
        first_name="Jane",
        last_name="Doe",
        email="jane.doe@booksy.com",
        password=hashed_password,
        role=models.RoleEnum.EMPLOYEE,
        is_active=False
    )
    db_session.add(deactivated_user)
    db_session.commit()

    payload = {
        "email": "jane.doe@booksy.com",
        "password": "securepassword"
    }
    
    response = client.post("/api/auth/login", json=payload)
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Account is deactivated"

def test_logout(client):
    response = client.post("/api/auth/logout")
    
    assert response.status_code == 200
    assert response.json()["message"] == "Logged out"
    assert not response.cookies.get("access_token")