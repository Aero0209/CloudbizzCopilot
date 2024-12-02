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

export async function sendEmail(params: EmailParams) {
  try {
    const templateParams = {
      to_email: params.to,
      subject: params.subject,
      message: params.text,
      attachment_base64: params.attachments?.[0]?.content,
      attachment_name: params.attachments?.[0]?.filename,
    };

    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID_INVOICE!,
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    );

    if (response.status !== 200) {
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
} 