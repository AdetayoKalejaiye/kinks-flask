# Kinks Flask App - Project Notes

## Project Overview
Standalone Flask application for the Kinks AI Assistant, extracted from the afroheads_flutter project and optimized for deployment on Cloudflare infrastructure.

## Key Features
- AI-powered chat using Mistral AI
- Sentiment analysis for emotion detection
- Firebase authentication and user profiles
- Responsive web interface with animated character
- RESTful API design
- Docker containerization
- Cloudflare Workers integration
- CI/CD pipeline with GitHub Actions

## Technology Stack

### Backend
- **Framework**: Flask 3.0
- **AI**: Mistral AI (Agent ID: ag:7692f659:20250710:kinks:34dcf0d7)
- **Sentiment Analysis**: VADER Sentiment
- **Authentication**: Firebase Admin SDK
- **Server**: Gunicorn (production)

### Frontend
- **HTML5/CSS3/JavaScript**
- **No framework** - Pure vanilla JS for simplicity
- **LocalStorage** for chat persistence
- **Fetch API** for HTTP requests

### Infrastructure
- **Cloudflare Workers**: Edge routing and caching
- **Cloudflare KV**: Session storage (optional)
- **Docker**: Containerization
- **Cloud Run/Lambda**: Backend hosting options

### DevOps
- **CI/CD**: GitHub Actions
- **Testing**: pytest
- **Linting**: flake8, black, isort
- **Monitoring**: Cloudflare Analytics

## File Structure
```
kinks_flask/
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker configuration
├── docker-compose.yml          # Docker Compose setup
├── wrangler.toml              # Cloudflare Workers config
├── package.json               # Node.js dependencies for Cloudflare
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── README.md                  # Project documentation
├── API.md                     # API documentation
├── DEPLOYMENT.md              # Deployment guide
├── LICENSE                    # MIT License
├── start.ps1                  # Windows start script
├── start.sh                   # Linux/Mac start script
├── src/
│   └── index.js              # Cloudflare Worker entry point
├── static/
│   ├── css/
│   │   └── style.css         # Main stylesheet
│   ├── js/
│   │   └── main.js           # Frontend JavaScript
│   └── images/
│       ├── afro_logo.png     # (to be copied)
│       └── poses/            # Kinks character poses
│           ├── happy.png
│           ├── laughing.png
│           ├── neutral.png
│           ├── sad.png
│           └── shocked.png
├── templates/
│   └── index.html            # Main chat interface
├── tests/
│   ├── conftest.py           # Test configuration
│   ├── test_app.py           # Unit tests
│   ├── test_integration.py   # Integration tests
│   └── requirements-test.txt # Test dependencies
└── .github/
    └── workflows/
        └── deploy.yml        # CI/CD pipeline
```

## Environment Variables

### Required
- `MISTRAL_API_KEY`: Mistral AI API key

### Optional
- `FIREBASE_CERT_PATH`: Path to Firebase service account JSON
- `FLASK_ENV`: development or production
- `PORT`: Server port (default: 5000)
- `SECRET_KEY`: Flask secret key
- `CLOUDFLARE_ACCOUNT_ID`: For Cloudflare deployment
- `CLOUDFLARE_API_TOKEN`: For Cloudflare deployment

## Deployment Options

1. **Cloudflare + Cloud Run** (Recommended)
   - Best performance
   - Global edge caching
   - Auto-scaling
   - Pay-per-use pricing

2. **Cloudflare + AWS Lambda**
   - Serverless architecture
   - AWS ecosystem integration
   - Container support

3. **Docker Standalone**
   - Deploy anywhere Docker runs
   - Full control
   - Simple setup

4. **Heroku/Railway/Render**
   - Quick deployment
   - Managed platform
   - Limited Cloudflare integration

## API Endpoints

- `GET /` - Chat interface (HTML)
- `GET /health` - Health check
- `POST /api/chat` - Main chat endpoint
- `POST /api/ask_kinks` - Legacy endpoint (same as /api/chat)

## Sentiment Detection

Uses VADER (Valence Aware Dictionary and sEntiment Reasoner):

- **happy**: Compound score ≥ 0.5
- **laughing**: Compound score ≥ 0.2
- **neutral**: Compound score > -0.2
- **sad**: Compound score > -0.5
- **shocked**: Compound score ≤ -0.5

## Character Poses

5 emotional states with corresponding images:
- happy.png
- laughing.png
- neutral.png
- sad.png
- shocked.png

Poses change based on user message sentiment.

## Future Enhancements

### Phase 1 (MVP)
- [x] Basic chat functionality
- [x] Sentiment analysis
- [x] Firebase integration
- [x] Responsive UI
- [ ] Copy Kinks pose images from Flutter app

### Phase 2 (Production Ready)
- [ ] Rate limiting
- [ ] Caching layer
- [ ] Enhanced error handling
- [ ] Monitoring dashboard
- [ ] Analytics integration

### Phase 3 (Advanced Features)
- [ ] WebSocket support for real-time chat
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Image analysis for hair photos
- [ ] Product recommendations
- [ ] Community features

### Phase 4 (Optimization)
- [ ] Response streaming
- [ ] Prefetch common queries
- [ ] CDN optimization
- [ ] Database for analytics
- [ ] A/B testing framework

## Known Issues

1. Firebase credentials need to be manually copied
2. Kinks pose images need to be copied from Flutter project
3. No rate limiting implemented yet
4. No request caching yet
5. CORS currently allows all origins (needs restriction for production)

## Development Notes

### Running Locally
```bash
# Windows
.\start.ps1

# Linux/Mac
chmod +x start.sh
./start.sh
```

### Running Tests
```bash
pip install -r tests/requirements-test.txt
pytest tests/ -v
```

### Building Docker Image
```bash
docker build -t kinks-flask .
docker run -p 5000:5000 kinks-flask
```

### Deploying to Cloudflare
```bash
npm install
wrangler login
wrangler deploy
```

## Security Considerations

1. **API Keys**: Never commit to repository
2. **CORS**: Restrict to specific domains in production
3. **Rate Limiting**: Implement to prevent abuse
4. **Input Validation**: Sanitize all user inputs
5. **HTTPS Only**: Enforce in production
6. **Token Verification**: Validate Firebase tokens properly
7. **Error Messages**: Don't expose sensitive info

## Performance Benchmarks

Target metrics:
- Response time: < 2s (p95)
- Uptime: > 99.9%
- Error rate: < 0.1%
- Cache hit ratio: > 70%

## Cost Estimates

Monthly costs (estimated):
- Cloudflare Workers: $5 (after free tier)
- Cloud Run: $10-50 (based on usage)
- Mistral AI: $20-100 (based on usage)
- Firebase: Free (under limits)
- **Total**: $35-155/month

## Contributing

See individual files for contribution guidelines:
- Code style: PEP 8 for Python
- Commit messages: Conventional Commits
- Pull requests: Required for main branch
- Tests: Required for new features

## License

MIT License - See LICENSE file

## Contact

- Project Lead: AfroHeads Team
- Email: support@afroheads.com
- Repository: https://github.com/afroheads/kinks-flask

## Acknowledgments

- Original implementation from afroheads_flutter project
- Mistral AI for conversational AI
- Firebase for authentication
- VADER Sentiment for emotion detection
- Cloudflare for infrastructure
