import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase-admin';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    
    // Vérifier le token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Créer un cookie de session
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 jours
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    
    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    });

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    cookies().delete('session');
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la session' }, 
      { status: 500 }
    );
  }
} 