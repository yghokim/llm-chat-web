from fastapi import APIRouter
import tiktoken
from pydantic import BaseModel

router = APIRouter()

class TokenCountInput(BaseModel):
    text: str

@router.post('/count_tokens', response_model=int)
async def count_tokens(args: TokenCountInput) -> int:
    enc = tiktoken.get_encoding("gpt2")
    encoded = enc.encode(args.text)
    return len(encoded)
