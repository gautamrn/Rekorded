import os
import requests
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from dotenv import load_dotenv

load_dotenv()

# Environment variables
CLERK_ISSUER = os.getenv("CLERK_ISSUER_URL") # e.g., https://clerk.your-domain.com
JWKS_URL = f"{CLERK_ISSUER}/.well-known/jwks.json" if CLERK_ISSUER else None

security = HTTPBearer()

# Global cache for JWKS
_jwks_cache = {}

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    if not CLERK_ISSUER:
        raise HTTPException(status_code=500, detail="CLERK_ISSUER_URL not configured")

    token = credentials.credentials
    
    try:
        # 1. Fetch JWKS (Cached)
        global _jwks_cache
        if not _jwks_cache:
            try:
                _jwks_cache = requests.get(JWKS_URL, timeout=5).json()
            except Exception as e:
                print(f"Failed to fetch JWKS: {e}")
                raise HTTPException(status_code=500, detail="Auth server unavailable")
        
        jwks = _jwks_cache
        
        # 2. Decode header to find key ID (kid)
        header = jwt.get_unverified_header(token)
        rsa_key = {}
        
        for key in jwks["keys"]:
            if key["kid"] == header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break
        
        if not rsa_key:
            raise HTTPException(status_code=401, detail="Unable to find appropriate key")
            
        # 3. Verify token
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=None, # Clerk tokens might not have audience or it matches
            issuer=CLERK_ISSUER
        )
        
        return payload # Contains 'sub' (User ID), etc.
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTClaimsError:
        raise HTTPException(status_code=401, detail="Incorrect claims. Please check the issuer and audience.")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Unable to parse authentication token: {str(e)}")

# Optional auth for guest uploads
security_optional = HTTPBearer(auto_error=False)

async def get_optional_current_user(credentials: HTTPAuthorizationCredentials = Security(security_optional)):
    if not credentials:
        return None
    return await get_current_user(credentials)

