from core.security import hash_password, verify_password

def test_password_is_hashed():
    password = "TestPassword123!"
    hashed_password = hash_password(password)
    assert hashed_password != password
    assert hashed_password.startswith("$")  # Check if the hash starts with the expected prefix
    
def test_correct_password_verification():
    password = "TestPassword123!"
    hashed_password = hash_password(password)
    assert verify_password(password, hashed_password) is True
    
def test_incorrect_password_fails():
    password = "TestPassword123!"
    wrong_password = "WrongPassword123!"
    hashed_password = hash_password(password)
    assert verify_password(wrong_password, hashed_password) is False