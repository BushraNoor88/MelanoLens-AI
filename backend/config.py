"""Central configuration for MelanoLens AI.

Every value can be overridden with an environment variable (or a .env file),
so you never need to edit the code to change limits or folders.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent  # the melanolens-ai/ folder


def _path(env_name: str, default: Path) -> Path:
    value = os.getenv(env_name)
    if not value:
        return default
    p = Path(value)
    return p if p.is_absolute() else BASE_DIR / p


class Config:
    APP_NAME = "MelanoLens AI"
    MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "10"))
    MAX_CONTENT_LENGTH = MAX_UPLOAD_MB * 1024 * 1024  # Flask rejects bigger requests
    ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
    MIN_IMAGE_SIDE = 32
    MAX_IMAGE_SIDE = int(os.getenv("MAX_IMAGE_SIDE", "1024"))  # larger images are resized
    ISIC_DIR = _path("ISIC_DIR", BASE_DIR / "data" / "isic")
    RESULTS_DIR = _path("RESULTS_DIR", BASE_DIR / "data" / "results")
    FRONTEND_DIR = BASE_DIR / "frontend"
