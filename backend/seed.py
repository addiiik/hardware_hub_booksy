import bcrypt
from database import SessionLocal, engine
import models

SEED_ITEMS = [
    { "id": 1, "name": "Apple iPhone 13 Pro Max", "brand": "Apple", "serialNumber": "IPH-13PM-001", "category": models.CategoryEnum.SMARTPHONE, "purchaseDate": "2021-11-23", "status": models.StatusEnum.AVAILABLE },
    { "id": 2, "name": "Apple MacBook Pro 13", "brand": "Apple", "serialNumber": "MBP-2021-002", "category": models.CategoryEnum.LAPTOP, "purchaseDate": "2021-12-20", "status": models.StatusEnum.IN_USE },
    { "id": 3, "name": "Razer Basilisk V2", "brand": "Razer", "serialNumber": "RZ-BAS-003", "category": models.CategoryEnum.PERIPHERAL, "purchaseDate": "2021-06-05", "status": models.StatusEnum.IN_REPAIR },
    { "id": 4, "name": "Samsung Galaxy S21", "brand": "Samsung", "serialNumber": "SAM-S21-004", "category": models.CategoryEnum.SMARTPHONE, "purchaseDate": "2021-11-23", "status": models.StatusEnum.AVAILABLE },
    { "id": 5, "name": "Dell XPS 15 9510", "brand": "Dell", "serialNumber": "DELL-XPS-005", "category": models.CategoryEnum.LAPTOP, "purchaseDate": "2022-03-15", "status": models.StatusEnum.AVAILABLE, "notes": "Battery swelling, do not issue without service." },
    { "id": 6, "name": "Logitech MX Master 3", "brand": "Logitech", "serialNumber": "LOG-MX3-006", "category": models.CategoryEnum.PERIPHERAL, "purchaseDate": "2022-10-10", "status": models.StatusEnum.AVAILABLE },
    { "id": 7, "name": "Sony WH-1000XM4", "brand": "Sony", "serialNumber": "SNY-XM4-007", "category": models.CategoryEnum.AUDIO, "purchaseDate": "2022-01-12", "status": models.StatusEnum.IN_USE },
    { "id": 8, "name": "Duplicate ID Test Laptop", "brand": "Lenovo", "serialNumber": "LNV-TST-008", "category": models.CategoryEnum.LAPTOP, "purchaseDate": "2023-01-01", "status": models.StatusEnum.IN_REPAIR },
    { "id": 9, "name": "iPad Pro 12.9", "brand": "Apple", "serialNumber": "IPD-PRO-009", "category": models.CategoryEnum.TABLET, "purchaseDate": "2023-05-22", "status": models.StatusEnum.AVAILABLE },
    { "id": 10, "name": "Unknown Device", "brand": None, "serialNumber": "UNK-DEV-010", "category": models.CategoryEnum.OTHER, "purchaseDate": None, "status": models.StatusEnum.AVAILABLE },
    { "id": 11, "name": "MacBook Air M2", "brand": "Apple", "serialNumber": "MBA-M2-011", "category": models.CategoryEnum.LAPTOP, "purchaseDate": "2023-08-01", "status": models.StatusEnum.AVAILABLE, "history": "Returned by user with liquid damage. Keyboard sticky." },
    { "id": 12, "name": "MacBook Pro 16\"", "brand": "Apple", "serialNumber": "MBP-2024-012", "category": models.CategoryEnum.LAPTOP, "purchaseDate": "2024-01-10", "status": models.StatusEnum.AVAILABLE },
    { "id": 13, "name": "Dell UltraSharp 27 Monitor", "brand": "Dell", "serialNumber": "DELL-MON-013", "category": models.CategoryEnum.MONITOR, "purchaseDate": "2023-02-14", "status": models.StatusEnum.AVAILABLE },
    { "id": 14, "name": "ThinkPad X1 Carbon Gen 10", "brand": "Lenovo", "serialNumber": "TPX1-014", "category": models.CategoryEnum.LAPTOP, "purchaseDate": "2023-04-11", "status": models.StatusEnum.IN_USE },
    { "id": 15, "name": "iPhone 15 Pro", "brand": "Apple", "serialNumber": "IPH-15P-015", "category": models.CategoryEnum.SMARTPHONE, "purchaseDate": "2024-02-01", "status": models.StatusEnum.AVAILABLE },
    { "id": 16, "name": "iPad Air M1", "brand": "Apple", "serialNumber": "IPAD-AIR-016", "category": models.CategoryEnum.TABLET, "purchaseDate": "2023-09-12", "status": models.StatusEnum.IN_REPAIR, "notes": "Cracked screen near home button." },
    { "id": 17, "name": "Microsoft Surface Pro 9", "brand": "Microsoft", "serialNumber": "SRF-PRO-017", "category": models.CategoryEnum.TABLET, "purchaseDate": "2023-11-05", "status": models.StatusEnum.IN_USE },
    { "id": 18, "name": "Apple Magic Keyboard", "brand": "Apple", "serialNumber": "MKB-018", "category": models.CategoryEnum.PERIPHERAL, "purchaseDate": "2023-06-18", "status": models.StatusEnum.AVAILABLE },
    { "id": 19, "name": "LG UltraFine 4K Display", "brand": "LG", "serialNumber": "LG-UF4K-019", "category": models.CategoryEnum.MONITOR, "purchaseDate": "2022-08-20", "status": models.StatusEnum.AVAILABLE },
    { "id": 20, "name": "Google Pixel 8 Pro", "brand": "Google", "serialNumber": "GGL-P8P-020", "category": models.CategoryEnum.SMARTPHONE, "purchaseDate": "2024-01-15", "status": models.StatusEnum.AVAILABLE },
    { "id": 21, "name": "Asus ROG Zephyrus G14", "brand": "Asus", "serialNumber": "ASU-ROG-021", "category": models.CategoryEnum.LAPTOP, "purchaseDate": "2023-07-22", "status": models.StatusEnum.IN_USE },
    { "id": 22, "name": "Keychron K2 Wireless Keyboard", "brand": "Keychron", "serialNumber": "KCH-K2-022", "category": models.CategoryEnum.PERIPHERAL, "purchaseDate": "2023-03-30", "status": models.StatusEnum.AVAILABLE },
    { "id": 23, "name": "Bose QuietComfort 45", "brand": "Bose", "serialNumber": "BOS-QC45-023", "category": models.CategoryEnum.AUDIO, "purchaseDate": "2022-12-01", "status": models.StatusEnum.AVAILABLE },
    { "id": 24, "name": "HP ZBook Studio G9", "brand": "HP", "serialNumber": "HP-ZBK-024", "category": models.CategoryEnum.LAPTOP, "purchaseDate": "2023-10-14", "status": models.StatusEnum.IN_REPAIR, "notes": "Thermal throttling issue under load." },
    { "id": 25, "name": "Samsung Galaxy Tab S9", "brand": "Samsung", "serialNumber": "SAM-TS9-025", "category": models.CategoryEnum.TABLET, "purchaseDate": "2024-03-01", "status": models.StatusEnum.AVAILABLE },
    { "id": 26, "name": "Logitech C920 HD Pro Webcam", "brand": "Logitech", "serialNumber": "LOG-C920-026", "category": models.CategoryEnum.PERIPHERAL, "purchaseDate": "2021-09-15", "status": models.StatusEnum.AVAILABLE },
    { "id": 27, "name": "Apple Mac Mini M2", "brand": "Apple", "serialNumber": "MM-M2-027", "category": models.CategoryEnum.OTHER, "purchaseDate": "2023-05-10", "status": models.StatusEnum.IN_USE },
    { "id": 28, "name": "Dell Latitude 5430", "brand": "Dell", "serialNumber": "DELL-LAT-028", "category": models.CategoryEnum.LAPTOP, "purchaseDate": "2022-11-18", "status": models.StatusEnum.AVAILABLE },
    { "id": 29, "name": "Elgato Wave:3 USB Mic", "brand": "Elgato", "serialNumber": "ELG-W3-029", "category": models.CategoryEnum.AUDIO, "purchaseDate": "2023-01-25", "status": models.StatusEnum.AVAILABLE },
    { "id": 30, "name": "Samsung Odyssey G7 32\"", "brand": "Samsung", "serialNumber": "SAM-G7-030", "category": models.CategoryEnum.MONITOR, "purchaseDate": "2022-05-19", "status": models.StatusEnum.AVAILABLE },
    { "id": 31, "name": "Apple Watch Series 9", "brand": "Apple", "serialNumber": "AW-S9-031", "category": models.CategoryEnum.ACCESSORY, "purchaseDate": "2024-01-05", "status": models.StatusEnum.IN_USE },
    { "id": 32, "name": "Lenovo Legion 5 Pro", "brand": "Lenovo", "serialNumber": "LNV-LEG-032", "category": models.CategoryEnum.LAPTOP, "purchaseDate": "2023-08-19", "status": models.StatusEnum.AVAILABLE },
    { "id": 33, "name": "Anker PowerConf H700 Headset", "brand": "Anker", "serialNumber": "ANK-H700-033", "category": models.CategoryEnum.AUDIO, "purchaseDate": "2023-04-02", "status": models.StatusEnum.AVAILABLE },
    { "id": 34, "name": "Microsoft Ergonomic Keyboard", "brand": "Microsoft", "serialNumber": "MS-ERG-034", "category": models.CategoryEnum.PERIPHERAL, "purchaseDate": "2022-02-28", "status": models.StatusEnum.AVAILABLE },
    { "id": 35, "name": "Mac Studio M2 Max", "brand": "Apple", "serialNumber": "MS-M2M-035", "category": models.CategoryEnum.OTHER, "purchaseDate": "2023-11-20", "status": models.StatusEnum.IN_USE },
    { "id": 36, "name": "BenQ ScreenBar Halo", "brand": "BenQ", "serialNumber": "BNQ-SB-036", "category": models.CategoryEnum.ACCESSORY, "purchaseDate": "2023-06-01", "status": models.StatusEnum.AVAILABLE },
    { "id": 37, "name": "CalDigit TS4 Thunderbolt Dock", "brand": "CalDigit", "serialNumber": "CD-TS4-037", "category": models.CategoryEnum.ACCESSORY, "purchaseDate": "2023-09-09", "status": models.StatusEnum.IN_USE },
    { "id": 38, "name": "Google Pixel Fold", "brand": "Google", "serialNumber": "GGL-FLD-038", "category": models.CategoryEnum.SMARTPHONE, "purchaseDate": "2024-02-18", "status": models.StatusEnum.IN_REPAIR, "notes": "Hinge resistance issue." },
    { "id": 39, "name": "HP EliteBook 840 G9", "brand": "HP", "serialNumber": "HP-ELT-039", "category": models.CategoryEnum.LAPTOP, "purchaseDate": "2023-02-11", "status": models.StatusEnum.AVAILABLE },
    { "id": 40, "name": "Logitech StreamCam", "brand": "Logitech", "serialNumber": "LOG-SC-040", "category": models.CategoryEnum.PERIPHERAL, "purchaseDate": "2022-07-07", "status": models.StatusEnum.AVAILABLE },
    { "id": 41, "name": "Sennheiser Momentum 4", "brand": "Sennheiser", "serialNumber": "SNN-M4-041", "category": models.CategoryEnum.AUDIO, "purchaseDate": "2023-10-30", "status": models.StatusEnum.AVAILABLE },
    { "id": 42, "name": "Apple Studio Display 27\"", "brand": "Apple", "serialNumber": "ASD-27-042", "category": models.CategoryEnum.MONITOR, "purchaseDate": "2023-03-15", "status": models.StatusEnum.IN_USE },
    { "id": 43, "name": "Samsung T7 Shield 2TB SSD", "brand": "Samsung", "serialNumber": "SAM-T7-043", "category": models.CategoryEnum.ACCESSORY, "purchaseDate": "2023-05-05", "status": models.StatusEnum.AVAILABLE },
    { "id": 44, "name": "Framework Laptop 13", "brand": "Framework", "serialNumber": "FW-13-044", "category": models.CategoryEnum.LAPTOP, "purchaseDate": "2024-01-22", "status": models.StatusEnum.AVAILABLE },
    { "id": 45, "name": "Wacom Cintiq Pro 16", "brand": "Wacom", "serialNumber": "WCM-CP16-045", "category": models.CategoryEnum.TABLET, "purchaseDate": "2022-10-04", "status": models.StatusEnum.AVAILABLE },
    { "id": 46, "name": "Apple Magic Trackpad 2", "brand": "Apple", "serialNumber": "MTP-046", "category": models.CategoryEnum.PERIPHERAL, "purchaseDate": "2023-01-14", "status": models.StatusEnum.AVAILABLE },
    { "id": 47, "name": "Dell Precision 5570", "brand": "Dell", "serialNumber": "DELL-PRC-047", "category": models.CategoryEnum.LAPTOP, "purchaseDate": "2023-07-08", "status": models.StatusEnum.IN_USE },
    { "id": 48, "name": "Jabras Speak 750 Speakerphone", "brand": "Jabra", "serialNumber": "JBR-SP750-048", "category": models.CategoryEnum.AUDIO, "purchaseDate": "2022-04-12", "status": models.StatusEnum.AVAILABLE },
    { "id": 49, "name": "Asus ProArt Display PA278QV", "brand": "Asus", "serialNumber": "ASU-PA27-049", "category": models.CategoryEnum.MONITOR, "purchaseDate": "2023-08-25", "status": models.StatusEnum.AVAILABLE },
    { "id": 50, "name": "TP-Link AX6000 Wi-Fi 6 Router", "brand": "TP-Link", "serialNumber": "TPL-AX6-050", "category": models.CategoryEnum.NETWORKING, "purchaseDate": "2024-02-20", "status": models.StatusEnum.AVAILABLE }
]

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def seed_database():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(models.User).first() or db.query(models.HardwareItem).first():
        db.close()
        return

    admin_user = models.User(
        first_name="Admin",
        last_name="User",
        email="admin@booksy.com",
        password=hash_password("adminbooksyhub"),
        role="admin"
    )
    
    john_doe = models.User(
        first_name="John",
        last_name="Doe",
        email="j.doe@booksy.com",
        password=hash_password("johndoeuser"),
        role="employee"
    )

    db.add(admin_user)
    db.add(john_doe)
    db.commit()

    for item_data in SEED_ITEMS:
        item = models.HardwareItem(
            id=item_data["id"],
            serial_number=item_data["serialNumber"],
            name=item_data["name"],
            brand=item_data.get("brand"),
            category=item_data["category"],
            purchase_date=item_data.get("purchaseDate"),
            status=item_data["status"],
            notes=item_data.get("notes"),
            history=item_data.get("history")
        )
        db.add(item)

    db.commit()
    print("DB seeded successfully")
    db.close()

if __name__ == "__main__":
    seed_database()