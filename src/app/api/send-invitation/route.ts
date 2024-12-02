import { NextResponse } from 'next/server';
import { sendInvitationEmail } from '@/services/emailServer';

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 
      !process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 
      !process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID) {
    return NextResponse.json(
      { error: 'EmailJS configuration is missing' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { invitationId, companyName, recipientEmail, recipientName, role } = body;

    console.log('Sending invitation email to:', recipientEmail);

    await sendInvitationEmail({
      invitationId,
      companyName,
      recipientEmail,
      recipientName,
      role
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in send-invitation API route:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to send invitation email',
        details: error
      },
      { status: 500 }
    );
  }
} 