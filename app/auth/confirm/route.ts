import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Handle email confirmation callback from Supabase
 * This route is called when user clicks the confirmation link in their email
 */
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const token_hash = requestUrl.searchParams.get('token_hash');
    const type = requestUrl.searchParams.get('type'); // 'signup' or 'recovery'
    const next = requestUrl.searchParams.get('next') || '/';

    if (token_hash && type) {
        const supabase = createRouteHandlerClient({ cookies });
        
        try {
            // Verify the token
            const { error } = await supabase.auth.verifyOtp({
                type: type as 'signup' | 'recovery',
                token_hash,
            });
            
            if (error) {
                console.error('Error verifying token:', error);
                // Redirect to sign-in with error message
                return NextResponse.redirect(
                    new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
                );
            }

            // Success - redirect to sign-in with success message
            return NextResponse.redirect(
                new URL(`/sign-in?verified=true&message=${encodeURIComponent('Email verified successfully! You can now sign in.')}`, requestUrl.origin)
            );
        } catch (error: any) {
            console.error('Email confirmation error:', error);
            return NextResponse.redirect(
                new URL(`/sign-in?error=${encodeURIComponent('Email verification failed')}`, requestUrl.origin)
            );
        }
    }

    // No token provided - redirect to sign-in
    return NextResponse.redirect(new URL('/sign-in', requestUrl.origin));
}

