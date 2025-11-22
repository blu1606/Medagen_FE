import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Handle auth callbacks from Supabase
 * Supports both OAuth callbacks (code parameter) and email verification (token_hash parameter)
 */
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const token_hash = requestUrl.searchParams.get('token_hash');
    const type = requestUrl.searchParams.get('type'); // 'signup', 'recovery', 'email', etc.
    const next = requestUrl.searchParams.get('next') || '/';

    const supabase = createRouteHandlerClient({ cookies });

    // Handle email verification with token_hash
    if (token_hash && type) {
        try {
            const { error } = await supabase.auth.verifyOtp({
                type: type as 'signup' | 'recovery' | 'email',
                token_hash,
            });
            
            if (error) {
                console.error('Error verifying token:', error);
                return NextResponse.redirect(
                    new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
                );
            }

            // Success - redirect to sign-in with success message
            return NextResponse.redirect(
                new URL(`/sign-in?verified=true&message=${encodeURIComponent('Email verified successfully! You can now sign in.')}`, requestUrl.origin)
            );
        } catch (error: any) {
            console.error('Email verification error:', error);
            return NextResponse.redirect(
                new URL(`/sign-in?error=${encodeURIComponent('Email verification failed')}`, requestUrl.origin)
            );
        }
    }

    // Handle OAuth callback with code
    if (code) {
        try {
            // Exchange the code for a session
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
                console.error('Error exchanging code for session:', error);
                return NextResponse.redirect(
                    new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
                );
            }

            // Success - redirect to home or next URL
            return NextResponse.redirect(new URL(next, requestUrl.origin));
        } catch (error: any) {
            console.error('Auth callback error:', error);
            return NextResponse.redirect(
                new URL(`/sign-in?error=${encodeURIComponent('Authentication failed')}`, requestUrl.origin)
            );
        }
    }

    // No code or token provided - redirect to sign-in
    return NextResponse.redirect(new URL('/sign-in', requestUrl.origin));
}

