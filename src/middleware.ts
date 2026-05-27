import { defineMiddleware, sequence } from 'astro:middleware'

const TRANSCRIPT_PASSWORD = import.meta.env.TRANSCRIPT_PASSWORD

// Protect /transcript routes
const transcriptAuth = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname
  
  if (pathname.startsWith('/transcript')) {
    // Skip auth check for the login page itself
    if (pathname === '/transcript') {
      return next()
    }
    
    const cookieValue = context.cookies.get('transcript_auth')?.value
    
    // Protect the PDF file
    if (pathname === '/transcript/transcript.pdf') {
      if (cookieValue !== 'verified') {
        return context.redirect('/transcript?error=1')
      }
    }
  }
  
  return next()
})

// Handle logout
const handleLogout = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url)
  
  if (url.searchParams.has('logout')) {
    context.cookies.delete('transcript_auth', { path: '/transcript' })
    return context.redirect('/transcript')
  }
  
  return next()
})

export const onRequest = sequence(handleLogout, transcriptAuth)
