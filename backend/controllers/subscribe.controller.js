import { sgMail } from '../lib/sendgrid.js';

export const subscribe = async (req, res) => {
  console.log('Subscription request received');

  try {
    const { email } = req.body;
    console.log('Email received:', email);

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: 'Please provide a valid email address',
        details: process.env.NODE_ENV === 'development' ? { received: email } : undefined
      });
    }

    const msg = {
      to: email,
      from: process.env.SENDGRID_TRANSACTIONAL_FROM,
      subject: 'Welcome to Our Community! 🌟',
      html: `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6e8efb, #a777e3); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Thanks for joining us!</h1>
      </div>
      
      <div style="padding: 30px;">
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Hello there,
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          We're thrilled to welcome you to our community! You'll now receive:
        </p>
        
        <ul style="font-size: 16px; color: #333; padding-left: 20px;">
          <li>Exclusive content and updates</li>
          <li>Early access to new features</li>
          <li>Special offers just for subscribers</li>
        </ul>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          If this wasn't you, please ignore this email or 
          <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #6e8efb;">unsubscribe here</a>.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}" 
             style="background: #6e8efb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;
                    font-weight: bold;">
            Visit Our Website
          </a>
        </div>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; text-align: center; font-size: 14px; color: #777;">
        <p style="margin: 0;">
          © ${new Date().getFullYear()} ${process.env.BRAND_NAME || 'Our Company'}. All rights reserved.
        </p>
        <p style="margin: 10px 0 0 0;">
          <a href="${process.env.FRONTEND_URL}/privacy" style="color: #777; text-decoration: none;">Privacy Policy</a> | 
          <a href="${process.env.FRONTEND_URL}/terms" style="color: #777; text-decoration: none;">Terms of Service</a>
        </p>
      </div>
    </div>
  `,
      mail_settings: {
        sandbox_mode: {
          enable: false
        }
      }
    };

    console.log('Sending email with config:', {
      from: msg.from,
      to: msg.to,
      sandbox: msg.mail_settings.sandbox_mode.enable
    });

    const [response] = await sgMail.send(msg);
    console.log('Email sent successfully. Status:', response.statusCode);

    return res.json({ success: true });

  } catch (error) {
    console.error('SendGrid Error:', {
      message: error.message,
      code: error.code,
      response: error.response?.body?.errors
    });

    return res.status(500).json({
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? {
        sendgridError: error.response?.body?.errors || error.message,
        attemptedConfig: {
          from: process.env.SENDGRID_TRANSACTIONAL_FROM,
          keyPrefix: process.env.SENDGRID_API_KEY?.substring(0, 6)
        }
      } : undefined
    });
  }
};