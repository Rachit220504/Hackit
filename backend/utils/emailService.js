const nodemailer = require('nodemailer');

// Create a test account for development if needed
let transporter;

const initializeTransporter = async () => {
  // In production, use real SMTP settings
  if (process.env.NODE_ENV === 'production') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // For development, use Ethereal (fake SMTP service)
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

// Initialize transporter on module load
initializeTransporter();

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content (optional)
 */
const sendEmail = async (options) => {
  try {
    if (!transporter) {
      await initializeTransporter();
    }
    
    const mailOptions = {
      from: `"HackIT" <${process.env.EMAIL_FROM || 'noreply@hackit.com'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // For development, log the test URL
    if (process.env.NODE_ENV !== 'production') {
      console.log('Email preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Email templates
const sendTeamInvitation = async (recipientEmail, teamName, invitationLink, leaderName) => {
  const subject = `Invitation to join ${teamName} on HackIT`;
  
  const text = `
    Hello,
    
    You've been invited by ${leaderName} to join their team "${teamName}" on HackIT.
    
    To accept or decline this invitation, please click the following link:
    ${invitationLink}
    
    This invitation will expire in 7 days.
    
    Best regards,
    The HackIT Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">You've Been Invited to Join a Team!</h2>
      <p>Hello,</p>
      <p>You've been invited by <strong>${leaderName}</strong> to join their team <strong>"${teamName}"</strong> on HackIT.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${invitationLink}" style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          View Invitation
        </a>
      </div>
      <p>This invitation will expire in 7 days.</p>
      <p>Best regards,<br>The HackIT Team</p>
    </div>
  `;
  
  return sendEmail({
    to: recipientEmail,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendEmail,
  sendTeamInvitation,
};
