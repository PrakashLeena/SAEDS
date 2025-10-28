# Contact Form Setup Guide

## Overview
The Contact Us page allows visitors to send messages directly through the website. Messages are sent via email using Nodemailer.

## Features

✅ **Contact Form** with validation  
✅ **Email notifications** to admin  
✅ **Confirmation email** to user  
✅ **Beautiful email templates** with HTML formatting  
✅ **Success/error messages** with user feedback  
✅ **Google Maps integration** for location  
✅ **Responsive design** for all devices  

## Email Configuration

### Step 1: Configure Email Service

Add these variables to your `.env` file in the backend directory:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CONTACT_EMAIL=contact@saeds.com
```

### Step 2: Gmail Setup (Recommended for Development)

If using Gmail:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification
   - App passwords → Select "Mail" and "Other"
   - Copy the generated 16-character password
   - Use this as `EMAIL_PASSWORD` in your `.env`

### Step 3: Alternative Email Services

You can use other email services by changing `EMAIL_SERVICE`:

**SendGrid:**
```env
EMAIL_SERVICE=SendGrid
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

**Outlook:**
```env
EMAIL_SERVICE=Outlook365
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

**Custom SMTP:**
```javascript
// In contactRoutes.js, replace createTransporter with:
return nodemailer.createTransporter({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## Contact Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Name | Text | Yes | Sender's full name |
| Email | Email | Yes | Sender's email address |
| Phone | Tel | No | Optional phone number |
| Subject | Text | Yes | Message subject |
| Message | Textarea | Yes | Message content |

## API Endpoint

### POST `/api/contact`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "General Inquiry",
  "message": "Hello, I have a question..."
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Your message has been sent successfully! We will get back to you soon."
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to send message. Please try again later."
}
```

## Email Templates

### Admin Notification Email
- Includes all form details
- Formatted with HTML for better readability
- Reply-to set to sender's email
- Timestamp included

### User Confirmation Email
- Thanks the user for contacting
- Includes a copy of their message
- Professional branding
- Reassures response time

## Frontend Component

### Contact Page Features

1. **Contact Information Section**
   - Email address
   - Phone number
   - Physical address
   - Office hours

2. **Contact Form**
   - Real-time validation
   - Loading states
   - Success/error messages
   - Clear user feedback

3. **Google Maps Integration**
   - Embedded map showing location
   - Customizable location pin

## Customization

### Update Contact Information

Edit the Contact page (`frontend/src/pages/Contact.js`):

```javascript
// Email
<a href="mailto:contact@saeds.com">
  contact@saeds.com
</a>

// Phone
<a href="tel:+1234567890">
  +1 (234) 567-890
</a>

// Address
<p className="text-gray-600">
  123 Community Street<br />
  City, State 12345<br />
  Country
</p>
```

### Update Google Maps Location

Replace the iframe `src` with your location:

1. Go to [Google Maps](https://www.google.com/maps)
2. Search for your location
3. Click "Share" → "Embed a map"
4. Copy the iframe URL
5. Replace in Contact.js

### Customize Email Templates

Edit `backend/routes/contactRoutes.js`:

- Modify `mailOptions.html` for admin email
- Modify `userMailOptions.html` for confirmation email
- Update colors, branding, and content

## Testing

### Development Testing

Without email credentials configured, the form will:
- Accept submissions
- Log messages to console
- Return success response
- Not send actual emails

### Production Testing

1. Configure email credentials in `.env`
2. Submit a test message
3. Check admin email inbox
4. Check sender's email for confirmation
5. Verify email formatting

## Security Best Practices

⚠️ **Important Security Notes:**

1. **Never commit `.env` file** to version control
2. **Use app-specific passwords** for Gmail
3. **Enable rate limiting** for production (prevent spam)
4. **Validate all inputs** on backend
5. **Sanitize email content** to prevent injection
6. **Use HTTPS** in production

## Rate Limiting (Recommended for Production)

Install express-rate-limit:
```bash
npm install express-rate-limit
```

Add to `contactRoutes.js`:
```javascript
const rateLimit = require('express-rate-limit');

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many messages from this IP, please try again later.'
});

router.post('/', contactLimiter, async (req, res) => {
  // ... existing code
});
```

## Troubleshooting

### Email not sending

1. Check `.env` configuration
2. Verify email credentials
3. Check console for error messages
4. Test with different email service
5. Check spam folder

### Gmail "Less secure app" error

- Use App Password instead of regular password
- Enable 2-Factor Authentication first

### Form submission fails

1. Check browser console for errors
2. Verify backend is running
3. Check API endpoint URL
4. Verify CORS configuration

## Support

For issues with:
- **Nodemailer**: [Nodemailer Documentation](https://nodemailer.com/)
- **Gmail Setup**: [Google App Passwords](https://support.google.com/accounts/answer/185833)
- **Contact Form**: Check browser console and backend logs
