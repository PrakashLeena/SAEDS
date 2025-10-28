const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Create transporter for sending emails
// Use the correct nodemailer API: createTransport (not createTransporter)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'saedsmail2025@gmail.com',
    pass: 'kpyjjytladjgqjxb',
  },
});

// POST /api/contact - Send contact form message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, subject, and message',
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Create email content for admin
    const mailOptions = {
      from: 'saedsmail2025@gmail.com',
      to: 'saedsmail2025@gmail.com',
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 10px;">New Contact Form Submission</h2>
          
          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;"><strong style="color: #333;">Name:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong style="color: #333;">Email:</strong> <a href="mailto:${email}" style="color: #0284c7;">${email}</a></p>
            ${phone ? `<p style="margin: 10px 0;"><strong style="color: #333;">Phone:</strong> ${phone}</p>` : ''}
            <p style="margin: 10px 0;"><strong style="color: #333;">Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong style="color: #333;">Message:</strong></p>
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
            <p>This email was sent from the SAEDS Community Hub contact form.</p>
            <p>Received at: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
Subject: ${subject}

Message:
${message}

---
This email was sent from the SAEDS Community Hub contact form.
Received at: ${new Date().toLocaleString()}
      `,
    };

    // Send confirmation email to user
    const userMailOptions = {
      from: 'saedsmail2025@gmail.com',
      to: email,
      subject: 'Thank you for contacting SAEDS Community Hub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #0284c7;">Thank You for Reaching Out!</h2>
          
          <p style="line-height: 1.6;">Dear ${name},</p>
          
          <p style="line-height: 1.6;">Thank you for contacting SAEDS Community Hub. We have received your message and will get back to you as soon as possible.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Your Message:</strong></p>
            <p style="margin: 0;"><strong>Subject:</strong> ${subject}</p>
            <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${message}</p>
          </div>
          
          <p style="line-height: 1.6;">If you have any urgent concerns, please feel free to reach out to us directly.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="margin: 5px 0; color: #666;">Best regards,</p>
            <p style="margin: 5px 0; color: #0284c7; font-weight: bold;">SAEDS Community Hub Team</p>
          </div>
        </div>
      `,
    };

    // Send emails
    console.log('Attempting to send email...');
    console.log('From:', 'saedsmail2025@gmail.com');
    console.log('To Admin:', 'saedsmail2025@gmail.com');
    
    // Send to admin
    const adminInfo = await transporter.sendMail(mailOptions);
    console.log('✅ Admin email sent successfully. Message ID:', adminInfo.messageId);
    
    // Send confirmation to user
    console.log('Sending confirmation to user:', email);
    const userInfo = await transporter.sendMail(userMailOptions);
    console.log('✅ User confirmation email sent successfully. Message ID:', userInfo.messageId);

    res.json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
    });
  } catch (error) {
    console.error('Error sending contact email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
