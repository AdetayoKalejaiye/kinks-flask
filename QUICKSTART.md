# Quick Start Guide - Kinks Flask App

## What You Have

You now have a complete, standalone Flask application for the Kinks AI Assistant that can be deployed to Cloudflare Workers/Pages. This is a separate, independent application extracted from the afroheads_flutter project.

## Directory Location

```
c:\Users\OPOLO\Documents\AfroHeads\kinks_flask\
```

## What's Included

✅ **Complete Flask Application** (`app.py`)
✅ **Responsive Web Interface** (HTML/CSS/JS)
✅ **Mistral AI Integration** (Chat functionality)
✅ **VADER Sentiment Analysis** (Emotion detection)
✅ **Firebase Authentication** (User profiles)
✅ **Docker Configuration** (Easy deployment)
✅ **Cloudflare Workers Setup** (Edge deployment)
✅ **CI/CD Pipeline** (GitHub Actions)
✅ **Comprehensive Tests** (pytest)
✅ **API Documentation** (API.md)
✅ **Deployment Guide** (DEPLOYMENT.md)
✅ **Kinks Character Images** (All 5 poses copied)

## Before You Start

### 1. Get Required API Keys

You need these credentials:

- **Mistral AI API Key**: Get from https://console.mistral.ai/
- **Firebase Service Account**: Download from Firebase Console
- **Cloudflare Account**: Create at https://cloudflare.com/ (for deployment)

### 2. Copy Firebase Credentials

Copy your Firebase service account JSON file to the project root:

```powershell
Copy-Item "path\to\your\firebase-credentials.json" "c:\Users\OPOLO\Documents\AfroHeads\kinks_flask\"
```

Or use the existing one from the Flutter project:

```powershell
Copy-Item "c:\Users\OPOLO\Documents\AfroHeads\afroheads_flutter\afroheads-d9e1a-firebase-adminsdk-fbsvc-c2f4243995.json" "c:\Users\OPOLO\Documents\AfroHeads\kinks_flask\"
```

## Quick Start (3 Steps)

### Step 1: Configure Environment

```powershell
cd c:\Users\OPOLO\Documents\AfroHeads\kinks_flask
Copy-Item .env.example .env
notepad .env
```

Edit `.env` and add your API keys:
```
MISTRAL_API_KEY=your_actual_mistral_api_key
FIREBASE_CERT_PATH=afroheads-d9e1a-firebase-adminsdk-fbsvc-c2f4243995.json
```

### Step 2: Run the App

```powershell
.\start.ps1
```

This will:
- Create a virtual environment
- Install dependencies
- Start the Flask server

### Step 3: Open in Browser

Visit: http://localhost:5000

You should see the Kinks chat interface!

## What Next?

### Test It Out
1. Type a message in the chat
2. Watch Kinks respond with AI-powered answers
3. Notice the character pose changes based on sentiment

### Explore the Code
- `app.py` - Main Flask application
- `static/` - Frontend assets (CSS, JS, images)
- `templates/` - HTML templates
- `tests/` - Unit and integration tests

### Deploy to Production

See `DEPLOYMENT.md` for detailed deployment instructions:

**Option 1: Cloudflare + Cloud Run (Recommended)**
```bash
# Deploy backend to Google Cloud Run
gcloud run deploy kinks-flask --source .

# Deploy worker to Cloudflare
npm install
npm run deploy
```

**Option 2: Docker**
```bash
docker-compose up --build
```

**Option 3: Heroku/Railway**
```bash
# Just connect your Git repo and deploy
```

## Features Overview

### 🤖 AI-Powered Chat
- Uses Mistral AI agent specifically trained for hair care
- Maintains conversation context
- Personalized responses based on user profile

### 😊 Sentiment Analysis
- Detects emotions from user messages
- Changes Kinks character pose accordingly
- 5 emotions: happy, laughing, neutral, sad, shocked

### 🔐 Firebase Integration
- Optional user authentication
- Profile-based personalization
- Secure token verification

### 🎨 Beautiful UI
- Responsive design (works on mobile)
- Animated character
- Smooth transitions
- Chat history persistence

### ☁️ Cloudflare Ready
- Edge caching for fast responses
- Global CDN for static assets
- Workers for serverless deployment
- Automatic SSL/TLS

## Project Structure

```
kinks_flask/
├── 📄 app.py                    # Main application
├── 📋 requirements.txt          # Python dependencies
├── 🐳 Dockerfile               # Docker config
├── ⚙️ wrangler.toml            # Cloudflare config
├── 📝 README.md                # Main documentation
├── 📚 API.md                   # API documentation
├── 🚀 DEPLOYMENT.md            # Deployment guide
├── 📓 NOTES.md                 # Project notes
├── 🎨 static/                  # Frontend assets
│   ├── css/style.css
│   ├── js/main.js
│   └── images/
│       ├── afro_logo.png
│       └── poses/              # Kinks character (5 poses)
├── 🌐 templates/               # HTML templates
│   └── index.html
├── 🧪 tests/                   # Test suite
├── ☁️ src/                     # Cloudflare Worker
└── 🔧 .github/workflows/       # CI/CD pipeline
```

## Troubleshooting

### "Module not found" errors
```powershell
pip install -r requirements.txt
```

### "Firebase credentials not found"
```powershell
# Copy your Firebase JSON file to project root
# Update .env with correct path
```

### "Mistral API error"
- Check your API key in `.env`
- Verify you have API credits
- Check Mistral dashboard for issues

### Port 5000 already in use
```powershell
# Edit .env and change PORT
PORT=8000
```

### Can't activate virtual environment
```powershell
# Allow scripts to run (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Testing

Run the test suite:

```powershell
pip install -r tests/requirements-test.txt
pytest tests/ -v
```

With coverage:

```powershell
pytest tests/ --cov=app --cov-report=html
```

## API Testing

Test the API directly:

```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:5000/health"

# Chat
$body = @{
    query = "How do I care for 4C hair?"
    history = @()
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/chat" -Method Post -Body $body -ContentType "application/json"
```

## Documentation

- **README.md** - Overview and setup
- **API.md** - Complete API documentation
- **DEPLOYMENT.md** - Deployment guide for various platforms
- **NOTES.md** - Development notes and architecture

## Need Help?

1. Check the documentation files
2. Review test examples in `tests/`
3. Check GitHub issues (once repo is set up)
4. Contact: support@afroheads.com

## Next Steps

1. ✅ Set up environment variables
2. ✅ Run locally and test
3. 📦 Deploy to production
4. 📊 Set up monitoring
5. 🔒 Configure security
6. 🚀 Launch!

## Useful Commands

```powershell
# Start development server
.\start.ps1

# Run tests
pytest tests/

# Build Docker image
docker build -t kinks-flask .

# Run with Docker
docker-compose up

# Deploy to Cloudflare
npm run deploy

# View logs
wrangler tail

# Format code
black .
isort .
```

## Contributing

This is a standalone project. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License - See LICENSE file

---

**You're all set!** 🎉

Run `.\start.ps1` and start chatting with Kinks!
