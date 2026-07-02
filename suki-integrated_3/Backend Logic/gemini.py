import os
from google import genai
from dotenv import load_dotenv

#SET AS TRUE WHEN API KEY IS PRESENT
GEMINI_OPEN = True

load_dotenv("suki-integrated_3\Backend Logic\.env .example")

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def convert_query_to_product(user_query: str):
    prompt = f"""
You're a query normalizer for a product search application.
You're job is to extract the specific grocery/hardware/market product from this query into exactly ONE product name

Rules:
- If the query is just the ONE product name, then don't change anything
- If the query is a sentence or a question, return only ONE product name relevant to the query
- If the query could possible mean multiple ingredients or items, prioritize choosing the most likely or commonly associated product
- Return only the product name
- No punctuation marks
- No explanation, notes or additional text
- If you cannot confidenty identify a product, return UNKNOWN

User query:
{user_query}
"""
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )

    return response.text.strip().lower()

def query_to_gemini_or_not(user_query:str):
    if GEMINI_OPEN == True:
        sentence_starters = ["where", "what", "how", "need", "buy", "find", "looking", "want", "can", "for"]
        proper_query = user_query.lower().split()
        
        search_key = user_query
        if any(word in sentence_starters for word in proper_query) or "?" in user_query or len(user_query)>25:
            search_key = convert_query_to_product(user_query)
        
        if search_key.lower() == "unknown":
            return user_query
        
        return search_key
    return user_query
    