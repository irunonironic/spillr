import axios from 'axios';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.error('BREVO_API_KEY not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const payload = {
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'Spillr',
        email: process.env.BREVO_SENDER_EMAIL
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
      textContent: text || html.replace(/<[^>]*>/g, '') 
    };

    console.log('Sending email via Brevo API to:', to);

    const response = await axios.post(BREVO_API_URL, payload, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const messageId = response.data?.messageId || response.data?.id || null;

    console.log('Email sent successfully. Message ID:', response.data.messageId);
    return { success: true, messageId
    };

  } catch (error) {
    const errMessage = error.response?.data?.message || error.message || "Unknown error";
    console.error('Failed to send email via Brevo:', errMessage);

    return {
      success: false,
      error: errMessage
    };
  }
};

export default sendEmail;