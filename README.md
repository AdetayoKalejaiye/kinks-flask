# Kinks AI Assistant - Flask Application

A sophisticated AI-powered chatbot for hair care advice, powered by Mistral AI and designed for deployment on Cloudflare Workers/Pages.

## Features

- 🤖 **AI-Powered Chat**: Uses Mistral AI agent for intelligent hair care conversations
- 😊 **Sentiment Analysis**: VADER sentiment analysis for emotion detection (happy, laughing, neutral, sad, shocked)
- 🔐 **Firebase Integration**: User authentication and profile management
- ☁️ **Cloudflare Ready**: Optimized for deployment on Cloudflare infrastructure
- 🎨 **Responsive UI**: Modern web interface with animated Kinks character
- 📱 **API First**: RESTful API design for easy integration

## Project Structure

```
kinks_flask/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose setup
├── wrangler.toml         # Cloudflare Workers config
├── .env.example          # Environment variables template
├── README.md             # This file
├── static/               # Static assets
│   ├── css/
│   ├── js/
│   └── images/
│       └── poses/        # Kinks character poses
├── templates/            # HTML templates
│   └── index.html
└── tests/                # Unit tests
```

## Quick Start

### Local Development

1. **Clone and navigate to the directory**:
```bash
cd kinks_flask
```

2. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

5. **Run the application**:
```bash
python app.py
```

Visit `http://localhost:5000`

### Using Docker

1. **Build and run**:
```bash
docker-compose up --build
```

2. **Access the app**:
```
http://localhost:5000
```

## Deployment to Cloudflare

### Option 1: Cloudflare Pages (Recommended)

1. **Install Wrangler CLI**:
```bash
npm install -g wrangler
```

2. **Login to Cloudflare**:
```bash
wrangler login
```

3. **Configure wrangler.toml**:
- Update `account_id` with your Cloudflare account ID
- Update routes with your domain

4. **Deploy**:
```bash
wrangler pages deploy
```

### Option 2: Cloudflare Workers

For Workers deployment, you'll need to adapt the Flask app to use a Python WASM runtime or create a proxy Worker that forwards requests to a containerized Flask app.

### Option 3: Cloudflare with Docker

Deploy the Dockerized Flask app to any cloud provider and use Cloudflare as a CDN/proxy:

1. Deploy to Google Cloud Run, AWS ECS, or Azure Container Instances
2. Point your Cloudflare DNS to the deployment
3. Enable Cloudflare proxy (orange cloud)

## API Documentation

### Health Check
```
GET /health
```
Returns service status.

### Chat Endpoint
```
POST /api/chat
Content-Type: application/json

{
  "query": "How do I take care of my 4C hair?",
  "history": [
    {"role": "user", "content": "Hello"},
    {"role": "kinks", "content": "Hi! How can I help you today?"}
  ],
  "user_token": "optional_firebase_token"
}
```

Response:
```json
{
  "response": "AI response here...",
  "sentiment": "happy",
  "status": "success"
}
```

### Legacy Endpoint
```
POST /api/ask_kinks
```
Same as `/api/chat` for backward compatibility.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MISTRAL_API_KEY` | Mistral AI API key | Yes |
| `MISTRAL_AGENT_ID` | Kinks agent ID | Yes |
| `FIREBASE_CERT_PATH` | Path to Firebase credentials | No |
| `FLASK_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 5000) | No |
| `SECRET_KEY` | Flask secret key | Recommended |

## Sentiment Labels

The app uses VADER sentiment analysis to detect emotions:

- **happy**: Compound score ≥ 0.5
- **laughing**: Compound score ≥ 0.2
- **neutral**: Compound score > -0.2
- **sad**: Compound score > -0.5
- **shocked**: Compound score ≤ -0.5

## Firebase Integration

The app supports optional Firebase authentication:

1. Place your Firebase service account JSON in the project root
2. Set `FIREBASE_CERT_PATH` in `.env`
3. Pass `user_token` in API requests for personalized responses

## Performance Optimization for Cloudflare

- Uses Cloudflare KV for caching responses
- Optimized static asset delivery via Cloudflare CDN
- Worker-based routing for low latency
- Supports WebSocket connections via Durable Objects (optional)

## Testing

```bash
pytest tests/
```

## Security Notes

- Never commit `.env` or Firebase credentials
- Use environment variables for all secrets
- Enable CORS only for trusted domains in production
- Implement rate limiting for production deployments

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: support@afroheads.com

## Acknowledgments

- Mistral AI for the conversational AI
- Firebase for authentication and database
- VADER for sentiment analysis
- Cloudflare for infrastructure
