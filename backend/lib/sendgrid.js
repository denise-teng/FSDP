import sgMail from '@sendgrid/mail';

// Use TRANSACTIONAL key for sending individual emails
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is missing in .env');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Changed to transactional key

// Verify sender email
if (!process.env.SENDGRID_TRANSACTIONAL_FROM) {
  console.warn('WARNING: SENDGRID_TRANSACTIONAL_FROM not set');
}

console.log('SendGrid initialized with:', {
  keyType: 'Transactional',
  sender: process.env.SENDGRID_TRANSACTIONAL_FROM,
  keyPrefix: process.env.SENDGRID_API_KEY?.substring(0, 6) + '...'
});

export { sgMail };
