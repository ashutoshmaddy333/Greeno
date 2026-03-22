import nodemailer from 'nodemailer';
import { IApplication } from '@/models/Application';
import { IJob } from '@/models/Job';

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter connection
transporter.verify(function (error, success) {
  if (error) {
    console.error('Mail service error:', error);
  } else {
    console.log('Mail service is ready to send messages');
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    const err = new Error('EMAIL_USER and EMAIL_PASSWORD must be set in environment');
    console.error(err.message);
    throw err;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.messageId);
  return { success: true as const, messageId: info.messageId };
}

export async function sendJobApplicationEmail(application: IApplication, job: IJob) {
  const subject = `Application Received: ${job.title} at ${job.company}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Received</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
        <div class="header" style="text-align: center; padding: 20px 0; border-bottom: 1px solid #e0e0e0;">
          <h1 style="color: #1976d2; margin: 0;">Jobby</h1>
        </div>
        
        <div class="content" style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Application Received</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hello ${application.name},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for applying to the position of <strong>${job.title}</strong> at <strong>${job.company}</strong>.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px; color: #333;">Application Details</h3>
            <p style="margin: 0 0 8px; color: #666;"><strong>Position:</strong> ${job.title}</p>
            <p style="margin: 0 0 8px; color: #666;"><strong>Company:</strong> ${job.company}</p>
            <p style="margin: 0 0 8px; color: #666;"><strong>Location:</strong> ${job.location}</p>
            <p style="margin: 0 0 8px; color: #666;"><strong>Application Date:</strong> ${new Date(application.createdAt).toLocaleDateString()}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We have received your application and will review it carefully. Our hiring team will contact you if your profile matches our requirements.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 0;">
            Thank you for your interest in joining our team!
          </p>
        </div>
        
        <div class="footer" style="text-align: center; padding: 20px; border-top: 1px solid #e0e0e0; background-color: #f8f9fa;">
          <p style="margin: 0 0 8px; color: #666; font-size: 14px;">This is an automated message. Please do not reply to this email.</p>
          <p style="margin: 0; color: #666; font-size: 14px;">© ${new Date().getFullYear()} Jobby. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: application.email,
    subject,
    html
  });
}

export async function sendApplicationStatusUpdateEmail(application: IApplication, job: IJob, status: string) {
  const subject = `Application Update: ${job.title} at ${job.company}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Status Update</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
        <div class="header" style="text-align: center; padding: 20px 0; border-bottom: 1px solid #e0e0e0;">
          <h1 style="color: #1976d2; margin: 0;">Jobby</h1>
        </div>
        
        <div class="content" style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Application Status Update</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hello ${application.name},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We have an update regarding your application for the position of <strong>${job.title}</strong> at <strong>${job.company}</strong>.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px; color: #333;">Status Update</h3>
            <p style="margin: 0 0 8px; color: #666;"><strong>Position:</strong> ${job.title}</p>
            <p style="margin: 0 0 8px; color: #666;"><strong>Company:</strong> ${job.company}</p>
            <p style="margin: 0 0 8px; color: #666;"><strong>New Status:</strong> <span style="color: #1976d2; font-weight: bold;">${status}</span></p>
            <p style="margin: 0 0 8px; color: #666;"><strong>Update Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            ${status === 'Approved' ? 'Congratulations! Your application has been approved and you will be contacted for the next steps.' : 
              status === 'Rejected' ? 'We regret to inform you that your application was not selected for this position. We encourage you to apply for other opportunities.' :
              'We are currently reviewing your application and will provide updates as they become available.'}
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 0;">
            Thank you for your interest in joining our team!
          </p>
        </div>
        
        <div class="footer" style="text-align: center; padding: 20px; border-top: 1px solid #e0e0e0; background-color: #f8f9fa;">
          <p style="margin: 0 0 8px; color: #666; font-size: 14px;">This is an automated message. Please do not reply to this email.</p>
          <p style="margin: 0; color: #666; font-size: 14px;">© ${new Date().getFullYear()} Jobby. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: application.email,
    subject,
    html
  });
}

export async function sendOTPEmail(email: string, otp: string, type: 'signup' | 'forgot-password') {
  const subject = type === 'signup' ? 'Verify Your Email - Jobby' : 'Password Reset Code - Jobby';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${type === 'signup' ? 'Email Verification' : 'Password Reset'}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
        <div class="header" style="text-align: center; padding: 20px 0; border-bottom: 1px solid #e0e0e0;">
          <h1 style="color: #1976d2; margin: 0;">Jobby</h1>
        </div>
        
        <div class="content" style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">${type === 'signup' ? 'Verify Your Email Address' : 'Reset Your Password'}</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            ${type === 'signup' ? 'Thank you for signing up! Please verify your email address to complete your registration.' : 'You requested to reset your password. Use the code below to reset your password.'}
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px; color: #333; font-weight: bold;">Your Verification Code:</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; color: #1976d2; letter-spacing: 8px; font-family: monospace;">${otp}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This code will expire in 10 minutes. If you didn't request this ${type === 'signup' ? 'verification' : 'password reset'}, please ignore this email.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify?email=${encodeURIComponent(email)}&type=${type}" 
               style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              ${type === 'signup' ? 'Verify Email' : 'Reset Password'}
            </a>
          </div>
        </div>
        
        <div class="footer" style="text-align: center; padding: 20px; border-top: 1px solid #e0e0e0; background-color: #f8f9fa;">
          <p style="margin: 0 0 8px; color: #666; font-size: 14px;">This is an automated message. Please do not reply to this email.</p>
          <p style="margin: 0; color: #666; font-size: 14px;">© ${new Date().getFullYear()} Jobby. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject,
    html
  });
}

export default {
  sendEmail,
  sendJobApplicationEmail,
  sendApplicationStatusUpdateEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
};
export async function sendPasswordResetEmail(email: string, resetToken: string, name: string) {
  const subject = 'Password Reset - Greenotech Jobs';
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - Greenotech Jobs</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <div class="header" style="background-color: #1976d2; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Greenotech Jobs</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Password Reset Request</p>
        </div>
        
        <div class="content" style="padding: 40px 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your Greenotech Jobs account.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Click the button below to reset your password. This link will expire in 24 hours for security reasons.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #1976d2; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
              Reset My Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; word-break: break-all;">
            <p style="margin: 0; color: #1976d2; font-size: 14px;">${resetUrl}</p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            <strong>Security Notes:</strong>
          </p>
          <ul style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            <li>This link will expire in 24 hours</li>
            <li>If you didn't request this password reset, please ignore this email</li>
            <li>For your security, never share this link with anyone</li>
          </ul>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 0;">
            If you have any questions, please contact our support team.
          </p>
        </div>
        
        <div class="footer" style="text-align: center; padding: 20px; border-top: 1px solid #e0e0e0; background-color: #f8f9fa;">
          <p style="margin: 0 0 8px; color: #666; font-size: 14px;">This is an automated message. Please do not reply to this email.</p>
          <p style="margin: 0; color: #666; font-size: 14px;">© ${new Date().getFullYear()} Greenotech Jobs. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject,
    html
  });
}
