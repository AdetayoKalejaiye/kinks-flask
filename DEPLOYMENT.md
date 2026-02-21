# Deployment Guide for Kinks Flask App on Cloudflare

## Architecture Overview

```
User Request → Cloudflare Worker → Flask Backend (Container) → Response
              ↓
         Cloudflare CDN
         (Static Assets)
```

## Deployment Options

### Option 1: Cloudflare Workers + Cloud Run (Recommended)

This is the most scalable approach for production.

#### Step 1: Deploy Flask Backend to Google Cloud Run

```bash
# Install Google Cloud CLI
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Build and deploy
gcloud run deploy kinks-flask \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MISTRAL_API_KEY=your_key_here
```

#### Step 2: Deploy Cloudflare Worker

```bash
# Install dependencies
npm install

# Update wrangler.toml with your backend URL
# Add this to [vars] section:
# FLASK_BACKEND_URL = "https://your-cloud-run-url.run.app"

# Deploy
npm run deploy
```

### Option 2: Cloudflare + AWS Lambda

#### Using AWS Lambda with Docker

```bash
# Install AWS CLI and SAM CLI
# https://aws.amazon.com/cli/

# Create ECR repository
aws ecr create-repository --repository-name kinks-flask

# Build and push Docker image
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

docker build -t kinks-flask .
docker tag kinks-flask:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/kinks-flask:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/kinks-flask:latest

# Create Lambda function via AWS Console using the ECR image
# Set Function URL to allow public access
# Update wrangler.toml with Lambda Function URL
```

### Option 3: Cloudflare Pages + API Routes

For a simpler deployment without external backend:

```bash
# Convert Flask app to Cloudflare Pages Functions
# This requires porting Python code to JavaScript/TypeScript

# Deploy to Cloudflare Pages
wrangler pages deploy ./public
```

## Environment Variables Setup

### For Flask Backend

Create a `.env` file or set environment variables in your cloud provider:

```bash
MISTRAL_API_KEY=your_mistral_api_key
FIREBASE_CERT_PATH=/app/firebase-cert.json
FLASK_ENV=production
PORT=5000
```

### For Cloudflare Worker

In `wrangler.toml`, add:

```toml
[vars]
FLASK_BACKEND_URL = "https://your-backend-url.com"
ENVIRONMENT = "production"
```

For secrets (use Wrangler CLI):

```bash
wrangler secret put MISTRAL_API_KEY
wrangler secret put FIREBASE_CREDENTIALS
```

## Custom Domain Setup

### Step 1: Add Domain to Cloudflare

1. Go to Cloudflare Dashboard
2. Add your domain
3. Update nameservers at your registrar

### Step 2: Create DNS Record

Add a DNS record:
- Type: CNAME or A
- Name: kinks (or subdomain of choice)
- Value: your-worker.workers.dev
- Proxy status: Proxied (orange cloud)

### Step 3: Update Worker Route

In `wrangler.toml`:

```toml
routes = [
  { pattern = "kinks.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

## SSL/TLS Configuration

Cloudflare provides automatic SSL certificates. Configure:

1. Go to SSL/TLS → Overview
2. Set to "Full (strict)" for maximum security
3. Enable "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"

## Performance Optimization

### 1. Enable Caching

Add to worker:

```javascript
const CACHE_TTL = 3600 // 1 hour

async function handleRequest(request) {
  const cache = caches.default
  let response = await cache.match(request)
  
  if (!response) {
    response = await fetch(request)
    // Cache GET requests only
    if (request.method === 'GET') {
      response = new Response(response.body, response)
      response.headers.append('Cache-Control', `s-maxage=${CACHE_TTL}`)
      ctx.waitUntil(cache.put(request, response.clone()))
    }
  }
  
  return response
}
```

### 2. Enable Compression

In Flask app:

```python
from flask_compress import Compress

app = Flask(__name__)
Compress(app)
```

### 3. Use Cloudflare KV for Session Storage

```javascript
// In worker
const session = await KINKS_KV.get(sessionId)
await KINKS_KV.put(sessionId, data, { expirationTtl: 86400 })
```

## Monitoring & Logging

### Cloudflare Analytics

Enable in Dashboard:
- Workers Analytics
- Real-time logs
- Error tracking

### Application Logging

```bash
# View worker logs
wrangler tail

# View backend logs (Cloud Run)
gcloud logging read "resource.type=cloud_run_revision"
```

### Set Up Alerts

Create alerts for:
- High error rates
- Slow response times
- API quota limits

## Cost Estimation

### Cloudflare Workers
- Free tier: 100,000 requests/day
- Paid: $5/month for 10M requests

### Google Cloud Run
- Free tier: 2M requests/month
- After: $0.40 per 1M requests

### Mistral API
- Varies by model and usage
- Monitor via Mistral dashboard

## Rollback Strategy

If issues occur:

```bash
# Rollback worker deployment
wrangler rollback

# Rollback Cloud Run (GCP)
gcloud run services update-traffic kinks-flask \
  --to-revisions PREVIOUS_REVISION=100
```

## Testing Deployment

```bash
# Test health endpoint
curl https://kinks.yourdomain.com/health

# Test chat endpoint
curl -X POST https://kinks.yourdomain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "How do I care for 4C hair?"}'
```

## Troubleshooting

### Worker not routing correctly
- Check wrangler.toml routes configuration
- Verify DNS settings in Cloudflare
- Check worker logs: `wrangler tail`

### Backend connection issues
- Verify FLASK_BACKEND_URL is correct
- Check backend is running: `curl BACKEND_URL/health`
- Review firewall/security group rules

### CORS errors
- Ensure worker adds CORS headers
- Check backend CORS configuration
- Verify allowed origins

## Security Best Practices

1. **Never commit secrets**: Use environment variables
2. **Enable rate limiting**: Protect against abuse
3. **Use HTTPS only**: Enforce with Cloudflare settings
4. **Validate inputs**: Sanitize all user inputs
5. **Monitor API usage**: Set up billing alerts
6. **Regular updates**: Keep dependencies current

## Next Steps

1. Set up monitoring and alerting
2. Configure CDN for static assets
3. Implement rate limiting
4. Add authentication if needed
5. Set up CI/CD pipeline
6. Create staging environment
7. Document API endpoints
8. Write integration tests

For support: contact@afroheads.com
