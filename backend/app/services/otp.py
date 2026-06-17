import secrets
import redis.asyncio as aioredis
from app.core.config import settings

def get_redis_client() -> aioredis.Redis:
    return aioredis.from_url(settings.REDIS_URL, decode_responses=True)

async def generate_and_store_otp(email: str) -> str:
    """
    Generates a secure 6-digit OTP, stores it in Redis with a 15-minute (900 seconds) expiry,
    and returns the OTP.
    """
    otp = f"{secrets.randbelow(900000) + 100000}"
    client = get_redis_client()
    key = f"otp:{email}"
    try:
        await client.setex(key, 900, otp)
    finally:
        await client.aclose()
    return otp

async def verify_otp(email: str, otp: str) -> bool:
    """
    Verifies the OTP stored in Redis for the given email.
    If it matches, deletes the key and returns True. Otherwise, returns False.
    """
    client = get_redis_client()
    key = f"otp:{email}"
    try:
        stored_otp = await client.get(key)
        if stored_otp and stored_otp == otp:
            await client.delete(key)
            return True
    finally:
        await client.aclose()
    return False

async def is_resend_rate_limited(email: str) -> bool:
    """
    Checks if the resend limit is active for the given email (within 60 seconds).
    """
    client = get_redis_client()
    limit_key = f"otp_limit:{email}"
    try:
        exists = await client.exists(limit_key)
        return exists > 0
    finally:
        await client.aclose()

async def set_resend_rate_limit(email: str):
    """
    Sets a resend rate limit flag in Redis for 60 seconds.
    """
    client = get_redis_client()
    limit_key = f"otp_limit:{email}"
    try:
        await client.setex(limit_key, 60, "1")
    finally:
        await client.aclose()

async def get_otp_ttl(email: str) -> int:
    """
    Gets the remaining TTL of the OTP key in seconds.
    Returns 0 if key not found or expired.
    """
    client = get_redis_client()
    key = f"otp:{email}"
    try:
        ttl = await client.ttl(key)
        return max(0, ttl)
    finally:
        await client.aclose()
