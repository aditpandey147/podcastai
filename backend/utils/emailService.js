require("dotenv").config();
const { SendMailClient } = require("zeptomail");

// ============================================================
// 📧 EMAIL CONFIGURATION
// ============================================================

// ✅ Token
const ZEPTOMAIL_TOKEN =
  process.env.ZEPTOMAIL_API_KEY || process.env.ZEPTOMAIL_TOKEN;

// ✅ Email addresses (with fallbacks)
const FROM_EMAIL = process.env.WELCOME_EMAIL;
const ALERTS_EMAIL = process.env.ALERTS_EMAIL;
const WELCOME_EMAIL = process.env.WELCOME_EMAIL;

// ✅ Names - Updated to AI Digital Product Factory
const WELCOME_NAME = process.env.WELCOME_NAME || "AI Digital Product Factory";
const ALERTS_NAME =
  process.env.ALERTS_NAME || "AI Digital Product Factory Alerts";

// ✅ SAFE logging
console.log("📧 Email Configuration:");
console.log(`   Token: ${ZEPTOMAIL_TOKEN ? "✅ Set" : "❌ Not Set"}`);
console.log(`   Welcome Email: ${WELCOME_EMAIL}`);
console.log(`   Alert Email: ${ALERTS_EMAIL}`);
console.log(`   Welcome Name: ${WELCOME_NAME}`);
console.log(`   Alert Name: ${ALERTS_NAME}`);

// ✅ Initialize ZeptoMail client
let client = null;

if (ZEPTOMAIL_TOKEN) {
  try {
    client = new SendMailClient({
      url: "https://api.zeptomail.in/v1.1/email",
      token: ZEPTOMAIL_TOKEN,
    });
    console.log("✅ ZeptoMail client initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize ZeptoMail client:", error.message);
  }
} else {
  console.log("⚠️ ZEPTOMAIL_API_KEY not set - Email sending disabled");
}

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

// ============================================================
// 📧 SEND WELCOME EMAIL
// ============================================================

exports.sendWelcomeEmail = async (user, password) => {
  try {
    if (process.env.DISABLE_EMAILS === "true") {
      console.log("📧 [DISABLED] Welcome email would be sent to:", user.email);
      console.log(`🔑 Password: ${password || "Not set"}`);
      return true;
    }

    if (!user?.email) {
      console.log("❌ No email provided");
      return false;
    }

    if (!client) {
      console.log("⚠️ Email client not initialized");
      console.log(`📧 Would have sent to: ${user.email}`);
      return false;
    }

    if (!WELCOME_EMAIL) {
      console.log("⚠️ No welcome sender email configured");
      return false;
    }

    console.log(`📧 Sending welcome email to: ${user.email}`);
    console.log(`   From: ${WELCOME_EMAIL}`);

    await client.sendMail({
      from: {
        address: WELCOME_EMAIL,
        name: WELCOME_NAME,
      },
      to: [
        {
          email_address: {
            address: user.email,
            name: user.name || "User",
          },
        },
      ],
      subject: "🎙️ Welcome to PodcastAI! Your account is ready",
      htmlbody: `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
      
      <!-- Header — Purple → Blue gradient -->
      <div style="background: linear-gradient(135deg, #6e35ed 0%, #3477ff 100%); padding: 40px 24px 32px; text-align: center; position: relative;">
        <div style="position: relative; z-index: 1;">
          <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 50px; margin-bottom: 12px;">
            <span style="color: #FFFFFF; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">Account Activated</span>
          </div>
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700;">Welcome to PodcastAI! 🎙️</h1>
          <p style="color: #E0D5FF; margin: 8px 0 0; font-size: 14px; font-weight: 500;">Your account has been created successfully</p>
        </div>
      </div>
      
      <!-- Body -->
      <div style="padding: 32px 28px;">
        <p style="color: #1F2937; font-size: 15px; margin: 0 0 16px; font-weight: 500;">
          Hi <strong style="color: #111827;">${user.name || "there"}</strong> 👋,
        </p>
        <p style="color: #6B7280; font-size: 14px; margin: 0 0 24px; line-height: 1.7;">
          Thank you for signing up with <strong style="color: #111827;">PodcastAI</strong>! Your account is now active and ready to use. Start creating amazing AI-powered podcast videos with host &amp; guest dialogues, AI covers, and trending topics — in minutes.
        </p>
        
        <!-- Credentials Box — purple-tinted -->
        <div style="background: linear-gradient(135deg, #F5F0FF 0%, #EEE7FF 100%); border: 1px solid #C4B5FD; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <div style="display: flex; align-items: flex-start; gap: 14px;">
            <div style="background: linear-gradient(135deg, #6e35ed 0%, #3477ff 100%); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span style="font-size: 20px;">🔑</span>
            </div>
            <div>
              <p style="color: #4C1D95; font-size: 14px; font-weight: 600; margin: 0;">Your Login Credentials</p>
              <div style="color: #5B21B6; font-size: 13px; margin: 6px 0 0; line-height: 1.8;">
                <strong>Email:</strong> ${user.email}<br>
                <strong>Password:</strong> ${password || user.email}
              </div>
              <p style="color: #7C3AED; font-size: 11px; margin: 6px 0 0; display: flex; align-items: center; gap: 4px;">
                ⚠️ Please change your password after login
              </p>
            </div>
          </div>
        </div>

        <!-- CTA Button — purple → blue gradient -->
        <div style="text-align: center;">
          <a href="${frontendUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6e35ed 0%, #3477ff 100%); color: #FFFFFF; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(110, 53, 237, 0.35);">
            Go to Dashboard →
          </a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="border-top: 1px solid #E5E7EB; padding: 20px 24px; text-align: center; background: #F9FAFB;">
        <p style="color: #9CA3AF; font-size: 12px; margin: 0 0 4px;">
          <strong style="color: #6B7280;">PodcastAI</strong>
        </p>
        <p style="color: #9CA3AF; font-size: 11px; margin: 0;">
          © ${new Date().getFullYear()} All rights reserved. · 
          <a href="${frontendUrl}/settings" style="color: #6B7280; text-decoration: underline;">Notification Settings</a>
        </p>
      </div>
    </div>
  `,
    });

    console.log("✅ Welcome email sent successfully to:", user.email);
    return true;
  } catch (error) {
    console.error("❌ Welcome email failed:", error.message);
    if (error.response) {
      console.error(
        "📋 ZeptoMail Response:",
        JSON.stringify(error.response.data, null, 2),
      );
    }
    return false;
  }
};

// ============================================================
// 📧 SEND PASSWORD RESET EMAIL
// ============================================================

exports.sendPasswordResetEmail = async (user, resetUrl) => {
  try {
    if (!user?.email) {
      console.log("❌ No email provided");
      return false;
    }

    if (process.env.DISABLE_EMAILS === "true") {
      console.log(
        "📧 [DISABLED] Password reset email would be sent to:",
        user.email,
      );
      console.log(`🔗 Reset URL: ${resetUrl}`);
      return true;
    }

    if (!client) {
      console.log("⚠️ Email client not initialized");
      console.log(`📧 Would have sent to: ${user.email}`);
      console.log(`🔗 Reset URL: ${resetUrl}`);
      return false;
    }

    const fromEmail =
      process.env.WELCOME_EMAIL ||
      process.env.ALERTS_EMAIL ||
      "no-reply@albinolabs.com";
    const fromName = process.env.WELCOME_NAME || "AI Digital Product Factory";

    console.log(`📧 Sending password reset email to: ${user.email}`);

    await client.sendMail({
      from: {
        address: fromEmail,
        name: fromName,
      },
      to: [
        {
          email_address: {
            address: user.email,
            name: user.name || "User",
          },
        },
      ],
      subject: "🔑 Reset Your AI Digital Product Factory Password",
      htmlbody: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #FACC15 0%, #F59E0B 100%); padding: 32px 24px; text-align: center;">
            <div style="display: inline-block; background: rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 50px; margin-bottom: 12px;">
              <span style="color: #FFFFFF; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">Password Reset</span>
            </div>
            <h1 style="color: #111827; margin: 0; font-size: 22px; font-weight: 700;">🔑 Reset Your Password</h1>
            <p style="color: #78350F; margin: 8px 0 0; font-size: 14px;">AI Digital Product Factory Password Reset Request</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 32px 28px;">
            <p style="color: #1F2937; font-size: 15px; margin: 0 0 16px; font-weight: 500;">
              Hi <strong style="color: #111827;">${user.name || "there"}</strong>,
            </p>
            <p style="color: #6B7280; font-size: 14px; margin: 0 0 24px; line-height: 1.7;">
              We received a request to reset your AI Digital Product Factory account password. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #FACC15 0%, #F59E0B 100%); color: #111827; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(250, 204, 21, 0.35);">
                Reset Password →
              </a>
            </div>

            <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #92400E; font-size: 12px; margin: 0; display: flex; align-items: center; gap: 8px;">
                ⏰ This link will expire in <strong>1 hour</strong>
              </p>
            </div>
            
            <p style="color: #6B7280; font-size: 12px; margin: 0 0 8px;">
              If you didn't request this, please ignore this email.
            </p>
            <p style="color: #9CA3AF; font-size: 11px; margin: 0;">
              For security, never share this link with anyone.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #E5E7EB; padding: 20px 24px; text-align: center; background: #F9FAFB;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0 0 4px;">
              <strong style="color: #6B7280;">AI Digital Product Factory</strong>
            </p>
            <p style="color: #9CA3AF; font-size: 11px; margin: 0;">
              © ${new Date().getFullYear()} All rights reserved. · 
              <a href="${frontendUrl}/settings" style="color: #6B7280; text-decoration: underline;">Notification Settings</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("✅ Password reset email sent to:", user.email);
    return true;
  } catch (error) {
    console.error("❌ Password reset email failed:", error.message);
    if (error.response) {
      console.error(
        "📋 ZeptoMail Response:",
        JSON.stringify(error.response.data, null, 2),
      );
    }
    return false;
  }
};

// ============================================================
// 🧪 TEST EMAIL CONFIGURATION
// ============================================================

exports.testEmailConfig = async () => {
  console.log("\n🧪 Testing Email Configuration...");
  console.log("=".repeat(50));
  console.log(`   Welcome Email: ${WELCOME_EMAIL || "Not configured"}`);
  console.log(`   Alert Email: ${ALERTS_EMAIL || "Not configured"}`);
  console.log(`   Token: ${ZEPTOMAIL_TOKEN ? "✅ Set" : "❌ Not Set"}`);
  console.log(`   Client: ${client ? "✅ Initialized" : "❌ Not Initialized"}`);
  console.log(`   Welcome Name: ${WELCOME_NAME}`);
  console.log(`   Alert Name: ${ALERTS_NAME}`);
  console.log("=".repeat(50));

  if (!WELCOME_EMAIL) {
    console.log("\n⚠️ No welcome sender email configured!");
    console.log("   Add to .env: WELCOME_EMAIL=no-reply@albinolabs.com");
    return false;
  }

  if (!ALERTS_EMAIL) {
    console.log("\n⚠️ No alert sender email configured!");
    console.log("   Add to .env: ALERTS_EMAIL=no-reply@albinolabs.com");
    return false;
  }

  if (!ZEPTOMAIL_TOKEN) {
    console.log("\n⚠️ No ZeptoMail token configured!");
    console.log("   Add to .env: ZEPTOMAIL_API_KEY=your-token-here");
    return false;
  }

  if (client) {
    try {
      console.log("\n📧 Sending test email...");
      await client.sendMail({
        from: {
          address: WELCOME_EMAIL,
          name: "AI Digital Product Factory Test",
        },
        to: [
          {
            email_address: {
              address: WELCOME_EMAIL,
              name: "Test User",
            },
          },
        ],
        subject: "🧪 Test Email from AI Digital Product Factory",
        htmlbody: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB;">
            <h2 style="color: #111827;">🧪 Test Email</h2>
            <p style="color: #6B7280;">This is a test email to verify your ZeptoMail configuration for <strong>AI Digital Product Factory</strong>.</p>
            <p style="color: #6B7280;">✅ Email configuration is working correctly!</p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 16px 0;">
            <p style="color: #9CA3AF; font-size: 12px;">Sent from AI Digital Product Factory</p>
          </div>
        `,
      });
      console.log("✅ Test email sent successfully!");
      return true;
    } catch (error) {
      console.error("❌ Test email failed:", error.message);
      if (error.response) {
        console.error(
          "Response:",
          JSON.stringify(error.response.data, null, 2),
        );
      }
      return false;
    }
  }

  return false;
};
