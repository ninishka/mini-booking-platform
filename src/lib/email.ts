// This is a mock email service for demonstration purposes
// In a real application, you would use a proper email service like SendGrid, Mailgun, etc.

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  // In development, we'll just log the email
  if (process.env.NODE_ENV === 'development') {
    console.log('Sending email:', {
      to,
      subject,
      text,
      html,
    });
    return;
  }

  // In production, you would implement actual email sending here
  // Example using node-mailer:
  /*
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
  */
}

export function generateWelcomeEmail(email: string) {
  return {
    to: email,
    subject: 'Welcome to Booking Platform',
    text: `
Welcome to Booking Platform!

Thank you for joining our platform. You can now browse and book various objects.

Best regards,
The Booking Platform Team
    `.trim(),
    html: `
<h1>Welcome to Booking Platform!</h1>
<p>Thank you for joining our platform. You can now browse and book various objects.</p>
<p>Best regards,<br>The Booking Platform Team</p>
    `.trim(),
  };
}

export function generateObjectCreatedEmail(email: string, objectName: string) {
  return {
    to: email,
    subject: `New Object Created: ${objectName}`,
    text: `
Your new object "${objectName}" has been successfully created on Booking Platform.

You can view and manage your objects in your dashboard.

Best regards,
The Booking Platform Team
    `.trim(),
    html: `
<h1>New Object Created: ${objectName}</h1>
<p>Your new object "${objectName}" has been successfully created on Booking Platform.</p>
<p>You can view and manage your objects in your dashboard.</p>
<p>Best regards,<br>The Booking Platform Team</p>
    `.trim(),
  };
}

export function generateBookingConfirmationEmail(
  email: string,
  objectName: string,
  bookingDate: Date
) {
  return {
    to: email,
    subject: `Booking Confirmation: ${objectName}`,
    text: `
Your booking for "${objectName}" has been confirmed for ${bookingDate.toLocaleDateString()}.

Thank you for using our platform!

Best regards,
The Booking Platform Team
    `.trim(),
    html: `
<h1>Booking Confirmation: ${objectName}</h1>
<p>Your booking for "${objectName}" has been confirmed for ${bookingDate.toLocaleDateString()}.</p>
<p>Thank you for using our platform!</p>
<p>Best regards,<br>The Booking Platform Team</p>
    `.trim(),
  };
} 