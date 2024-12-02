export async function createSession(idToken: string) {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      throw new Error('Erreur de session');
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error);
    return false;
  }
}