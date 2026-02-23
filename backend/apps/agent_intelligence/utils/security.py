import base64
import os
from cryptography.fernet import Fernet
from django.conf import settings

class SecurityManager:
    """Utility for encrypting and decrypting sensitive data."""
    
    _fernet = None

    @classmethod
    def _get_fernet(cls):
        if cls._fernet is None:
            # Use SECRET_KEY as the base for the encryption key
            # Fernet key must be 32 url-safe base64-encoded bytes
            key = base64.urlsafe_b64encode(settings.SECRET_KEY[:32].encode().ljust(32, b'0'))
            cls._fernet = Fernet(key)
        return cls._fernet

    @classmethod
    def encrypt(cls, text: str) -> str:
        if not text:
            return ""
        f = cls._get_fernet()
        return f.encrypt(text.encode()).decode()

    @classmethod
    def decrypt(cls, token: str) -> str:
        if not token:
            return ""
        f = cls._get_fernet()
        return f.decrypt(token.encode()).decode()
