// lib/email.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendVerificationEmail = async ({ to, token, name }) => {
  const verifyUrl = `http://localhost:5173/verify-email?data=${token}`;

  const msg = {
    to,
    from: 'brandieco2025@gmail.com', // ✅ this one is verified

    subject: 'Verify Your Email',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Welcome to <span style="color: #28a745;">Brandie</span> 👋</h2>
          <p>Hi ${name},</p>
          <p>Thanks for signing up for Brandie! Please confirm your email address to activate your account.</p>

          <a href="${verifyUrl}" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none;">
            Verify My Email
          </a>

          <p>If the button doesn't work, you can also click this link:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>

          <hr />
          <p style="color: #888; font-size: 12px;">If you didn't sign up, you can ignore this email.</p>
        </body>
      </html>
    `,
  };

  console.log('Sending email to:', to);
  await sgMail.send(msg);
  console.log('Email sent successfully');
};
