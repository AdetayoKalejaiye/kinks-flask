# Kinks Flask API Documentation

## Base URL

- Development: `http://localhost:5000`
- Production: `https://kinks.yourdomain.com`

## Authentication

Most endpoints are public, but user-specific features require Firebase authentication.

### Headers

```
Content-Type: application/json
Authorization: Bearer <firebase_token> (optional)
```

---

## Endpoints

### 1. Health Check

Check if the service is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "service": "Kinks AI Assistant"
}
```

**Status Codes:**
- `200 OK` - Service is healthy

---

### 2. Home Page

Render the main chat interface.

**Endpoint:** `GET /`

**Response:** HTML page with chat interface

---

### 3. Chat (Primary Endpoint)

Send a message to Kinks and receive an AI-generated response.

**Endpoint:** `POST /api/chat`

**Request Body:**
```json
{
  "query": "How do I take care of 4C hair?",
  "history": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "kinks",
      "content": "Hi! How can I help you today?"
    }
  ],
  "user_token": "optional_firebase_id_token"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| query | string | Yes | The user's message/question |
| history | array | No | Previous conversation messages |
| user_token | string | No | Firebase ID token for authenticated users |

**Response:**
```json
{
  "response": "4C hair requires moisture and gentle handling. Here are some tips...",
  "sentiment": "neutral",
  "status": "success"
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| response | string | AI-generated response from Kinks |
| sentiment | string | Detected emotion: happy, laughing, neutral, sad, shocked |
| status | string | Request status: success |

**Status Codes:**
- `200 OK` - Successful response
- `400 Bad Request` - Missing query parameter
- `401 Unauthorized` - Invalid user token
- `500 Internal Server Error` - Server or API error

**Example using cURL:**
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What products are good for twist outs?",
    "history": []
  }'
```

**Example using Python:**
```python
import requests

response = requests.post(
    'http://localhost:5000/api/chat',
    json={
        'query': 'How often should I wash my hair?',
        'history': []
    }
)

data = response.json()
print(data['response'])
print(f"Sentiment: {data['sentiment']}")
```

**Example using JavaScript:**
```javascript
fetch('http://localhost:5000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'What is the best way to detangle hair?',
    history: []
  })
})
.then(response => response.json())
.then(data => {
  console.log(data.response);
  console.log('Sentiment:', data.sentiment);
});
```

---

### 4. Ask Kinks (Legacy Endpoint)

Legacy endpoint for backward compatibility. Behaves identically to `/api/chat`.

**Endpoint:** `POST /api/ask_kinks`

**Request/Response:** Same as `/api/chat`

---

## Conversation History Format

The `history` array should contain previous messages in chronological order.

**Structure:**
```json
[
  {
    "role": "user",
    "content": "First user message"
  },
  {
    "role": "kinks",
    "content": "First Kinks response"
  },
  {
    "role": "user",
    "content": "Second user message"
  }
]
```

**Roles:**
- `user` - Messages from the user
- `kinks` - Messages from the AI assistant
- `assistant` - Alternative to "kinks" (automatically converted)

---

## Sentiment Analysis

Kinks uses VADER sentiment analysis to detect emotions from user messages.

**Sentiment Labels:**

| Label | Score Range | Description | Character Pose |
|-------|-------------|-------------|----------------|
| happy | ≥ 0.5 | Very positive sentiment | Happy face |
| laughing | ≥ 0.2 | Positive sentiment | Laughing face |
| neutral | > -0.2 | Neutral sentiment | Neutral face |
| sad | > -0.5 | Negative sentiment | Sad face |
| shocked | ≤ -0.5 | Very negative sentiment | Shocked face |

**Examples:**
- "I love this so much!" → happy
- "This is great!" → laughing
- "How do I do this?" → neutral
- "I'm not sure about this" → sad
- "This is terrible!" → shocked

---

## Authentication (Optional)

For personalized responses, include a Firebase ID token.

### Getting a Firebase Token

```javascript
// In your frontend app
firebase.auth().currentUser.getIdToken()
  .then(token => {
    // Use this token in API requests
  });
```

### Using the Token

```json
{
  "query": "What's best for my hair type?",
  "user_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Benefits of Authentication:**
- Personalized responses based on user profile
- Hair type-specific advice
- Gender-aware recommendations
- Conversation history persistence

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error description",
  "details": "Additional error information"
}
```

**Common Error Codes:**

| Code | Description | Solution |
|------|-------------|----------|
| 400 | Bad Request | Check request body format |
| 401 | Unauthorized | Verify Firebase token |
| 429 | Too Many Requests | Implement rate limiting/retry |
| 500 | Internal Server Error | Check server logs |
| 503 | Service Unavailable | Retry after delay |

---

## Rate Limiting

To prevent abuse, consider implementing rate limiting:

**Recommended Limits:**
- Anonymous users: 10 requests/minute
- Authenticated users: 30 requests/minute

**Rate Limit Headers (if implemented):**
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1640995200
```

---

## CORS Policy

The API supports CORS for web applications.

**Allowed Origins:** `*` (development) or specific domains (production)

**Allowed Methods:** `GET, POST, OPTIONS`

**Allowed Headers:** `Content-Type, Authorization`

---

## Versioning

Current API version: `v1`

Future versions may be introduced with path prefixes:
- `v1` - `/api/chat` (current)
- `v2` - `/api/v2/chat` (future)

---

## Best Practices

### 1. Maintain Conversation Context

Include recent conversation history (last 5-10 messages) for better responses:

```json
{
  "query": "What about protein treatments?",
  "history": [
    {"role": "user", "content": "I have 4C hair"},
    {"role": "kinks", "content": "Great! 4C hair needs..."}
  ]
}
```

### 2. Handle Errors Gracefully

```javascript
try {
  const response = await fetch('/api/chat', { /* ... */ });
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error);
  }
  
  // Use data.response
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly error message
}
```

### 3. Optimize Performance

- Cache common responses
- Debounce user input
- Show loading indicators
- Implement request timeouts

### 4. Respect User Privacy

- Don't log sensitive information
- Store tokens securely
- Clear history on logout
- Implement data deletion

---

## WebSocket Support (Future)

Real-time chat support via WebSockets is planned for future releases.

**Proposed Endpoint:** `wss://kinks.yourdomain.com/ws/chat`

---

## SDK Support

Official SDKs coming soon:
- JavaScript/TypeScript
- Python
- Swift (iOS)
- Kotlin (Android)

---

## Support & Feedback

- Documentation: https://docs.afroheads.com/kinks
- API Status: https://status.afroheads.com
- Support Email: support@afroheads.com
- GitHub Issues: https://github.com/afroheads/kinks-flask

---

## Changelog

### v1.0.0 (2025-01-21)
- Initial release
- Chat endpoint with Mistral AI integration
- Sentiment analysis
- Firebase authentication support
- Conversation history
