import nodemailer from "nodemailer";
import axios from "axios";
require('dotenv').config({ path: '../../.env' });

// Set up email transporter (use real credentials or env vars in production)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ALERT_EMAIL_USER,
    pass: process.env.ALERT_EMAIL_PASS,
  },
});

export async function sendEmailAlert(threatName, riskScore) {
  if (!process.env.ALERT_EMAIL_USER || !process.env.ALERT_EMAIL_PASS) {
    console.error('Email credentials not configured');
    return false;
}

const mailOptions = {
    from: process.env.ALERT_EMAIL_USER,
    to: process.env.ADMIN_EMAIL || 'admin@example.com',
    subject: `🚨 High-Risk Threat Detected: ${threat}`,
    text: `A critical threat has been detected.\n\nThreat: ${threat}\nRisk Score: ${riskScore}`,
};

try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent for threat: ${threat}`);
    return true;
} catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
}
}

export async function sendWebhookAlert(threatName, riskScore) {
if (!process.env.WEBHOOK_URL) {
    console.error('Webhook URL not configured');
    return false;
}

try {
    await axios.post(process.env.WEBHOOK_URL, {
        threat,
        riskScore,
        message: 'Critical threat detected!',
        timestamp: new Date().toISOString()
    });
    console.log(`✅ Webhook sent for threat: ${threat}`);
    return true;
} catch (error) {
    console.error('❌ Failed to send webhook:', error.message);
    return false;
}
}

export function handleThreat(threat) {
  if (threat.riskScore > 20) {
    sendEmailAlert(threat.name, threat.riskScore);
    sendWebhookAlert(threat.name, threat.riskScore);
  }
}

module.exports = {
  sendEmailAlert,
  sendWebhookAlert,
  handleThreat
};
