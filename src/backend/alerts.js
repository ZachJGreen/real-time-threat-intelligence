// /src/alerts.js
const nodemailer = require('nodemailer');

async function sendAlertEmail(threat, risk_score) {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // or your provider
        auth: {
            user: process.env.ALERT_EMAIL_USER,
            pass: process.env.ALERT_EMAIL_PASS
        }
    });

    const message = {
        from: process.env.ALERT_EMAIL_USER,
        to: 'lrsdht@umsystem.edu',
        subject: '🚨 High-Risk Threat Detected!',
        text: `Threat: ${threat}\nRisk Score: ${risk_score}`
    };

    try {
        await transporter.sendMail(message);
        console.log('[+] Alert sent!');
    } catch (error) {
        console.error('[-] Failed to send alert:', error);
    }
}

module.exports = { sendAlertEmail };
