"""
Unit tests for Kinks Flask Application
"""
import pytest
import json
from app import app, get_sentiment_label, create_system_message_with_profile

@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'
    assert 'service' in data

def test_index_page(client):
    """Test index page loads"""
    response = client.get('/')
    assert response.status_code == 200
    assert b'Kinks AI Assistant' in response.data

def test_chat_endpoint_no_query(client):
    """Test chat endpoint without query parameter"""
    response = client.post('/api/chat',
                          json={},
                          content_type='application/json')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data

def test_sentiment_analysis():
    """Test sentiment analysis function"""
    # Happy sentiment
    assert get_sentiment_label("I love this so much! Amazing!") == 'happy'
    
    # Sad sentiment
    assert get_sentiment_label("This is terrible and awful") == 'sad'
    
    # Neutral sentiment
    assert get_sentiment_label("This is a statement") == 'neutral'

def test_create_system_message():
    """Test system message creation with profile"""
    profile = {
        'username': 'testuser',
        'gender': 'Female',
        'hairType': '4C'
    }
    
    message = create_system_message_with_profile(profile)
    assert message is not None
    assert 'testuser' in message
    assert 'Female' in message
    assert '4C' in message

def test_create_system_message_empty_profile():
    """Test system message with empty profile"""
    message = create_system_message_with_profile({})
    assert message is None

def test_create_system_message_prefer_not_to_say():
    """Test system message excludes 'Prefer not to say' gender"""
    profile = {
        'username': 'testuser',
        'gender': 'Prefer not to say',
        'hairType': '4C'
    }
    
    message = create_system_message_with_profile(profile)
    assert 'Prefer not to say' not in message
    assert 'testuser' in message
    assert '4C' in message

def test_legacy_endpoint(client):
    """Test legacy ask_kinks endpoint"""
    response = client.post('/api/ask_kinks',
                          json={},
                          content_type='application/json')
    # Should behave same as /api/chat
    assert response.status_code == 400
