from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text('ALTER TABLE admins ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)'))
    conn.execute(text('ALTER TABLE admins ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP'))
    conn.commit()
    print('Migration done')
