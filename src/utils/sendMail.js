import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (message) => {
  try {
    return await transporter.sendMail(message);
  } catch (error) {
    console.error('Error sending email:', error); 
    throw createHttpError(500, 'Failed to send the email, please try again later.');
  }
};