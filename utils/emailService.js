// utils/emailService.js
import nodemailer from "nodemailer";

let transporter = null;
let emailConfigured = false;

// Initialize email service
export const initEmailService = () => {
  const hasEmailCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS;
  
  console.log('Initializing Email Service:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Exists' : 'Missing');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length + ' characters' : 'Missing');

  if (hasEmailCredentials) {
    try {
      console.log('Setting up Gmail transporter...');
      
      // Try multiple Gmail configurations
      const configs = [
        {
          // Configuration 1: Standard Gmail
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        },
        {
          // Configuration 2: Explicit SMTP
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        },
        {
          // Configuration 3: SSL
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        }
      ];

      let configIndex = 0;
      
      const tryConfig = (index) => {
        if (index >= configs.length) {
          console.log("❌ All Gmail configurations failed");
          emailConfigured = false;
          return;
        }

        console.log(`Trying configuration ${index + 1}...`);
        transporter = nodemailer.createTransport(configs[index]);

        transporter.verify(function(error, success) {
          if (error) {
            console.log(`❌ Configuration ${index + 1} failed:`, error.message);
            tryConfig(index + 1);
          } else {
            console.log(`✅ Configuration ${index + 1} successful!`);
            console.log("✅ Email server is ready to send messages");
            emailConfigured = true;
          }
        });
      };

      tryConfig(0);

    } catch (error) {
      console.log('❌ Error creating transporter:', error.message);
      emailConfigured = false;
    }
  } else {
    console.log("ℹ️ Email credentials not found. Using development mode.");
    emailConfigured = false;
  }
};

// Generate random OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Your VS Gifts Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>VS Gifts Verification</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #e9ecef;">
          
          <!-- Header -->
          <div style="background: #4a90e2; padding: 24px; text-align: center;">
            <div style="display: inline-block; background: white; padding: 12px; border-radius: 12px;">
              <!-- Replace with your logo -->
              <div style="font-size: 24px; color: #2c3e50; font-weight: bold;">VS</div>
            </div>
            <h1 style="color: white; margin: 16px 0 0 0; font-size: 22px; font-weight: 500;">VS Gifts</h1>
          </div>

          <!-- Content -->
          <div style="padding: 32px;">
            <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; text-align: center;">
              Verify Your Email Address
            </h2>
            
            <p style="color: #6c757d; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
              Thanks for joining VS Gifts! To complete your registration, enter this verification code:
            </p>

            <!-- OTP Code -->
            <div style="background: #f8f9fa; padding: 24px; border-radius: 8px; border: 2px solid #e9ecef; text-align: center; margin: 0 0 24px 0;">
              <div style="font-size: 32px; font-weight: 700; color: #2c3e50; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 0 0 8px 0;">
                ${otp}
              </div>
              <div style="color: #6c757d; font-size: 14px;">
                ↻ Expires in 10 minutes
              </div>
            </div>

            <!-- Instructions -->
            <div style="background: #e8f4f8; padding: 16px; border-radius: 6px; border-left: 4px solid #3498db; margin: 0 0 24px 0;">
              <p style="color: #2c3e50; margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">What to do next:</p>
              <ol style="color: #6c757d; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                <li>Return to the VS Gifts website or app</li>
                <li>Enter the 6-digit code above</li>
                <li>Start exploring our gift collection!</li>
              </ol>
            </div>

            <!-- Support -->
            <div style="text-align: center; padding: 20px 0 0 0; border-top: 1px solid #e9ecef;">
              <p style="color: #6c757d; margin: 0 0 12px 0; font-size: 14px;">
                Need help? We're here for you.
              </p>
              <a href="mailto:support@vsgifts.com" style="color: #3498db; text-decoration: none; font-size: 14px; font-weight: 500;">
                Contact Support →
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; margin: 0 0 8px 0; font-size: 12px;">
              This is an automated message. Please do not reply.
            </p>
            <p style="color: #adb5bd; margin: 0; font-size: 12px;">
              © 2024 VS Gifts. All rights reserved.
            </p>
          </div>

        </div>

        <!-- Security Note -->
        <div style="max-width: 500px; margin: 16px auto 0 auto; padding: 16px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px;">
          <p style="color: #856404; margin: 0; font-size: 12px; text-align: center;">
            ⚠️ For your security, never share this code with anyone.
          </p>
        </div>
      </body>
      </html>
    `
  };

  try {
    console.log('📧 Attempting to send OTP email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully to:', email);
    console.log('📧 Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    throw new Error('Failed to send OTP email: ' + error.message);
  }
};

// Development mode - just log the OTP
const sendTestOTPEmail = async (email, otp) => {
  console.log('\n📧 === OTP VERIFICATION (Development Mode) ===');
  console.log('To:', email);
  console.log('OTP:', otp);
  console.log('Expires: 10 minutes');
  console.log('=============================================\n');
  
  return true;
};

// Main OTP sending function
export const sendOTP = async (email, otp) => {
  if (emailConfigured && transporter) {
    return await sendOTPEmail(email, otp);
  } else {
    return await sendTestOTPEmail(email, otp);
  }
};

// Test email connection
export const testEmailConnection = async () => {
  if (!transporter) {
    return { success: false, message: "Transporter not initialized" };
  }

  try {
    await transporter.verify();
    return { success: true, message: "Email connection successful" };
  } catch (error) {
    return { success: false, message: "Email connection failed: " + error.message };
  }
};