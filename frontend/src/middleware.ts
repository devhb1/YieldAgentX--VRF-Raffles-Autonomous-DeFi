import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
    // Handle development-specific 404s to reduce console noise
    if (process.env.NODE_ENV === 'development') {
        const { pathname } = request.nextUrl

        // Suppress 404 logs for webpack HMR files
        if (pathname.includes('webpack.hot-update') ||
            pathname.includes('.well-known/appspecific') ||
            pathname.includes('chrome.devtools')) {
            return new NextResponse(null, { status: 404 })
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
