import { VercelRequest, VercelResponse } from '@vercel/node'

// Helper function to handle CORS for multiple origins
export function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
    const origin = req.headers.origin

    console.log(`🔍 CORS Debug: Incoming origin: "${origin}"`)
    console.log(`🔍 CORS Debug: Environment CORS_ORIGIN: "${process.env.CORS_ORIGIN}"`)
    console.log(`🔍 CORS Debug: NODE_ENV: "${process.env.NODE_ENV}"`)

    // Always allow these specific origins regardless of environment
    const trustedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://yield-agentx.vercel.app',
        'https://yieldagentx.vercel.app'
    ]

    // Check if origin is in trusted list (normalize by removing trailing slash)
    const normalizedOrigin = origin?.replace(/\/$/, '')
    const isExplicitlyAllowed = trustedOrigins.some(trusted =>
        trusted.replace(/\/$/, '') === normalizedOrigin
    )

    if (isExplicitlyAllowed && origin) {
        console.log(`✅ CORS: Allowing trusted origin: ${origin}`)
        res.setHeader('Access-Control-Allow-Origin', origin)
    } else if (process.env.CORS_ORIGIN === '*') {
        console.log(`✅ CORS: Allowing all origins (CORS_ORIGIN=*)`)
        res.setHeader('Access-Control-Allow-Origin', origin || '*')
    } else if (!origin) {
        console.log(`✅ CORS: No origin header, allowing all`)
        res.setHeader('Access-Control-Allow-Origin', '*')
    } else {
        console.log(`🚫 CORS: Rejecting origin: ${origin}`)
        console.log(`📋 CORS: Trusted origins:`, trustedOrigins)
        // Fallback to allow in development
        res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'development' ? '*' : trustedOrigins[0])
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Max-Age', '86400') // 24 hours

    return true // Always return true since we handle CORS properly above
}

// Handle preflight OPTIONS requests
export function handleOptions(res: VercelResponse) {
    res.status(200).end()
}
