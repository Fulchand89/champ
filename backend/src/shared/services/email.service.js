const nodemailer = require('nodemailer');
const env = require('../../config/env');
const { emailLogger } = require('../../config/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      secure: env.mail.encryption === 'ssl' || env.mail.port == 465, // true for 465, false for other ports
      auth: {
        user: env.mail.username,
        pass: env.mail.password,
      },
    });
  }

  /**
   * Send a raw email
   */
  async sendEmail(to, subject, htmlContent) {
    try {
      const mailOptions = {
        from: `"${env.mail.fromName}" <${env.mail.fromAddress}>`,
        to,
        subject,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      emailLogger.info(`Email sent successfully to ${to} | MessageId: ${info.messageId} | Subject: ${subject}`);
      return info;
    } catch (error) {
      emailLogger.error(`Failed to send email to ${to} | Subject: ${subject}`, error);
      throw error; // Let the caller handle the error or fail silently depending on requirement
    }
  }

  /**
   * Send an OTP email for password reset
   */
  async sendOtpEmail(to, name, otp) {
    const subject = 'Password Reset OTP - QuizApp';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi ${name || 'User'},</p>
        <p>We received a request to reset your password. Here is your One-Time Password (OTP):</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50; background: #f9f9f9; padding: 15px 30px; border-radius: 5px; border: 1px dashed #ccc;">
            ${otp}
          </span>
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <br />
        <p>Thanks,<br />The QuizApp Team</p>
      </div>
    `;

    return this.sendEmail(to, subject, htmlContent);
  }

  async sendEmailChangeOtp(to, name, otp) {
    const subject = 'Verify your new email address - QuizApp';
    
    // In production, this would be a proper HTML template
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify New Email Address</h2>
        <p>Hello ${name || 'User'},</p>
        <p>You have requested to change your email address. Please use the following OTP to verify this new email address:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for 10 minutes. If you did not request this change, please ignore this email and contact support.</p>
        <br/>
        <p>Best regards,<br/>The QuizApp Team</p>
      </div>
    `;

    return this.sendEmail(to, subject, htmlContent);
  }
}

module.exports = new EmailService();
