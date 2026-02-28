import bcrypt

password = "admin123"
salt = bcrypt.gensalt(rounds=12)
hashed = bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

print(f"Password: {password}")
print(f"Hash: {hashed}")
print(f"Hash length: {len(hashed)}")

# Test verification
test_result = bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
print(f"Verification test: {test_result}")
