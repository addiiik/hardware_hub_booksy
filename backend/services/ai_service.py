import os
import numpy as np
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def generate_hardware_description(item) -> str:
    name = getattr(item, 'name', '')
    brand = getattr(item, 'brand', '')
    category = getattr(item, 'category', '')
    
    cat_upper = str(category).upper() if category else ""
    
    desc = f"Device: {name}. Brand: {brand}. Category: {category}."

    if cat_upper in ["SMARTPHONE", "TABLET"]:
        is_apple = str(brand).lower() == "apple"
        os_type = "iOS/iPadOS" if is_apple else "Android"
        desc += f" Ecosystem: {os_type}. Use case: Mobile app testing, responsive web design, mobile QA."
        if is_apple:
            desc += " Suitable for testing iOS/iPadOS apps on real Apple hardware."
        else:
            desc += " Suitable for testing Android apps on real hardware."

    elif cat_upper in ["LAPTOP", "OTHER"]:
        is_apple = str(brand).lower() == "apple"
        os_type = "macOS" if is_apple else "Windows/Linux/PC"
        desc += f" Ecosystem: {os_type}. Use case: Software development, heavy processing, general computing."
        if is_apple:
            desc += " Can run Xcode to build, simulate, and test iOS/iPadOS apps."
    
    elif cat_upper == "AUDIO":
        desc += " Use case: Audio recording, video conferencing, meetings, sound mixing, media consumption."
        
    elif cat_upper == "MONITOR":
        desc += " Use case: Visual display, screen extension, UI/UX design work, multi-tasking."
        
    elif cat_upper == "NETWORKING":
        desc += " Use case: Internet routing, local network setup, Wi-Fi connectivity, infrastructure testing."
        
    else:
        desc += " Use case: Workstation setup, user input, general hardware support, charging."

    return desc

def get_embedding(text: str) -> list[float]:
    try:
        result = client.models.embed_content(
            model="gemini-embedding-2",
            contents=text,
            config=types.EmbedContentConfig(
                task_type="SEMANTIC_SIMILARITY"
            )
        )
        return result.embeddings[0].values
    except Exception as e:
        print(f"Error getting embedding: {e}")
        return []

def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    a = np.array(vec_a)
    b = np.array(vec_b)
    if a.size == 0 or b.size == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))