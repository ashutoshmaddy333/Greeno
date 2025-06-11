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
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendJobApplicationEmail(application: IApplication, job: IJob) {
  const subject = `Application Received: ${job.title} at ${job.company}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Confirmation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { max-width: 150px; margin-bottom: 20px; }
        .title { color: #2563eb; font-size: 24px; font-weight: 600; margin: 0 0 10px; }
        .subtitle { color: #6b7280; font-size: 16px; margin: 0; }
        .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 24px; margin-bottom: 24px; }
        .card-title { color: #1e40af; font-size: 18px; font-weight: 600; margin: 0 0 16px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .info-item { margin-bottom: 12px; }
        .info-label { color: #6b7280; font-size: 14px; margin-bottom: 4px; }
        .info-value { color: #1f2937; font-size: 15px; font-weight: 500; }
        .divider { border-top: 1px solid #e5e7eb; margin: 32px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 13px; }
        .button { display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin-top: 16px; }
        .status-badge { display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 500; }
        @media (max-width: 600px) {
          .info-grid { grid-template-columns: 1fr; }
          .container { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://your-logo-url.com/logo.png" alt="Company Logo" class="logo">
          <h1 class="title">Application Received</h1>
          <p class="subtitle">Thank you for applying to ${job.company}</p>
        </div>

        <div class="card">
          <h2 class="card-title">Application Details</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Position</div>
              <div class="info-value">${job.title}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Company</div>
              <div class="info-value">${job.company}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Location</div>
              <div class="info-value">${job.location}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Employment Type</div>
              <div class="info-value">${job.employmentType}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Experience Level</div>
              <div class="info-value">${job.experienceLevel}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Application Status</div>
              <div class="info-value"><span class="status-badge">Under Review</span></div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">Your Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Full Name</div>
              <div class="info-value">${application.firstName} ${application.middleName ? application.middleName + ' ' : ''}${application.lastName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value">${application.email}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Phone</div>
              <div class="info-value">${application.phoneNumber}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Experience</div>
              <div class="info-value">${application.experience}${application.yearsOfExperience ? ` (${application.yearsOfExperience} years)` : ''}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">Next Steps</h2>
          <p style="margin: 0 0 16px;">We have received your application and will review it shortly. Our hiring team will carefully evaluate your qualifications and experience.</p>
          <p style="margin: 0 0 16px;">If your profile matches our requirements, we will contact you for the next steps in the hiring process. This typically includes:</p>
          <ul style="margin: 0 0 16px; padding-left: 20px;">
            <li>Initial screening interview</li>
            <li>Technical assessment (if applicable)</li>
            <li>Team interview</li>
            <li>Final interview with hiring manager</li>
          </ul>
          <a href="https://your-careers-page.com" class="button">View Job Status</a>
        </div>

        <div class="divider"></div>

        <div class="footer">
          <p style="margin: 0 0 8px;">This is an automated message. Please do not reply to this email.</p>
          <p style="margin: 0;">© ${new Date().getFullYear()} ${job.company}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: application.email,
    subject,
    html,
  });
}

export async function sendApplicationStatusUpdateEmail(application: IApplication, job: IJob, status: string) {
  const subject = `Application Status Update: ${job.title} at ${job.company}`;
  
  const statusConfig = {
    'accepted': {
      color: '#059669',
      bgColor: '#d1fae5',
      title: 'Congratulations!',
      message: 'We are pleased to inform you that your application has been accepted. Our team will contact you shortly with the next steps in the onboarding process.',
      nextSteps: [
        'Complete the onboarding documentation',
        'Schedule your first day',
        'Meet with your team lead',
        'Set up your work environment'
      ]
    },
    'rejected': {
      color: '#dc2626',
      bgColor: '#fee2e2',
      title: 'Application Update',
      message: 'Thank you for your interest in the position. After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.',
      nextSteps: [
        'Keep an eye on our careers page for new opportunities',
        'Update your profile to match your latest skills',
        'Consider applying for other positions that match your qualifications'
      ]
    },
    'interview': {
      color: '#2563eb',
      bgColor: '#dbeafe',
      title: 'Interview Invitation',
      message: 'We are impressed with your application and would like to invite you for an interview. Our team will contact you shortly to schedule a convenient time.',
      nextSteps: [
        'Prepare for the interview',
        'Review the job description',
        'Research our company',
        'Prepare questions for the interviewers'
      ]
    },
    'pending': {
      color: '#6b7280',
      bgColor: '#f3f4f6',
      title: 'Application Status Update',
      message: 'Your application is currently under review. We will notify you as soon as there are any updates.',
      nextSteps: [
        'Keep your contact information up to date',
        'Check your email regularly for updates',
        'Feel free to apply for other positions that interest you'
      ]
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Status Update</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { max-width: 150px; margin-bottom: 20px; }
        .title { color: ${config.color}; font-size: 24px; font-weight: 600; margin: 0 0 10px; }
        .subtitle { color: #6b7280; font-size: 16px; margin: 0; }
        .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 24px; margin-bottom: 24px; }
        .card-title { color: ${config.color}; font-size: 18px; font-weight: 600; margin: 0 0 16px; }
        .status-badge { display: inline-block; background-color: ${config.bgColor}; color: ${config.color}; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 500; text-transform: uppercase; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .info-item { margin-bottom: 12px; }
        .info-label { color: #6b7280; font-size: 14px; margin-bottom: 4px; }
        .info-value { color: #1f2937; font-size: 15px; font-weight: 500; }
        .divider { border-top: 1px solid #e5e7eb; margin: 32px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 13px; }
        .button { display: inline-block; background-color: ${config.color}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; margin-top: 16px; }
        .next-steps { background-color: ${config.bgColor}; border-radius: 8px; padding: 16px; margin-top: 16px; }
        .next-steps-title { color: ${config.color}; font-size: 16px; font-weight: 600; margin: 0 0 12px; }
        .next-steps-list { margin: 0; padding-left: 20px; }
        .next-steps-list li { margin-bottom: 8px; }
        @media (max-width: 600px) {
          .info-grid { grid-template-columns: 1fr; }
          .container { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://your-logo-url.com/logo.png" alt="Company Logo" class="logo">
          <h1 class="title">${config.title}</h1>
          <p class="subtitle">Application Status Update for ${job.title}</p>
        </div>

        <div class="card">
          <h2 class="card-title">Status Update</h2>
          <div style="margin-bottom: 16px;">
            <span class="status-badge">${status}</span>
          </div>
          <p style="margin: 0 0 16px;">${config.message}</p>
          
          <div class="next-steps">
            <h3 class="next-steps-title">Next Steps</h3>
            <ul class="next-steps-list">
              ${config.nextSteps.map(step => `<li>${step}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">Application Details</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Position</div>
              <div class="info-value">${job.title}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Company</div>
              <div class="info-value">${job.company}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Location</div>
              <div class="info-value">${job.location}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Employment Type</div>
              <div class="info-value">${job.employmentType}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">Your Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Full Name</div>
              <div class="info-value">${application.firstName} ${application.middleName ? application.middleName + ' ' : ''}${application.lastName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value">${application.email}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Phone</div>
              <div class="info-value">${application.phoneNumber}</div>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="footer">
          <p style="margin: 0 0 8px;">This is an automated message. Please do not reply to this email.</p>
          <p style="margin: 0;">© ${new Date().getFullYear()} ${job.company}. All rights reserved.</p>
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
  const subject = type === 'signup' 
    ? 'Verify Your Email Address' 
    : 'Reset Your Password';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { max-width: 150px; margin-bottom: 20px; }
        .title { color: #2563eb; font-size: 24px; font-weight: 600; margin: 0 0 10px; }
        .subtitle { color: #6b7280; font-size: 16px; margin: 0; }
        .card { background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 24px; margin-bottom: 24px; }
        .otp-container { text-align: center; margin: 32px 0; }
        .otp-code { font-size: 32px; font-weight: 600; letter-spacing: 8px; color: #2563eb; background-color: #f3f4f6; padding: 16px 24px; border-radius: 8px; display: inline-block; }
        .divider { border-top: 1px solid #e5e7eb; margin: 32px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 13px; }
        .warning { color: #dc2626; font-size: 14px; margin-top: 16px; }
        @media (max-width: 600px) {
          .container { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://your-logo-url.com/logo.png" alt="Company Logo" class="logo">
          <h1 class="title">${subject}</h1>
          <p class="subtitle">${type === 'signup' ? 'Complete your registration' : 'Reset your account password'}</p>
        </div>

        <div class="card">
          <p style="margin: 0 0 16px;">
            ${type === 'signup' 
              ? 'Thank you for signing up! To complete your registration, please use the following verification code:'
              : 'We received a request to reset your password. Use the following code to verify your identity:'}
          </p>
          
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
          </div>

          <p style="margin: 0 0 16px;">
            This code will expire in 10 minutes. If you didn't request this ${type === 'signup' ? 'verification' : 'password reset'}, 
            please ignore this email.
          </p>

          <p class="warning">
            For security reasons, never share this code with anyone.
          </p>
        </div>

        <div class="divider"></div>

        <div class="footer">
          <p style="margin: 0 0 8px;">This is an automated message. Please do not reply to this email.</p>
          <p style="margin: 0;">© ${new Date().getFullYear()} Jobby. All rights reserved.</p>
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
}; 