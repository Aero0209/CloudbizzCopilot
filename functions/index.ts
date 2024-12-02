import * as functions from 'firebase-functions';
import { auth, db } from './config/firebase-admin';

export const verifySession = functions.https.onRequest(async (req, res) => {
  try {
    const { session } = req.body;
    const decodedToken = await auth.verifySessionCookie(session);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    res.json({ 
      role: userData?.role,
      userId: decodedToken.uid 
    });
  } catch (error) {
    res.status(401).json({ error: 'Session invalide' });
  }
}); 