"""
Kinks Flask Application
A chatbot powered by Mistral AI with sentiment analysis and Firebase integration
Designed for deployment on Cloudflare Workers/Pages
"""
import os
from flask import Flask, request, jsonify, render_template
from mistralai import Mistral
from flask_cors import CORS 
import firebase_admin
from firebase_admin import credentials, firestore, auth
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Initialize sentiment analyzer
analyzer = SentimentIntensityAnalyzer()

def get_sentiment_label(text):
    """Simple VADER-based sentiment analysis for animations"""
    scores = analyzer.polarity_scores(text)
    compound = scores['compound']
    if compound >= 0.5:
        return 'happy'
    elif compound >= 0.2:
        return 'laughing'
    elif compound > -0.2:
        return 'neutral'
    elif compound > -0.5:
        return 'sad'
    else:
        return 'shocked'

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
if not MISTRAL_API_KEY:
    raise ValueError("MISTRAL_API_KEY environment variable not set.")

# Initialize Mistral client
client = Mistral(api_key=MISTRAL_API_KEY)
AGENT_ID = "ag:7692f659:20250710:kinks:34dcf0d7"

# Initialize Firebase
firebase_cert_path = os.getenv('FIREBASE_CERT_PATH', 'afroheads-d9e1a-firebase-adminsdk-fbsvc-c2f4243995.json')
if os.path.exists(firebase_cert_path):
    cred = credentials.Certificate(firebase_cert_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
else:
    print("Warning: Firebase credentials not found. Firebase features will be disabled.")
    db = None

@app.route('/')
def index():
    """Home page"""
    return render_template('index.html')

@app.route('/health')
def health():
    """Health check endpoint for Cloudflare"""
    return jsonify({"status": "healthy", "service": "Kinks AI Assistant"}), 200

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    data = request.json
    query = data.get('query')
    history = data.get('history', [])
    user_token = data.get('user_token')
    turnstile_token = data.get('cf_turnstile_token')
    
    if not query:
        return jsonify({"error": "Query parameter is missing"}), 400
    
    # Verify Cloudflare Turnstile token if provided
    if turnstile_token:
        if not verify_turnstile(turnstile_token):
            return jsonify({"error": "Bot verification failed"}), 403
    
    try:
        # Handle authentication if token is provided
        user_id = None
        user_profile = {}
        
        if user_token and db:
            try:
                decoded_token = auth.verify_id_token(user_token)
                user_id = decoded_token['uid']
                user_profile = get_user_profile(user_id)
            except auth.InvalidIdTokenError:
                return jsonify({"error": "Invalid authentication token"}), 401
        
        # Construct the system message with profile info
        system_message = create_system_message_with_profile(user_profile)
        
        # Construct the full messages list for Mistral AI
        messages_for_mistral = []
        
        if system_message:
            messages_for_mistral.append({"role": "system", "content": system_message})
        
        # Add conversation history
        for msg in history:
            role = 'assistant' if msg['role'] == 'kinks' else msg['role']
            messages_for_mistral.append({"role": role, "content": msg["content"]})
       
        # Add the current user query
        current_query = query
        if system_message and not history:  # Only for the first message
            current_query = f"{system_message}\n\nUser query: {query}"
        
        messages_for_mistral.append({"role": "user", "content": current_query})
        
        # Call Mistral API
        chat_response = client.agents.complete(
            agent_id=AGENT_ID,
            messages=messages_for_mistral,
        )
        
        ai_response = chat_response.choices[0].message.content
        
        # Get sentiment using VADER
        sentiment = get_sentiment_label(query)
        
        print(f"Query: {query}")
        print(f"AI response: {ai_response}")
        print(f"Detected sentiment: {sentiment}")
        
        return jsonify({
            "response": ai_response, 
            "sentiment": sentiment,
            "status": "success"
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({
            "error": "Failed to get response from AI", 
            "details": str(e)
        }), 500

@app.route('/api/ask_kinks', methods=['POST'])
def ask_kinks():
    """Legacy endpoint for backward compatibility"""
    return chat()

def get_user_profile(user_id):
    """Retrieve user profile from Firestore"""
    if not db:
        return {}
    
    try:
        user_doc = db.collection('users').document(user_id).get()
        if user_doc.exists:
            return user_doc.to_dict()
        return {}
    except Exception as e:
        print(f"Error fetching user profile: {e}")
        return {}

def verify_turnstile(token):
    """Verify Cloudflare Turnstile token"""
    secret_key = os.getenv('CLOUDFLARE_TURNSTILE_SECRET_KEY')
    if not secret_key:
        return True  # Skip verification if not configured
    
    try:
        import requests
        response = requests.post(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            data={
                'secret': secret_key,
                'response': token
            }
        )
        result = response.json()
        return result.get('success', False)
    except Exception as e:
        print(f"Turnstile verification error: {e}")
        return True  # Allow on error to not break functionality

def create_system_message_with_profile(profile):
    """Create a system message with user profile information"""
    if not profile:
        return None
    
    profile_info = []
    
    # Add gender if available
    gender = profile.get('gender')
    if gender and gender != 'Prefer not to say':
        profile_info.append(f"Gender: {gender}")
    
    # Add hair type if available
    hair_type = profile.get('hairType')
    if hair_type:
        profile_info.append(f"Hair type: {hair_type}")
    
    # Add other relevant profile info
    username = profile.get('username')
    if username:
        profile_info.append(f"Username: {username}")
    
    if not profile_info:
        return None
    
    # Create the system message
    system_message = (
        "You are Kinks, an AI assistant specialized in hair care and styling. "
        "Here is the user's profile information that you should consider when providing personalized advice:\n\n" +
        "\n".join(profile_info) +
        "\n\nDo not explicitly mention that you have access to this profile information "
        "unless the user asks about their profile."
    )
    
    return system_message

# Cloudflare Workers compatibility
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=os.getenv('FLASK_ENV') == 'development', host='0.0.0.0', port=port)
