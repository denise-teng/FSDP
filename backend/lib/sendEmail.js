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

export const sendBroadcastEmail = async ({ to, subject, message, from = 'brandieco2025@gmail.com' }) => {
  const msg = {
    to,
    from,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="color: white; text-align: center; margin: 0; font-size: 28px;">📢 Broadcast Message</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea;">
            <h2 style="color: #333; margin-top: 0;">${subject}</h2>
            <div style="white-space: pre-line; font-size: 16px; line-height: 1.6;">
              ${message}
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f1f3f4; border-radius: 8px;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              This message was sent via Brandie Broadcast System
            </p>
          </div>
        </body>
      </html>
    `,
  };

  console.log('Sending broadcast email to:', to);
  await sgMail.send(msg);
  console.log('Broadcast email sent successfully to:', to);
};

export const sendScheduledBroadcastEmail = async ({ to, subject, message, firstName, from = 'brandieco2025@gmail.com' }) => {
  const msg = {
    to,
    from,
    subject: `Hi ${firstName}, ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="color: white; text-align: center; margin: 0; font-size: 28px;">📅 Scheduled Broadcast Message</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea;">
            <h2 style="color: #333; margin-top: 0;">${subject}</h2>
            <p style="color: #333; margin-bottom: 20px;">Dear ${firstName},</p>
            <div style="white-space: pre-line; font-size: 16px; line-height: 1.6;">
              ${message}
            </div>
            <p style="color: #333; margin-top: 20px;">Best regards,<br>Your Team</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f1f3f4; border-radius: 8px;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              This message was sent via Brandie Broadcast System
            </p>
          </div>
        </body>
      </html>
    `,
  };

  console.log('Sending scheduled broadcast email to:', to);
  await sgMail.send(msg);
  console.log('Scheduled broadcast email sent successfully to:', to);
};

export const sendBulkBroadcastEmails = async ({ recipients, subject, message }) => {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      await sendBroadcastEmail({
        to: recipient.email,
        subject,
        message
      });
      results.push({
        recipient: recipient._id,
        email: recipient.email,
        status: 'sent',
        sentAt: new Date()
      });
    } catch (error) {
      console.error(`Failed to send email to ${recipient.email}:`, error);
      results.push({
        recipient: recipient._id,
        email: recipient.email,
        status: 'failed',
        error: error.message,
        sentAt: new Date()
      });
    }
  }
  
  return results;
};
