from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    allowed_origins: str = "http://localhost:4200"
    app_env: str = "development"

    @property
    def origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    model_config = {"env_file": ".env"}


settings = Settings()
