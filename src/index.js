/**
 * Cloudflare Worker for Kinks AI Assistant
 * - Uses Mistral AI for chat
 * - KV storage for conversation history (server-side memory)
 * - Cloudflare Turnstile for bot protection
 * - VADER-like sentiment analysis
 */

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  }
};

async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return handleCORS();
  }
  
  // Health check
  if (url.pathname === '/health') {
    return new Response(JSON.stringify({
      status: 'healthy',
      service: 'Kinks AI Assistant',
      timestamp: new Date().toISOString(),
      storage: 'Cloudflare KV',
      llm: 'Mistral AI'
    }), {
      headers: corsHeaders('application/json')
    });
  }
  
  // Main chat endpoint
  if (url.pathname === '/api/chat' && request.method === 'POST') {
    return handleChat(request, env);
  }
  
  // Get conversation history
  if (url.pathname === '/api/history' && request.method === 'GET') {
    return getHistory(request, env);
  }
  
  // Clear conversation history
  if (url.pathname === '/api/clear' && request.method === 'POST') {
    return clearHistory(request, env);
  }
  
  // Serve static files (proxy to Pages or return 404)
  return new Response('Not Found', { 
    status: 404,
    headers: corsHeaders('text/plain')
  });
}

async function handleChat(request, env) {
  try {
    const data = await request.json();
    const { query, user_id, cf_turnstile_token } = data;
    
    if (!query) {
      return jsonResponse({ error: 'Query parameter is missing' }, 400);
    }
    
    // Verify Turnstile token if provided
    if (cf_turnstile_token && env.CLOUDFLARE_TURNSTILE_SECRET_KEY) {
      const isValid = await verifyTurnstile(cf_turnstile_token, env.CLOUDFLARE_TURNSTILE_SECRET_KEY);
      if (!isValid) {
        return jsonResponse({ error: 'Bot verification failed' }, 403);
      }
    }
    
    // Get session ID (user_id or generate new)
    const sessionId = user_id || generateSessionId();
    
    // Get conversation history from KV
    const history = await getConversationHistory(sessionId, env);
    
    // Analyze sentiment
    const sentiment = analyzeSentiment(query);
    
    // Call Mistral AI
    const messages = [
      ...history.map(msg => ({
        role: msg.role === 'kinks' ? 'assistant' : msg.role,
        content: msg.content
      })),
      { role: 'user', content: query }
    ];
    
    const aiResponse = await callMistralAI(messages, env);
    
    // Update conversation history in KV
    history.push({ role: 'user', content: query, timestamp: Date.now() });
    history.push({ role: 'kinks', content: aiResponse, timestamp: Date.now() });
    
    // Keep only last 20 messages
    const trimmedHistory = history.slice(-20);
    await saveConversationHistory(sessionId, trimmedHistory, env);
    
    return jsonResponse({
      response: aiResponse,
      sentiment: sentiment,
      status: 'success',
      session_id: sessionId
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    return jsonResponse({
      error: 'Failed to process request',
      details: error.message
    }, 500);
  }
}

async function callMistralAI(messages, env) {
  const MISTRAL_API_KEY = env.MISTRAL_API_KEY;
  const AGENT_ID = 'ag:7692f659:20250710:kinks:34dcf0d7';
  
  const response = await fetch('https://api.mistral.ai/v1/agents/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agent_id: AGENT_ID,
      messages: messages
    })
  });
  
  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status}`);
  }
  
  const result = await response.json();
  return result.choices[0].message.content;
}

function analyzeSentiment(text) {
  // Simple sentiment analysis (VADER-like)
  const positive = ['love', 'great', 'amazing', 'excellent', 'wonderful', 'fantastic', 'perfect', 'awesome'];
  const negative = ['hate', 'terrible', 'awful', 'horrible', 'worst', 'bad', 'disappointing'];
  const veryPositive = ['absolutely love', 'so happy', 'thrilled', 'ecstatic'];
  const veryNegative = ['absolutely hate', 'so sad', 'devastated', 'furious'];
  
  const lowerText = text.toLowerCase();
  
  // Check very positive
  if (veryPositive.some(word => lowerText.includes(word))) return 'happy';
  
  // Check very negative
  if (veryNegative.some(word => lowerText.includes(word))) return 'shocked';
  
  // Count positive and negative words
  const positiveCount = positive.filter(word => lowerText.includes(word)).length;
  const negativeCount = negative.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount + 1) return 'laughing';
  if (positiveCount > negativeCount) return 'happy';
  if (negativeCount > positiveCount + 1) return 'shocked';
  if (negativeCount > positiveCount) return 'sad';
  
  return 'neutral';
}

async function verifyTurnstile(token, secretKey) {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: secretKey,
        response: token
      })
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

// KV Storage Functions
async function getConversationHistory(sessionId, env) {
  if (!env.CHAT_HISTORY) return [];
  
  try {
    const history = await env.CHAT_HISTORY.get(sessionId, 'json');
    return history || [];
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
}

async function saveConversationHistory(sessionId, history, env) {
  if (!env.CHAT_HISTORY) return;
  
  try {
    // Store for 7 days
    await env.CHAT_HISTORY.put(sessionId, JSON.stringify(history), {
      expirationTtl: 60 * 60 * 24 * 7
    });
  } catch (error) {
    console.error('Error saving history:', error);
  }
}

async function getHistory(request, env) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');
  
  if (!sessionId) {
    return jsonResponse({ error: 'session_id required' }, 400);
  }
  
  const history = await getConversationHistory(sessionId, env);
  return jsonResponse({ history });
}

async function clearHistory(request, env) {
  const data = await request.json();
  const { session_id } = data;
  
  if (!session_id) {
    return jsonResponse({ error: 'session_id required' }, 400);
  }
  
  if (env.CHAT_HISTORY) {
    await env.CHAT_HISTORY.delete(session_id);
  }
  
  return jsonResponse({ status: 'cleared' });
}

// Utility Functions
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function corsHeaders(contentType = 'application/json') {
  return {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders()
  });
}

function handleCORS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}
