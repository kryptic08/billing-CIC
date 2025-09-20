import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const envVars = {
      hasGeminiKey: !!process.env.NEXT_GEMINI_KEY,
      hasGoogleKey: !!process.env.GOOGLE_AI_API_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasVercelUrl: !!process.env.VERCEL_URL,
      hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      runtime: 'nodejs'
    };

    console.log('Debug endpoint called:', envVars);

    return NextResponse.json({
      success: true,
      message: 'Debug endpoint working',
      environment: envVars,
      apis: {
        aiChat: '/api/ai/chat',
        billingData: '/api/billing/data'
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  return GET(); // Same response for POST
}