import { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  try {
    const port = Number(process.env.SMTP_PORT) || 465;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'SMTP connection verified successfully',
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port,
        user: process.env.SMTP_USER,
      }),
    };
  } catch (error) {
    console.error('SMTP verify error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: (error as Error).message || 'SMTP connection failed',
      }),
    };
  }
};

export { handler };
