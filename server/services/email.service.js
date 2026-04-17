const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOTPEmail(to, otp, name) {
  await transporter.sendMail({
    from: `"DOTE Admissions" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your OTP for DOTE Admission Portal',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px">
        <h2 style="color:#1e3a5f">DOTE Admission Management System</h2>
        <p>Dear ${name || 'Applicant'},</p>
        <p>Your One-Time Password (OTP) for registration is:</p>
        <h1 style="color:#e74c3c;letter-spacing:8px;text-align:center">${otp}</h1>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p>Do not share this OTP with anyone.</p>
        <hr/>
        <p style="font-size:12px;color:#999">Government of Tamil Nadu – Directorate of Technical Education</p>
      </div>
    `,
  });
}

async function sendConfirmationEmail(to, name, applicationNo) {
  await transporter.sendMail({
    from: `"DOTE Admissions" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Application Submitted Successfully – DOTE Admissions',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px">
        <h2 style="color:#1e3a5f">Application Submitted</h2>
        <p>Dear ${name},</p>
        <p>Your application has been successfully submitted.</p>
        <p><strong>Application Number:</strong> ${applicationNo}</p>
        <p>You can track your application status by logging into the DOTE Admission Portal.</p>
        <hr/>
        <p style="font-size:12px;color:#999">Government of Tamil Nadu – Directorate of Technical Education</p>
      </div>
    `,
  });
}

module.exports = { sendOTPEmail, sendConfirmationEmail };
