import emailjs from '@emailjs/browser';

interface EmailOptions {
  invitationId: string;
  companyName: string;
  recipientEmail: string;
  recipientName?: string;
  role?: string;
}

export async function sendInvitationEmail({
  invitationId,
  companyName,
  recipientEmail,
  recipientName = '',
  role = 'employé'
}: EmailOptions): Promise<void> {
  if (!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 
      !process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 
      !process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID) {
    throw new Error('EmailJS configuration is missing');
  }

  try {
    const data = {
      service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: recipientEmail,
        to_name: recipientName || recipientEmail,
        company_name: companyName,
        role: role,
        invitation_link: `${process.env.NEXT_PUBLIC_APP_URL}/invitations/${invitationId}`,
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
      }
    };

    console.log('Sending email with data:', data);

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const responseText = await response.text();
    console.log('EmailJS response:', response.status, responseText);

    if (!response.ok) {
      throw new Error(`Failed to send email: ${responseText}`);
    }

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
} 