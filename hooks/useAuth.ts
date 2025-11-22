'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createSupabaseClient();

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // Handle email not confirmed error - check message, code, and status
                const errorMessage = error.message?.toLowerCase() || '';
                const errorCode = (error as any).code || '';
                const isEmailNotConfirmed = 
                    errorMessage.includes('email not confirmed') ||
                    errorMessage.includes('email_not_confirmed') ||
                    errorCode === 'email_not_confirmed' ||
                    errorCode === 'signup_disabled';

                if (isEmailNotConfirmed) {
                    toast.error('Please verify your email before signing in. Check your inbox for the confirmation link.', {
                        duration: 5000,
                    });
                    
                    // Offer to resend confirmation email
                    setTimeout(() => {
                        toast.info('Need to resend confirmation email?', {
                            duration: 6000,
                            action: {
                                label: 'Resend Email',
                                onClick: async () => {
                                    try {
                                        const { error: resendError } = await supabase.auth.resend({
                                            type: 'signup',
                                            email: email,
                                        });
                                        if (resendError) {
                                            toast.error('Failed to resend email: ' + resendError.message);
                                        } else {
                                            toast.success('Confirmation email sent! Please check your inbox.');
                                        }
                                    } catch (err: any) {
                                        // Silently handle resend errors
                                        toast.error('Failed to resend email');
                                    }
                                },
                            },
                        });
                    }, 1000);
                    
                    // Return null instead of throwing - error is handled
                    return null;
                } else {
                    toast.error(error.message || 'Failed to sign in');
                    // Only throw for other errors
                    throw error;
                }
            }

            if (data.session) {
                setSession(data.session);
                setUser(data.user);
                toast.success('Signed in successfully');
                return data;
            }

            return null;
        } catch (error: any) {
            // Only log unexpected errors (not email confirmation errors)
            const errorMessage = error?.message?.toLowerCase() || '';
            const isEmailNotConfirmed = 
                errorMessage.includes('email not confirmed') ||
                errorMessage.includes('email_not_confirmed');
            
            if (!isEmailNotConfirmed) {
                console.error('Sign in error:', error);
                throw error;
            }
            // For email not confirmed, don't throw - already handled above
            return null;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signOut();

            if (error) {
                toast.error(error.message || 'Failed to sign out');
                throw error;
            }

            setSession(null);
            setUser(null);
            toast.success('Signed out successfully');
            router.push('/sign-in');
        } catch (error: any) {
            console.error('Sign out error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                toast.error(error.message || 'Failed to sign up');
                throw error;
            }

            if (data.user) {
                toast.success('Account created! Please check your email to verify your account.');
                return data;
            }
        } catch (error: any) {
            console.error('Sign up error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        session,
        loading,
        signIn,
        signOut,
        signUp,
        isAuthenticated: !!user,
    };
}

