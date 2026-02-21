# Cloudflare Turnstile Setup Guide

Cloudflare Turnstile is a free CAPTCHA replacement that verifies users aren't bots - no puzzles, just background verification.

## Quick Setup (3 Steps)

### Step 1: Get Your Turnstile Keys

1. Go to https://dash.cloudflare.com/
2. Select your account
3. Go to **Turnstile** in the left sidebar
4. Click **Add Site**
5. Fill in:
   - **Site name**: Kinks AI Assistant
   - **Domain**: localhost (for testing) or your domain
   - **Widget Mode**: Managed (recommended)
6. Click **Create**
7. Copy your **Site Key** and **Secret Key**

### Step 2: Add Keys to Your App

Edit your `.env` file:

```bash
# Cloudflare Turnstile (Bot Protection)
CLOUDFLARE_TURNSTILE_SECRET_KEY=0x4AAAAAAA... (your secret key)
CLOUDFLARE_TURNSTILE_SITE_KEY=0x4BBB... (your site key)
```

### Step 3: Update the HTML

Open `templates/index.html` and replace `YOUR_SITE_KEY_HERE` with your actual site key:

```html
<div class="cf-turnstile" 
     data-sitekey="YOUR_ACTUAL_SITE_KEY" 
     data-callback="onTurnstileSuccess"
     data-theme="light"></div>
```

## That's It!

Now when users chat with Kinks, Cloudflare will verify they're not bots in the background. No annoying CAPTCHAs!

## How It Works

1. **User visits page** → Turnstile widget loads
2. **User types message** → Widget verifies in background
3. **User sends message** → Token sent to server
4. **Server verifies token** → Cloudflare confirms it's valid
5. **Bot blocked** or **User allowed** → AI responds

## Test It

```bash
# Start the app
.\start.ps1

# Visit http://localhost:5000
# You'll see a small Cloudflare widget above the chat input
# It verifies automatically - no user action needed!
```

## Troubleshooting

**Widget not showing?**
- Check your Site Key in `index.html`
- Make sure domain matches what you set in Cloudflare dashboard

**"Bot verification failed" error?**
- Check your Secret Key in `.env`
- Verify the domain is correct in Cloudflare dashboard

**Want to disable for testing?**
- Remove `CLOUDFLARE_TURNSTILE_SECRET_KEY` from `.env`
- App will skip verification

## Widget Customization

You can customize the widget appearance:

```html
<div class="cf-turnstile" 
     data-sitekey="YOUR_SITE_KEY"
     data-theme="light"           <!-- or "dark" -->
     data-size="normal"            <!-- or "compact" -->
     data-callback="onTurnstileSuccess"></div>
```

## Free Tier

Cloudflare Turnstile is **free** for:
- Unlimited verifications
- All websites
- No credit card required

## More Info

- Turnstile Docs: https://developers.cloudflare.com/turnstile/
- Dashboard: https://dash.cloudflare.com/
