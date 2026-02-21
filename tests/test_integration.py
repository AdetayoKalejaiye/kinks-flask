"""
Integration tests for Kinks Flask Application
"""
import pytest
import json
from unittest.mock import Mock, patch
from app import app

@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@patch('app.client.agents.complete')
def test_chat_endpoint_with_query(mock_mistral, client):
    """Test chat endpoint with valid query"""
    # Mock Mistral response
    mock_response = Mock()
    mock_response.choices = [Mock()]
    mock_response.choices[0].message.content = "Test response from Kinks"
    mock_mistral.return_value = mock_response
    
    response = client.post('/api/chat',
                          json={'query': 'How do I care for my hair?'},
                          content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'response' in data
    assert 'sentiment' in data
    assert data['status'] == 'success'

@patch('app.client.agents.complete')
def test_chat_with_history(mock_mistral, client):
    """Test chat endpoint with conversation history"""
    # Mock Mistral response
    mock_response = Mock()
    mock_response.choices = [Mock()]
    mock_response.choices[0].message.content = "Follow-up response"
    mock_mistral.return_value = mock_response
    
    history = [
        {"role": "user", "content": "Hello"},
        {"role": "kinks", "content": "Hi there!"}
    ]
    
    response = client.post('/api/chat',
                          json={
                              'query': 'Tell me more',
                              'history': history
                          },
                          content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'response' in data

@patch('app.client.agents.complete')
def test_chat_endpoint_error_handling(mock_mistral, client):
    """Test chat endpoint error handling"""
    # Mock Mistral to raise an exception
    mock_mistral.side_effect = Exception("API Error")
    
    response = client.post('/api/chat',
                          json={'query': 'Test query'},
                          content_type='application/json')
    
    assert response.status_code == 500
    data = json.loads(response.data)
    assert 'error' in data
