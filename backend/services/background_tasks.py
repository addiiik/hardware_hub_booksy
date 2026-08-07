import re
from core.database import SessionLocal
from models.base_models import HardwareItem, User, Notification, RoleEnum
from services.ai_service import generate_hardware_description, get_embedding

def startup_index_unindexed_items():
    """Runs on server startup in a background thread to index missing items."""
    db = SessionLocal()
    try:
        unindexed_items = db.query(HardwareItem).filter(HardwareItem.embedding.is_(None)).all()
        
        if not unindexed_items:
            return 

        admins = db.query(User).filter(User.role == RoleEnum.ADMIN).all()

        for item in unindexed_items:
            pattern = r"(?i)\b(test|demo|dummy|placeholder|fake)"
            combined_text = f"{item.name} {item.brand} {item.serial_number}"
            if re.search(pattern, combined_text):
                continue

            for admin in admins:
                start_notif = Notification(
                    user_id=admin.id,
                    message=f"AI Search: Started indexing {item.name}"
                )
                db.add(start_notif)
            db.commit()

            try:
                description = generate_hardware_description(item)
                embedding_vector = get_embedding(description)

                if embedding_vector:
                    item.embedding = embedding_vector
                    final_msg = f"AI Search: Successfully indexed {item.name}."
                else:
                    final_msg = f"AI Search: Failed to index {item.name} (Empty response)."
            except Exception as e:
                final_msg = f"AI Search Error: Could not index {item.name}. {str(e)}"

            for admin in admins:
                end_notif = Notification(
                    user_id=admin.id,
                    message=final_msg
                )
                db.add(end_notif)
            
            db.commit()

    except Exception as e:
        print(f"Startup background indexing failed: {e}")
    finally:
        db.close()

def background_index_item(hardware_id: int, user_id: str):
    """Runs in background tasks upon single-item creation. Opens its own DB session."""
    db = SessionLocal()
    try:
        item = db.query(HardwareItem).filter(HardwareItem.id == hardware_id).first()
        if not item:
            return

        pattern = r"(?i)\b(test|demo|dummy|placeholder|fake)"
        combined_text = f"{item.name} {item.brand} {item.serial_number}"
        if re.search(pattern, combined_text):
            return

        admins = db.query(User).filter(User.role == RoleEnum.ADMIN).all()

        for admin in admins:
            start_notif = Notification(
                user_id=admin.id,
                message=f"AI Search: Started indexing {item.name}"
            )
            db.add(start_notif)
        db.commit()

        try:
            description = generate_hardware_description(item)
            embedding_vector = get_embedding(description)

            if embedding_vector:
                item.embedding = embedding_vector
                final_msg = f"AI Search: Successfully indexed {item.name}."
            else:
                final_msg = f"AI Search: Failed to index {item.name} (Empty response)."
        except Exception as e:
            final_msg = f"AI Search Error: Could not index {item.name}. {str(e)}"

        for admin in admins:
            end_notif = Notification(
                user_id=admin.id,
                message=final_msg
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
                    message=f"AI Search Error: Could not index item {hardware_id}. {str(e)}"
                )
                db.add(notification)
            db.commit()
        except Exception:
            pass
    finally:
        db.close()