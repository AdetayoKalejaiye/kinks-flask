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
