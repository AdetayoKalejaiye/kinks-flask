
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Health check endpoint
  if (url.pathname === '/health') {
    return new Response(JSON.stringify({
      status: 'healthy',
      service: 'Kinks AI Assistant',
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
  
  // CORS handling
  if (request.method === 'OPTIONS') {
    return handleCORS()
  }
  
  // Route to Flask backend (deployed separately)
  // Replace FLASK_BACKEND_URL with your actual backend URL
  const backendUrl = FLASK_BACKEND_URL || 'http://localhost:5000'
  const targetUrl = new URL(url.pathname + url.search, backendUrl)
  
  // Forward the request to Flask backend
  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body
  })
  
  try {
    const response = await fetch(modifiedRequest)
    
    // Add CORS headers to response
    const modifiedResponse = new Response(response.body, response)
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*')
    modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return modifiedResponse
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Backend unavailable',
      message: error.message
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}

function handleCORS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}
