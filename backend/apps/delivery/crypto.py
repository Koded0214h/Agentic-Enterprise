"""Symmetric encryption for stored integration tokens.

Mirrors the Fernet-from-SECRET_KEY scheme already used for LLMProviderConfig
so token storage is consistent across the codebase.
"""
import base64

from django.conf import settings


def _fernet_key() -> bytes:
    raw = settings.SECRET_KEY[:32].encode().ljust(32, b"0")
    return base64.urlsafe_b64encode(raw)


def encrypt_secret(plaintext: str) -> str:
    from cryptography.fernet import Fernet

    return Fernet(_fernet_key()).encrypt(plaintext.encode()).decode()


def decrypt_secret(ciphertext: str) -> str:
    from cryptography.fernet import Fernet

    return Fernet(_fernet_key()).decrypt(ciphertext.encode()).decode()
