import re
from core.database import SessionLocal
from models.base_models import HardwareItem, User, Notification, RoleEnum
from services.ai_service import generate_hardware_description, get_embedding

def startup_index_unindexed_items():
    db = SessionLocal()
    try:
        unindexed_items = db.query(HardwareItem).filter(HardwareItem.embedding.is_(None)).all()
        
        if not unindexed_items:
            return 

        admins = db.query(User).filter(User.role == RoleEnum.ADMIN).all()

        for item in unindexed_items:
            if not item.rentable:
                continue

            pattern = r"(?i)\b(test|demo|dummy|placeholder|fake)"
            combined_text = f"{item.name} {item.brand} {item.serial_number}"
            if re.search(pattern, combined_text):
                continue

            for admin in admins:
                start_notif = Notification(
                    user_id=admin.id,
                    title=f"AI Search: Started indexing {item.name}",
                    content=f"AI Search background process has started indexing hardware item '{item.name}'.\nHardware ID: {item.id}\nSerial Number: {item.serial_number}"
                )
                db.add(start_notif)
            db.commit()

            try:
                description = generate_hardware_description(item)
                embedding_vector = get_embedding(description)

                if embedding_vector:
                    item.embedding = embedding_vector
                    final_title = f"AI Search: Successfully indexed {item.name}."
                    final_content = f"Successfully generated descriptions and vector embeddings for '{item.name}'.\nHardware ID: {item.id}\nSerial Number: {item.serial_number}"
                else:
                    final_title = f"AI Search: Failed to index {item.name}"
                    final_content = f"Failed to index {item.name} because an empty response was returned.\nHardware ID: {item.id}\nSerial Number: {item.serial_number}"
            except Exception as e:
                final_title = f"AI Search Error: Could not index {item.name}."
                final_content = f"An error occurred while indexing '{item.name}': {str(e)}\nHardware ID: {item.id}\nSerial Number: {item.serial_number}"

            for admin in admins:
                end_notif = Notification(
                    user_id=admin.id,
                    title=final_title,
                    content=final_content
                )
                db.add(end_notif)
            
            db.commit()

    except Exception as e:
        print(f"Startup background indexing failed: {e}")
    finally:
        db.close()

def background_index_item(hardware_id: int, user_id: str):
    db = SessionLocal()
    try:
        item = db.query(HardwareItem).filter(HardwareItem.id == hardware_id).first()
        if not item:
            return

        if not item.rentable:
            return

        pattern = r"(?i)\b(test|demo|dummy|placeholder|fake)"
        combined_text = f"{item.name} {item.brand} {item.serial_number}"
        if re.search(pattern, combined_text):
            return

        admins = db.query(User).filter(User.role == RoleEnum.ADMIN).all()

        for admin in admins:
            start_notif = Notification(
                user_id=admin.id,
                title=f"AI Search: Started indexing {item.name}",
                content=f"AI Search background process has started indexing hardware item '{item.name}'.\nHardware ID: {item.id}\nSerial Number: {item.serial_number}"
            )
            db.add(start_notif)
        db.commit()

        try:
            description = generate_hardware_description(item)
            embedding_vector = get_embedding(description)

            if embedding_vector:
                item.embedding = embedding_vector
                final_title = f"AI Search: Successfully indexed {item.name}."
                final_content = f"Successfully generated descriptions and vector embeddings for '{item.name}'.\nHardware ID: {item.id}\nSerial Number: {item.serial_number}"
            else:
                final_title = f"AI Search: Failed to index {item.name}"
                final_content = f"Failed to index {item.name} because an empty response was returned.\nHardware ID: {item.id}\nSerial Number: {item.serial_number}"
        except Exception as e:
            final_title = f"AI Search Error: Could not index {item.name}."
            final_content = f"An error occurred while indexing '{item.name}': {str(e)}\nHardware ID: {item.id}\nSerial Number: {item.serial_number}"

        for admin in admins:
            end_notif = Notification(
                user_id=admin.id,
                title=final_title,
                content=final_content
            )
            db.add(end_notif)
            
        db.commit()

    except Exception as e:
        db.rollback()
        try:
            admins = db.query(User).filter(User.role == RoleEnum.ADMIN).all()
            for admin in admins:
                notification = Notification(
                    user_id=admin.id,
                    title=f"AI Search Error: Could not index item {hardware_id}.",
                    content=f"An unexpected error occurred during background indexing: {str(e)}\nHardware ID: {hardware_id}"
                )
                db.add(notification)
            db.commit()
        except Exception:
            pass
    finally:
        db.close()