import emailjs from '@emailjs/browser';

interface EmailParams {
  to: string;
  subject: string;
  text: string;
  attachments?: Array<{
    filename: string;
    content: string;
    encoding: string;
  }>;
}

export const sendEmail = async (params: EmailParams) => {
  const templateParams = {
    to_email: params.to,
    subject: params.subject,
    message: params.text,
    attachment_data: params.attachments?.[0]?.content || '',
    attachment_name: params.attachments?.[0]?.filename || ''
  };

  try {
    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      templateParams,
      {
        publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      }
    );
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email');
  }
};