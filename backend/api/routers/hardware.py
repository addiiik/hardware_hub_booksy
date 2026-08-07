import re
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Response, BackgroundTasks
from sqlalchemy.orm import Session
import models
import schemas
from core.database import get_db
from api.deps import get_current_user
from services import ai_service
from services import query_parser
from services.background_tasks import background_index_item

router = APIRouter(tags=["hardware"])

@router.get("/api/hardware", response_model=List[schemas.HardwareItemBasicResponse])
def get_hardware_items(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    items = (
        db.query(models.HardwareItem)
        .filter(models.HardwareItem.rentable == True)
        .all()
    )
    return items

@router.get("/api/admin/hardware", response_model=List[schemas.HardwareItemResponse])
def get_admin_hardware_items(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Admin role required"
        )

    items = db.query(models.HardwareItem).all()
    return items

@router.post("/api/hardware/{hardware_id}/notes", response_model=schemas.NoteResponse, status_code=status.HTTP_201_CREATED)
def add_note_to_hardware(
    hardware_id: int,
    request: schemas.NoteCreateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    item = db.query(models.HardwareItem).filter(models.HardwareItem.id == hardware_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Hardware item not found")

    new_note = models.Note(
        item_id=hardware_id,
        author_id=current_user.id,
        content=request.content
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note

@router.post("/api/admin/hardware/{hardware_id}/toggle-repair", response_model=schemas.HardwareItemResponse)
def toggle_hardware_repair(
    hardware_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    item = db.query(models.HardwareItem).filter(models.HardwareItem.id == hardware_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Hardware item not found")

    if item.status == models.StatusEnum.IN_REPAIR:
        active_repair = db.query(models.Repair).filter(
            models.Repair.item_id == hardware_id,
            models.Repair.repair_end_date.is_(None)
        ).first()

        if active_repair:
            active_repair.repair_end_date = datetime.now(timezone.utc)
        
        item.status = models.StatusEnum.AVAILABLE

    else:
        if item.status == models.StatusEnum.IN_USE:
            raise HTTPException(
                status_code=400, 
                detail="Cannot send item to repair while it is currently in use"
            )

        new_repair = models.Repair(
            item_id=hardware_id,
            repair_start_date=datetime.now(timezone.utc)
        )
        db.add(new_repair)
        item.status = models.StatusEnum.IN_REPAIR

    db.commit()
    db.refresh(item)
    return item

@router.post("/api/hardware/{hardware_id}/toggle-rent", response_model=schemas.HardwareItemResponse)
def toggle_hardware_rent(
    hardware_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    item = db.query(models.HardwareItem).filter(models.HardwareItem.id == hardware_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Hardware item not found")

    if item.status == models.StatusEnum.IN_REPAIR:
        raise HTTPException(status_code=400, detail="Cannot rent an item that is currently in repair")

    active_rental = db.query(models.Rental).filter(
        models.Rental.item_id == hardware_id,
        models.Rental.returned_at.is_(None)
    ).first()

    if item.status == models.StatusEnum.IN_USE:
        if not active_rental:
            raise HTTPException(status_code=400, detail="No active rental found for this item")

        if active_rental.user_id != current_user.id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to return this rental")
            
        active_rental.returned_at = datetime.now(timezone.utc)
        item.status = models.StatusEnum.AVAILABLE

    else:
        if not item.rentable:
            raise HTTPException(status_code=400, detail="This item is marked as non-rentable")

        if active_rental:
            raise HTTPException(status_code=400, detail="Item is already rented")

        new_rental = models.Rental(
            user_id=current_user.id,
            item_id=hardware_id,
            rented_at=datetime.now(timezone.utc)
        )
        db.add(new_rental)
        item.status = models.StatusEnum.IN_USE

    db.commit()
    db.refresh(item)
    return item

@router.post("/api/admin/hardware", response_model=schemas.HardwareItemResponse, status_code=status.HTTP_201_CREATED)
def create_hardware_item(
    request: schemas.HardwareCreateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Admin role required"
        )

    existing_item = db.query(models.HardwareItem).filter(
        models.HardwareItem.serial_number == request.serial_number
    ).first()
    
    if existing_item:
        raise HTTPException(
            status_code=400,
            detail=f"Hardware with serial number '{request.serial_number}' already exists"
        )

    new_item = models.HardwareItem(
        name=request.device_name,
        serial_number=request.serial_number,
        brand=request.brand,
        category=request.category,
        status=request.status,
        purchase_date=request.purchase_date,
        rentable=request.rentable
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    background_tasks.add_task(background_index_item, new_item.id, current_user.id)

    return new_item

@router.delete("/api/admin/hardware/{hardware_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hardware(
    hardware_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    item = db.query(models.HardwareItem).filter(models.HardwareItem.id == hardware_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Hardware item not found")

    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post("/api/admin/hardware/{hardware_id}/index-ai", response_model=schemas.HardwareItemResponse)
def index_hardware_for_ai(
    hardware_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    item = db.query(models.HardwareItem).filter(models.HardwareItem.id == hardware_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Hardware item not found")

    if not item.rentable:
        raise HTTPException(
            status_code=400,
            detail="Non-rentable items cannot be indexed"
        )

    pattern = r"(?i)\b(test|demo|dummy|placeholder|fake)"
    combined_text = f"{item.name} {item.brand} {item.serial_number}"
    
    if re.search(pattern, combined_text):
        raise HTTPException(
            status_code=400, 
            detail="Placeholder items cannot be indexed"
        )

    try:
        description = ai_service.generate_hardware_description(item)
        embedding_vector = ai_service.get_embedding(description)
        
        if not embedding_vector:
            raise HTTPException(status_code=500, detail="Google API returned an empty vector.")

        item.embedding = embedding_vector
        db.commit()
        db.refresh(item)
        
        return item
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Indexing failed: {str(e)}")

@router.get("/api/hardware/ai-search", response_model=List[schemas.HardwareItemBasicResponse])
def ai_search_hardware(
    query: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not query.strip():
        return []

    parsed = query_parser.parse_search_query(query)

    base_query = db.query(models.HardwareItem).filter(
        models.HardwareItem.rentable == True,
        models.HardwareItem.status == models.StatusEnum.AVAILABLE,
    )

    if parsed["category"]:
        base_query = base_query.filter(models.HardwareItem.category == parsed["category"])
    if parsed["brand"]:
        base_query = base_query.filter(models.HardwareItem.brand.ilike(parsed["brand"]))
    if parsed["purchased_after"]:
        base_query = base_query.filter(models.HardwareItem.purchase_date >= parsed["purchased_after"])
    if parsed["purchased_before"]:
        base_query = base_query.filter(models.HardwareItem.purchase_date <= parsed["purchased_before"])

    semantic_query = (parsed["semantic_query"] or "").strip()

    if not semantic_query:
        return (
            base_query.order_by(models.HardwareItem.purchase_date.desc())
            .limit(10)
            .all()
        )

    candidates = base_query.filter(models.HardwareItem.embedding.is_not(None)).all()

    if not candidates:
        return []

    query_vector = ai_service.get_embedding(semantic_query)

    if not query_vector:
        raise HTTPException(status_code=500, detail="Failed to generate AI search query")

    scored_items = []
    for item in candidates:
        score = ai_service.cosine_similarity(query_vector, item.embedding)
        if score >= 0.65:
            scored_items.append((score, item))

    scored_items.sort(key=lambda x: x[0], reverse=True)

    top_items = [item for _, item in scored_items[:10]]

    return top_items