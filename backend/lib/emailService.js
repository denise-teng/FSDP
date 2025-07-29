import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY_2);

console.log('Using SendGrid API Key:', process.env.SENDGRID_API_KEY_2 ? 
  `${process.env.SENDGRID_API_KEY_2.substring(0, 4)}...${process.env.SENDGRID_API_KEY_2.slice(-4)}` : 
  'NOT SET');

// Test the API key and get verified senders
sgMail.send({
    to: 'test@example.com',
    from: 'brandieco2025@gmail.com',
    subject: 'API Test',
    text: 'Testing SendGrid API',
}).catch(error => {
    console.log('SendGrid API Key Test Results:', {
        error: error.response?.body?.errors || error.message,
        fullError: error.response?.body || error
    });
});

const VERIFIED_SENDER = process.env.SENDGRID_VERIFIED_SENDER || 'brandieco2025@gmail.com';

class EmailService {
    // For immediate sending (your existing function)
    static async sendEmail(to, subject, text, html) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
            console.warn('Invalid email skipped:', to);
            return { success: false, error: 'Invalid email format' };
        }

        const msg = {
            to,
            from: {
                email: VERIFIED_SENDER,
                name: 'Brandie Co'  // Adding a display name might help
            },
            subject: subject || 'No Subject',
            text: text || 'No content',
            html: html || '<p>No content</p>',
            trackingSettings: {
                clickTracking: {
                    enable: true
                }
            }
        };

        try {
            console.log('Attempting to send email with config:', {
                to,
                from: VERIFIED_SENDER,
                subject: msg.subject
            });
            await sgMail.send(msg);
            console.log(`✅ Sent to ${to}`);
            return { success: true };
        } catch (error) {
            console.error('Send failed to', to, {
                error: error.response?.body?.errors || error.message,
                fullError: error.response?.body || error,
                fromEmail: VERIFIED_SENDER
            });
            throw error;
        }
    }

    // For batch sending (new)
    static async sendBatchEmail(recipients, subject, html) {
        const validRecipients = recipients.filter(email => 
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        );

        const invalidCount = recipients.length - validRecipients.length;
        if (invalidCount > 0) {
            console.warn(`Skipped ${invalidCount} invalid emails`);
        }

        if (validRecipients.length === 0) {
            throw new Error('No valid recipients');
        }

        const msg = {
            to: validRecipients,
            from: {
                email: VERIFIED_SENDER,
                name: 'Brandie Co'
            },
            subject: subject || 'No Subject',
            html: html || '<p>No content</p>',
            batchId: `batch_${Date.now()}`,
        };

        try {
            await sgMail.sendMultiple(msg);
            console.log(`✅ Sent batch to ${validRecipients.length} recipients`);
            return { 
                success: true,
                sent: validRecipients.length,
                failed: invalidCount
            };
        } catch (error) {
            console.error('Batch send failed:', {
                error: error.response?.body?.errors || error.message
            });
            throw error;
        }
    }

    // For scheduled sending (new)
    static async scheduleEmail(recipients, subject, html, sendAt) {
        const validRecipients = recipients.filter(email => 
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        );

        const msg = {
            to: validRecipients,
            from: {
                email: VERIFIED_SENDER,
                name: 'Brandie Co'
            },
            subject: subject || 'No Subject',
            html: html || '<p>No content</p>',
            sendAt: Math.floor(new Date(sendAt).getTime() / 1000), // Unix timestamp
        };

        try {
            await sgMail.sendMultiple(msg);
            console.log(`📅 Scheduled email for ${validRecipients.length} recipients at ${sendAt}`);
            return { 
                success: true,
                scheduled: validRecipients.length,
                scheduledTime: sendAt
            };
        } catch (error) {
            console.error('Scheduling failed:', {
                error: error.response?.body?.errors || error.message
            });
            throw error;
        }
    }
}

export default EmailService;