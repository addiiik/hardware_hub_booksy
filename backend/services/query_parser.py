import json
import os
from datetime import date

from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

_MODEL_NAME = "gemini-3.5-flash"

_SEARCH_QUERY_SCHEMA = {
    "type": "object",
    "properties": {
        "semantic_query": {
            "type": "string",
            "description": (
                "The part of the request that describes a use case or "
                "vibe (e.g. 'something to test a mobile app on'). Empty "
                "string if the request is purely a structured filter with "
                "no descriptive component left over."
            ),
        },
        "category": {
            "type": "string",
            "enum": ["SMARTPHONE", "TABLET", "LAPTOP", "AUDIO", "MONITOR", "NETWORKING", "OTHER"],
            "nullable": True,
        },
        "brand": {"type": "string", "nullable": True},
        "purchased_after": {
            "type": "string",
            "nullable": True,
            "description": "ISO date YYYY-MM-DD, inclusive lower bound on purchaseDate.",
        },
        "purchased_before": {
            "type": "string",
            "nullable": True,
            "description": "ISO date YYYY-MM-DD, inclusive upper bound on purchaseDate.",
        },
    },
    "required": ["semantic_query"],
}

_SYSTEM_PROMPT = f"""Today's date is {date.today().isoformat()}.
You turn a natural-language hardware search request into a structured filter
plus a leftover semantic query.

Rules:
- Only set category or brand when the query names them LITERALLY (an
  explicit device-type word like "laptop"/"phone"/"monitor", or an
  explicit brand name like "Apple"/"Dell"). These become hard SQL filters,
  so a wrong guess here can hide correct results entirely.
- Do NOT infer category or brand from a platform, OS, ecosystem, or task
  even if you're confident about the real-world constraint. "iOS app" for
  example genuinely requires Apple hardware, but it doesn't map to one
  category -- a phone, a tablet, and a laptop (via Xcode) can all satisfy
  it. When a request depends on reasoning like that about which devices
  qualify, leave category and brand null and put the whole request in
  semantic_query -- that reasoning belongs to the embedding/ranking step,
  not to a filter that can only match one exact value.
- If the user gives a year or relative date ("bought in 2024", "newer
  than 2 years"), translate it into purchased_after / purchased_before --
  dates are unambiguous facts, unlike category/brand above.
- If a field isn't mentioned or isn't literal, leave it null.
"""

_FALLBACK_KEYS = ("semantic_query", "category", "brand", "purchased_after", "purchased_before")


def parse_search_query(query: str) -> dict:
    result = {
        "semantic_query": query,
        "category": None,
        "brand": None,
        "purchased_after": None,
        "purchased_before": None,
    }
    try:
        response = client.models.generate_content(
            model=_MODEL_NAME,
            contents=query,
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=_SEARCH_QUERY_SCHEMA,
            ),
        )
        parsed = json.loads(response.text)
        result.update({k: parsed[k] for k in _FALLBACK_KEYS if k in parsed})
        return result
    except Exception as e:
        print(f"Error parsing search query, falling back to semantic-only search: {e}")
        return result