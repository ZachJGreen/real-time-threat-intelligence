const nodemailer = require("nodemailer");
const axios = require("axios");
const supabase = require('./supabase');
require('dotenv').config({ path: '../../.env' });

// Set up email transporter (use real credentials or env vars in production)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ALERT_EMAIL_USER,
    pass: process.env.ALERT_EMAIL_PASS,
  },
});

async function sendEmailAlert(threatName, riskScore) {
  if (!process.env.ALERT_EMAIL_USER || !process.env.ALERT_EMAIL_PASS) {
    console.error('Email credentials not configured');
    return false;
}

const mailOptions = {
    from: process.env.ALERT_EMAIL_USER,
    to: process.env.ADMIN_EMAIL || 'admin@example.com',
    subject: `🚨 High-Risk Threat Detected: ${threatName}`,
    text: `A critical threat has been detected.\n\nThreat: ${threatName}\nRisk Score: ${riskScore}`,
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

async function sendWebhookAlert(threatName, riskScore) {
if (!process.env.WEBHOOK_URL) {
    console.error('Webhook URL not configured');
    return false;
}

try {
    await axios.post(process.env.WEBHOOK_URL, {
        threatName,
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

async function storeAlertInDatabase(threatName, riskScore, description = '') {
  try {
    // Find the associated threat in the database
    const { data: threats } = await supabase
      .from('threats')
      .select('id')
      .ilike('threat_name', `%${threatName}%`)
      .limit(1);
    
    const threatId = threats && threats.length > 0 ? threats[0].id : null;
    
    // Store the alert
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        alert_type: riskScore >= 20 ? 'Critical' : 'High Risk',
        threat_id: threatId,
        risk_score: riskScore,
        description: description || `${threatName} detected with risk score of ${riskScore}`,
        status: 'Open',
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Failed to store alert in database:', error);
      return false;
    }
    
    console.log('Alert stored in database successfully:', data);
    return true;
  } catch (error) {
    console.error('Error storing alert in database:', error);
    return false;
  }
}

async function handleThreat(threat) {
  if (threat.riskScore > 20) {
    // Send notifications
    await sendEmailAlert(threat.name, threat.riskScore);
    await sendWebhookAlert(threat.name, threat.riskScore);
    
    // Store in database
    await storeAlertInDatabase(
      threat.name, 
      threat.riskScore, 
      threat.description || null
    );
  }
}



module.exports = {
  sendEmailAlert,
  sendWebhookAlert,
  storeAlertInDatabase,
  handleThreat
};
