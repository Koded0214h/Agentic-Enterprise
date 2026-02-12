import secrets
import string


def generate_agent_token(length=43):
    """
    Generate a secure, URL-safe token for agent authentication.
    Default length 43 gives ~256 bits of entropy.
    """
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def generate_agent_identity():
    """
    Create a full identity record. For MVP just a token.
    Can be extended to generate key pairs later.
    """
    return {
        "token": generate_agent_token(),
        "type": "bearer",
    }