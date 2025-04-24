import nodemailer from "nodemailer";
import axios from "axios";

const ADMIN_EMAIL = "admin@example.com";
const WEBHOOK_URL = "https://your-webhook-url.com/alert";

// Set up email transporter (use real credentials or env vars in production)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "your-app-password",
  },
});

export async function sendEmailAlert(threatName, riskScore) {
  const mailOptions = {
    from: '"Threat Monitor" <your-email@gmail.com>',
    to: ADMIN_EMAIL,
    subject: `🚨 High-Risk Threat: ${threatName}`,
    text: `A critical threat has been detected.\n\nThreat: ${threatName}\nRisk Score: ${riskScore}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent for threat: ${threatName}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
}

export async function sendWebhookAlert(threatName, riskScore) {
  try {
    await axios.post(WEBHOOK_URL, {
      threat: threatName,
      riskScore,
      message: "Critical threat detected!",
    });
    console.log(`✅ Webhook sent for threat: ${threatName}`);
  } catch (error) {
    console.error("❌ Failed to send webhook:", error.response || error.message);
  }
}

export function handleThreat(threat) {
  if (threat.riskScore > 20) {
    sendEmailAlert(threat.name, threat.riskScore);
    sendWebhookAlert(threat.name, threat.riskScore);
  }
}