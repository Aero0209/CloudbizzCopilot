'use client';

import emailjs from '@emailjs/browser';

interface EmailOptions {
  invitationId: string;
  companyName: string;
  recipientEmail: string;
  recipientName?: string;
  role?: string;
}

export const sendInvitationEmail = async ({
  invitationId,
  companyName,
  recipientEmail,
  recipientName = '',
  role = 'employé'
}: EmailOptions): Promise<void> => {
  try {
    if (!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 
        !process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 
        !process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID) {
      console.error('Missing EmailJS configuration:', {
        publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
        serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
      });
      throw new Error('EmailJS configuration is missing');
    }

    const templateParams = {
      to_email: recipientEmail,
      to_name: recipientName || recipientEmail,
      company_name: companyName,
      role: role,
      invitation_link: `${process.env.NEXT_PUBLIC_APP_URL}/invitations/${invitationId}`,
      expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
    };

    console.log('Sending email with params:', templateParams);

    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    );

    if (response.status !== 200) {
      throw new Error('Failed to send email');
    }

    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
}; 