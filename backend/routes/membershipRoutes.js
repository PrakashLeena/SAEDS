const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Transporter - reuse same Gmail settings as contact route
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MEMBER_EMAIL_USER || 'saedsmail2025@gmail.com',
    pass: process.env.MEMBER_EMAIL_PASS || 'kpyjjytladjgqjxb',
  },
});

// POST /api/membership/apply
router.post('/apply', async (req, res) => {
  try {
    const { name, age, university, reason, email } = req.body || {};

    if (!name || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide name and reason for joining' });
    }

    // Compose admin email
    const adminSubject = 'New Membership Application';
    const adminHtml = `
      <h2>New Membership Application</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Age:</strong> ${age || 'N/A'}</p>
      <p><strong>University:</strong> ${university || 'N/A'}</p>
      <p><strong>Email:</strong> ${email || 'N/A'}</p>
      <div style="margin-top:12px;"><strong>Reason:</strong><p>${reason.replace(/\n/g, '<br/>')}</p></div>
    `;

    const mailOptions = {
      from: process.env.MEMBER_EMAIL_USER || 'saedsmail2025@gmail.com',
      to: process.env.ADMIN_CONTACT_EMAIL || 'saedsmail2025@gmail.com',
      subject: adminSubject,
      html: adminHtml,
    };

    await transporter.sendMail(mailOptions);

    // If applicant provided an email, send a confirmation
    if (email) {
      const userMail = {
        from: process.env.MEMBER_EMAIL_USER || 'saedsmail2025@gmail.com',
        to: email,
        subject: 'Membership application received',
        html: `<p>Hi ${name},</p><p>Thank you for your application to join our community. We have received your submission and will review it shortly.</p><p>— SAEDS Community Team</p>`,
      };
      await transporter.sendMail(userMail);
    }

    return res.json({ success: true, message: 'Application submitted' });
  } catch (err) {
    console.error('Error handling membership application:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit application', error: err.message });
  }
});

module.exports = router;
