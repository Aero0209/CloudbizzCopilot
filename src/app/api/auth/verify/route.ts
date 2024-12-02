import { NextResponse } from 'next/server';
import { auth, db } from '@/config/firebase-admin';

export async function POST(request: Request) {
  try {
    const { session } = await request.json();
    
    // Vérifier le token de session
    const decodedToken = await auth.verifySessionCookie(session);
    
    // Récupérer le rôle depuis Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    return NextResponse.json({ 
      role: userData?.role,
      userId: decodedToken.uid 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
  }
} 