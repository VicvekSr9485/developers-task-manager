from pydantic import BaseModel, field_validator
from typing import Optional
import re


class TagCreate(BaseModel):
    name: str
    color: str = "#6366f1"

    @field_validator("color")
    @classmethod
    def validate_hex_color(cls, v: str) -> str:
        if not re.fullmatch(r"#[0-9A-Fa-f]{6}", v):
            raise ValueError("Color must be a valid 6-digit hex code e.g. #6366f1")
        return v.lower()

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Tag name cannot be empty")
        if len(v) > 50:
            raise ValueError("Tag name must be 50 characters or fewer")
        return v


class TagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None

    @field_validator("color")
    @classmethod
    def validate_hex_color(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not re.fullmatch(r"#[0-9A-Fa-f]{6}", v):
            raise ValueError("Color must be a valid 6-digit hex code e.g. #6366f1")
        return v.lower() if v else v


class TagOut(BaseModel):
    id: int
    name: str
    color: str
    user_id: int

    model_config = {"from_attributes": True}
