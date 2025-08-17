import sgMail from '@sendgrid/mail';

// Use TRANSACTIONAL key for sending individual emails
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is missing in .env');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Use the same key as your friend

// Verify sender email
if (!process.env.SENDGRID_TRANSACTIONAL_FROM) {
  console.warn('WARNING: SENDGRID_TRANSACTIONAL_FROM not set');
}

console.log('SendGrid initialized with:', {
  keyType: 'Secondary',
  sender: process.env.SENDGRID_TRANSACTIONAL_FROM,
  keyPrefix: process.env.SENDGRID_API_KEY_2?.substring(0, 6) + '...'
});

export { sgMail };
// Broadcast email sending functions
export const sendBroadcastEmail = async ({ to, subject, message, from = { email: 'densie.t2910@gmail.com', name: 'Yip Cheu Fong' } }) => {
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
  console.log('Using sender email:', msg.from);
  console.log('API key prefix:', process.env.SENDGRID_API_KEY_2?.substring(0, 10) + '...');
  try {
    await sgMail.send(msg);
    console.log('✅ Broadcast email sent successfully to:', to);
  } catch (error) {
    console.error('❌ Broadcast email failed:', error.message);
    if (error.response && error.response.body && error.response.body.errors) {
      console.error('SendGrid detailed errors:', JSON.stringify(error.response.body.errors, null, 2));
    }
    throw error;
  }
};

export const sendScheduledBroadcastEmail = async ({ to, subject, message, firstName, from = process.env.SENDGRID_TRANSACTIONAL_FROM || 'brandieco2025@gmail.com' }) => {
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
  try {
    await sgMail.send(msg);
    console.log('✅ Scheduled broadcast email sent successfully to:', to);
  } catch (error) {
    console.error('❌ Scheduled broadcast email failed:', error.message);
    throw error;
  }
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
