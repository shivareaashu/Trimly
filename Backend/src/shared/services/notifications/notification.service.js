const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'no-reply@trimly.com';

let transporter = null;
let transportInitAttempted = false;
let transportUnavailableLogged = false;

async function getTransporter() {
  if (transportInitAttempted) {
    return transporter;
  }

  transportInitAttempted = true;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  try {
    const { default: nodemailer } = await import('nodemailer');
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10),
      secure: parseInt(SMTP_PORT, 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  } catch (error) {
    if (!transportUnavailableLogged) {
      transportUnavailableLogged = true;
      console.warn('[Notification Service] Email disabled:', error.message);
    }
    transporter = null;
  }

  return transporter;
}

/**
 * Core function to send notification emails.
 * Falls back to console logging in development if SMTP credentials are not configured.
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Compiled HTML body
 * @param {string} [options.text] - Plain text body
 */
export async function sendEmail({ to, subject, html, text }) {
  const activeTransporter = await getTransporter();

  if (activeTransporter) {
    try {
      const info = await activeTransporter.sendMail({
        from: SMTP_FROM,
        to,
        subject,
        html,
        text
      });
      console.log(`[Notification Service] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`[Notification Service] Failed to send email to ${to}:`, error);
      throw error;
    }
  } else {
    // Mock logger fallback
    console.log(`
=========================================
[MOCK EMAIL NOTIFICATION DISPATCHED]
To: ${to}
Subject: ${subject}
-----------------------------------------
${text || html.replace(/<[^>]*>/g, '')}
=========================================
    `);
    return { mock: true, to, subject };
  }
}

/**
 * Pre-compiled notification templates.
 */
export const notificationTemplates = {
  bookingCreated: (booking, customer, service, tenant) => ({
    subject: `Booking Confirmed - Ref: ${booking.bookingReference}`,
    text: `Hello ${customer.firstName},\n\nYour appointment at ${tenant.name} is confirmed!\nService: ${service.name}\nTime: ${new Date(booking.startTime).toLocaleString()}\nReference ID: ${booking.bookingReference}\n\nThank you for choosing Trimly!`,
    html: `
      <h2>Booking Confirmed</h2>
      <p>Hello <strong>${customer.firstName}</strong>,</p>
      <p>Your appointment at <strong>${tenant.name}</strong> is confirmed!</p>
      <ul>
        <li><strong>Service:</strong> ${service.name}</li>
        <li><strong>Date & Time:</strong> ${new Date(booking.startTime).toLocaleString()}</li>
        <li><strong>Reference ID:</strong> ${booking.bookingReference}</li>
      </ul>
      <p>Thank you for choosing Trimly!</p>
    `
  }),

  paymentPaid: (payment, customer, booking, tenant) => ({
    subject: `Receipt for Payment - Ref: ${booking?.bookingReference || 'N/A'}`,
    text: `Hello ${customer.firstName},\n\nWe have received your payment of Rs. ${payment.amount} for your appointment at ${tenant.name}.\nPayment Method: ${payment.paymentMethod}\nReference ID: ${booking?.bookingReference || 'N/A'}\n\nThank you!`,
    html: `
      <h2>Payment Received</h2>
      <p>Hello <strong>${customer.firstName}</strong>,</p>
      <p>We have received your payment for your appointment at <strong>${tenant.name}</strong>.</p>
      <ul>
        <li><strong>Amount:</strong> Rs. ${payment.amount}</li>
        <li><strong>Payment Method:</strong> ${payment.paymentMethod}</li>
        <li><strong>Booking Ref:</strong> ${booking?.bookingReference || 'N/A'}</li>
      </ul>
      <p>Thank you for your business!</p>
    `
  }),

  appointmentReminder: (booking, customer, service, tenant) => ({
    subject: `Reminder: Upcoming Appointment at ${tenant.name}`,
    text: `Hello ${customer.firstName},\n\nThis is a quick reminder for your upcoming appointment at ${tenant.name}.\nService: ${service.name}\nTime: ${new Date(booking.startTime).toLocaleString()}\n\nWe look forward to seeing you!`,
    html: `
      <h2>Appointment Reminder</h2>
      <p>Hello <strong>${customer.firstName}</strong>,</p>
      <p>This is a quick reminder for your upcoming appointment at <strong>${tenant.name}</strong>.</p>
      <ul>
        <li><strong>Service:</strong> ${service.name}</li>
        <li><strong>Date & Time:</strong> ${new Date(booking.startTime).toLocaleString()}</li>
      </ul>
      <p>We look forward to seeing you!</p>
    `
  }),

  trialExpiring: (tenant, owner) => ({
    subject: `Your Trimly Trial is Expiring Soon!`,
    text: `Hello ${owner.firstName},\n\nYour Trimly trial for ${tenant.name} is expiring on ${new Date(tenant.trialEndsAt).toLocaleDateString()}.\nTo avoid any service interruption, please upgrade your subscription plan.\n\nBest regards,\nThe Trimly Team`,
    html: `
      <h2>Trimly Trial Expiring</h2>
      <p>Hello <strong>${owner.firstName}</strong>,</p>
      <p>Your Trimly trial for <strong>${tenant.name}</strong> is expiring on <strong>${new Date(tenant.trialEndsAt).toLocaleDateString()}</strong>.</p>
      <p>To avoid any service interruption, please upgrade your subscription plan in the platform control panel.</p>
      <p>Best regards,<br/>The Trimly Team</p>
    `
  })
};
