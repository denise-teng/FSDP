import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendPasswordResetEmail = async ({ to, resetLink }) => {
  const html = `
    <h2>Hello,</h2>
    <p>You requested to reset your password for your Brandie account.</p>
    <a href="${resetLink}" style="background:#10B981;color:white;padding:10px 15px;border-radius:6px;text-decoration:none">Reset Password</a>
    <p>If that doesn't work, copy and paste this link:</p>
    <p>${resetLink}</p>
  `;

  await sgMail.send({
    to,
    from: 'brandieco2025@gmail.com', // ✅ this one is verified
    subject: 'Reset Your Brandie Password',
    html
  });
};
