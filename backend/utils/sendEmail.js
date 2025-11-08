const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Support both EMAIL_PASSWORD and EMAIL_PASS (legacy / .env differences)
  const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: emailPassword
    }
  });

  // Build a friendly "from" value. Use EMAIL_FROM if provided, otherwise fallback to the
  // configured user/email. This avoids sending from "undefined <...>" when EMAIL_FROM is missing.
  const fromName = process.env.EMAIL_FROM || '';
  const from = fromName ? `${fromName} <${process.env.EMAIL_USER}>` : process.env.EMAIL_USER;

  const message = {
    from,
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  try {
    // Optional: verify transporter settings in debug/dev to fail fast
    if (process.env.NODE_ENV !== 'production') {
      try {
        await transporter.verify();
      } catch (verifyErr) {
        console.warn('Email transporter verification failed:', verifyErr && verifyErr.message ? verifyErr.message : verifyErr);
        // Continue — sendMail will return a clearer error if it fails
      }
    }

    await transporter.sendMail(message);
  } catch (err) {
    // Re-throw with additional context so callers can log/use the message
    const e = new Error(`Failed to send email to ${options.email}: ${err && err.message ? err.message : err}`);
    e.original = err;
    throw e;
  }
};

module.exports = sendEmail;
