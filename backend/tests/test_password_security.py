from core.security import hash_password, verify_password, validate_password
import pytest

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

def test_valid_password_policy():
    assert validate_password("TestPassword123!") is True

def test_password_too_short():
    assert validate_password("Test1!") is False

def test_password_requires_uppercase():
    assert validate_password("testpassword123!") is False

def test_password_requires_lowercase():
    assert validate_password("TESTPASSWORD123!") is False

def test_password_requires_number():
    assert validate_password("TestPassword!") is False

def test_password_requires_special_character():
    assert validate_password("TestPassword123") is False

def test_hash_password_rejects_invalid_password():
    with pytest.raises(ValueError):
        hash_password("weak")  # Too short