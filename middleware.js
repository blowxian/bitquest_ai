import {NextResponse} from "next/server"
import {match} from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

let locales = ['en', 'zh', 'hi']
let defaultLocale = 'en'

// Get the preferred locale, similar to the above or using a library
function getLocale(request) {
    let headers = {'accept-language': 'en;q=0.5'}
    let languages = new Negotiator({headers}).languages()

    return match(languages, locales, defaultLocale) // -> 'en-US'
}

export function middleware(request) {
    // Check if there is any supported locale in the pathname
    const { pathname } = request.nextUrl
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (pathnameHasLocale) return

    // Redirect if there is no locale
    const locale = getLocale(request)
    request.nextUrl.pathname = `/${locale}${pathname}`
    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(request.nextUrl)
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        '/((?!_next|api|googleb9066eac88b031d8|googlea57c359bce352c3a|img|favicon|ads|monitoring|robots|site|apple|android).*)',
        // Optional: only run on root (/) URL
        // '/'
    ],
}