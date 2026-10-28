const express = require("express");
const User = require("../../models/auth/User");
const Plan = require("../../models/auth/Plan");
const Payment = require("../../models/auth/Payment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendWelcomeEmail } = require("../../utils/emailService");
const router = express.Router();

// ✅ Development: Skip verification | Production: Verify signatures
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

const getPlatform = () => {
  const platform = process.env.PAYMENT_PLATFORM || "jvzoo";
  console.log(`📌 Using payment platform: ${platform.toUpperCase()}`);
  return platform;
};

// JVZoo V2 Signature
const verifyV2Signature = (data, secretKey) => {
  const stringToHash = [
    data.paykey || "",
    data.customer_email || "",
    data.product_name || "",
    data.transaction_type || "",
    data.date || "",
    secretKey,
  ].join("|");

  const calculated = crypto
    .createHash("sha1")
    .update(stringToHash, "utf-8")
    .digest("hex")
    .substring(0, 8)
    .toUpperCase();

  return calculated === data.cverify;
};

// JVZoo V1 Signature
const verifyV1Signature = (data, secretKey) => {
  const { ctransaction, ctransamount, cproditem, cverify } = data;
  const stringToSign = `${secretKey}|${ctransaction}|${ctransamount}|${cproditem}`;
  const calculated = crypto
    .createHash("sha1")
    .update(stringToSign)
    .digest("hex");

  return calculated === cverify;
};

// LaunchPad Signature
const verifyLaunchPadSignature = (data, secretKey) => {
  const stringToSign = [
    secretKey,
    data.transaction_id || "",
    data.total_amount || "",
    data.product_id || "",
    data.user?.email || "",
  ].join("|");

  const calculated = crypto
    .createHash("sha256")
    .update(stringToSign)
    .digest("hex");

  return calculated === data.signature;
};

// ============================================================
// 📋 FIELD MAPPING
// ============================================================

// JVZoo V1 to V2 Mapping
const mapV1ToV2 = (v1Data) => {
  return {
    paykey: v1Data.ctransaction || "",
    transaction_id: v1Data.ctransreceipt || v1Data.ctransaction || "",
    transaction_type: v1Data.ctransaction_type || "SALE",
    total: v1Data.ctransamount
      ? (parseFloat(v1Data.ctransamount) / 100).toString()
      : "0.00",
    date: v1Data.ctranstime
      ? new Date(parseInt(v1Data.ctranstime) * 1000)
          .toISOString()
          .replace("T", " ")
          .substring(0, 19)
      : "",
    product_id: v1Data.cproditem || "",
    product_name: v1Data.cprodtitle || "",
    customer_email: v1Data.ccustemail || "",
    customer_first_name: v1Data.ccustname ? v1Data.ccustname.split(" ")[0] : "",
    customer_last_name: v1Data.ccustname
      ? v1Data.ccustname.split(" ").slice(1).join(" ")
      : "",
    cverify: v1Data.cverify || "",
    _original: v1Data,
    _isV1: true,
  };
};

// LaunchPad to Standard Format Mapping
const mapLaunchPadToStandard = (lpData) => {
  const user = lpData.user || {};
  const product = lpData.product || {};
  const productId = lpData.product_id ? String(lpData.product_id) : "";

  return {
    // ✅ Use numeric `id` as transaction_id (present on LaunchPad refunds)
    transaction_id: lpData.id
      ? String(lpData.id)
      : lpData.transaction_id || "",
    // ✅ Normalise action to uppercase so "refund" / "REFUND" both match
    transaction_type:
      (lpData.action && String(lpData.action).toUpperCase()) ||
      (lpData.status && String(lpData.status).toUpperCase()) ||
      "SALE",
    total: lpData.total_amount
      ? lpData.total_amount.toString()
      : lpData.amount
        ? lpData.amount.toString()
        : "0.00",
    date: lpData.created_at || new Date().toISOString(),
    product_id: productId,
    product_name: product.name || "",
    customer_email: user.email || "",
    customer_first_name: user.name ? user.name.split(" ")[0] : "",
    customer_last_name: user.name
      ? user.name.split(" ").slice(1).join(" ")
      : "",
    customer_id: user.id || null,
    affiliate_id: lpData.affiliate_user || null,
    status: lpData.status || "",
    refund_status: lpData.refund_status || "",
    _original: lpData,
    _isLaunchPad: true,
  };
};

// ============================================================
// 🎯 GET PLAN BY PRODUCT ID - DATABASE ONLY
// ============================================================

const getPlanByProductId = async (productId, platform) => {
  try {
    if (!productId) {
      console.log("⚠️ No product ID provided, using default plan");
      const defaultPlan = await Plan.findOne({ status: "active" }).sort({
        planId: 1,
      });
      return {
        plan: defaultPlan,
        planName: defaultPlan?.name || "Free",
        planId: defaultPlan?.planId || 1,
        productId: productId,
        validityDays: defaultPlan?.validity_days || 365,
      };
    }

    const productIdStr = String(productId).trim();
    console.log(
      `🔍 Looking up product ID: "${productIdStr}" (Platform: ${platform})`,
    );

    let plan = null;

    if (platform === "jvzoo") {
      plan = await Plan.findOne({ jvzoo_id: productIdStr, status: "active" });
    } else if (platform === "launchpad") {
      plan = await Plan.findOne({
        $or: [
          { launchpad_id: productIdStr },
          { launchpad_id: parseInt(productIdStr) },
        ],
        status: "active",
      });
    }

    if (plan) {
      console.log(
        `✅ Found in database: ${plan.name} (planId: ${plan.planId})`,
      );
      return {
        plan: plan,
        planName: plan.name,
        planId: plan.planId,
        validityDays: plan.validity_days || 365,
        productId: productIdStr,
      };
    }

    console.log(`⚠️ No plan found for "${productIdStr}", using default plan`);
    const defaultPlan = await Plan.findOne({ status: "active" }).sort({
      planId: 1,
    });

    if (!defaultPlan) {
      console.error("❌ No default plan found in database!");
      const newDefaultPlan = new Plan({
        name: "Free",
        slug: "free",
        planId: 1,
        validity_days: 365,
        status: "active",
      });
      await newDefaultPlan.save();
      console.log("✅ Created default Free plan");

      return {
        plan: newDefaultPlan,
        planName: "Free",
        planId: 1,
        validityDays: 365,
        productId: productIdStr,
      };
    }

    return {
      plan: defaultPlan,
      planName: defaultPlan?.name || "Free",
      planId: defaultPlan?.planId || 1,
      validityDays: defaultPlan?.validity_days || 365,
      productId: productIdStr,
    };
  } catch (error) {
    console.error("❌ Error finding plan:", error);
    try {
      let defaultPlan = await Plan.findOne({ status: "active" }).sort({
        planId: 1,
      });
      if (!defaultPlan) {
        defaultPlan = new Plan({
          name: "Free",
          slug: "free",
          planId: 1,
          validity_days: 365,
          status: "active",
        });
        await defaultPlan.save();
      }
      return {
        plan: defaultPlan,
        planName: defaultPlan?.name || "Free",
        planId: defaultPlan?.planId || 1,
        validityDays: defaultPlan?.validity_days || 365,
        productId: productId,
      };
    } catch (err) {
      console.error("❌ Failed to get/create default plan:", err);
      return {
        plan: null,
        planName: "Free",
        planId: 1,
        validityDays: 365,
        productId: productId,
      };
    }
  }
};

// ============================================================
// 🗑️ REMOVE A SPECIFIC PLAN FROM A USER (used on refund)
// ============================================================
const removePlanFromUser = async (user, refundedPlanId) => {
  let plans = Array.isArray(user.planId) ? [...user.planId] : [user.planId || 1];

  // Remove the refunded plan
  plans = plans.filter((id) => id !== refundedPlanId);

  // No plans left → user refunded everything → deactivate
  if (plans.length === 0) {
    user.planId = [];
    user.planName = "None";
    user.isActive = false;
    console.log(
      `🚫 User ${user.email} has no plans left → account DEACTIVATED`,
    );
    return { deactivated: true, remainingPlans: [] };
  }

  // Otherwise keep remaining plans
  user.planId = plans;
  user.isActive = true;

  // Set planName to the highest remaining plan's name
  try {
    const highestPlan = await Plan.findOne({
      planId: { $in: plans },
    }).sort({ planId: -1 });
    user.planName = highestPlan?.name || "Free";
  } catch (err) {
    user.planName = "Free";
  }

  console.log(
    `✅ Removed plan ${refundedPlanId}. Remaining plans: [${plans.join(", ")}]`,
  );
  return { deactivated: false, remainingPlans: plans };
};

// ============================================================
// 📩 UNIFIED IPN ENDPOINT
// ============================================================

router.post("/ipn", async (req, res) => {
  console.log("📩 Payment IPN received");
  console.log("📋 Content-Type:", req.headers["content-type"]);

  try {
    let rawData = req.body;

    if (typeof rawData === "string") {
      try {
        rawData = JSON.parse(rawData);
      } catch (e) {}
    }

    // ============================================================
    // 🔍 GET PLATFORM FROM ENVIRONMENT
    // ============================================================

    const platform = getPlatform();
    console.log(`📌 Processing as ${platform.toUpperCase()}`);

    let data;

    // ============================================================
    // 📋 PARSE DATA BASED ON PLATFORM
    // ============================================================

    if (platform === "jvzoo") {
      const isV2 =
        rawData.paykey !== undefined ||
        rawData.customer_email !== undefined ||
        rawData.product_id !== undefined;

      const isV1 =
        rawData.cproditem !== undefined || rawData.ctransaction !== undefined;

      if (isV2) {
        data = rawData;
        console.log("✅ JVZoo V2 format");
      } else if (isV1) {
        data = mapV1ToV2(rawData);
        console.log("✅ JVZoo V1 format - mapped to V2");
      } else {
        console.log("⚠️ Unknown JVZoo format, treating as V2");
        data = rawData;
      }
    } else if (platform === "launchpad") {
      data = mapLaunchPadToStandard(rawData);
      console.log("✅ LaunchPad format");
      console.log(
        `   Product ID: ${data.product_id} (Type: ${typeof rawData.product_id})`,
      );
      console.log(`   User: ${data.customer_email}`);
      console.log(`   Amount: $${data.total}`);
      console.log(`   Action: ${data.transaction_type}`);
    } else {
      console.log(`❌ Unknown platform: ${platform}`);
      return res.status(400).json({
        success: false,
        message: `Unknown platform: ${platform}`,
      });
    }

    console.log(`📋 Processing as ${platform.toUpperCase()}`);
    console.log(`   Transaction ID: ${data.transaction_id}`);
    console.log(`   Product ID: ${data.product_id}`);
    console.log(`   Product Name: ${data.product_name}`);
    console.log(`   Transaction Type: ${data.transaction_type}`);
    console.log(`   Customer Email: ${data.customer_email}`);
    console.log(`   Total: $${data.total}`);

    // ============================================================
    // 🔐 SIGNATURE VERIFICATION
    // ============================================================

    let isVerified = false;

    if (IS_DEVELOPMENT) {
      console.log(`⚠️ ${"=".repeat(50)}`);
      console.log(`⚠️ DEVELOPMENT MODE: Signature verification SKIPPED!`);
      console.log(`⚠️ Set NODE_ENV=production to enable verification`);
      console.log(`⚠️ ${"=".repeat(50)}`);
      isVerified = true;
    } else {
      console.log(`🔒 PRODUCTION MODE: Verifying signature...`);

      const secretKey = process.env[`${platform.toUpperCase()}_SECRET_KEY`];

      if (!secretKey) {
        console.log(
          `❌ ${platform.toUpperCase()}_SECRET_KEY not set in environment!`,
        );
        return res.status(403).json({
          success: false,
          message: "Secret key not configured",
        });
      }

      if (platform === "jvzoo") {
        const isV2 =
          rawData.paykey !== undefined ||
          rawData.customer_email !== undefined ||
          rawData.product_id !== undefined;

        if (isV2) {
          isVerified = verifyV2Signature(data, secretKey);
        } else {
          isVerified = verifyV1Signature(rawData, secretKey);
        }
      } else if (platform === "launchpad") {
        isVerified = verifyLaunchPadSignature(rawData, secretKey);
      }

      if (!isVerified) {
        console.log("❌ Invalid signature - rejecting");
        return res.status(403).json({
          success: false,
          message: "Invalid signature",
        });
      }
      console.log("✅ Signature verified successfully");
    }

    // ============ EXTRACT KEY FIELDS ============
    const email = data.customer_email?.toLowerCase().trim();
    if (!email) {
      console.log("❌ No customer email provided");
      return res.status(400).json({
        success: false,
        message: "Customer email is required",
      });
    }

    const fullName =
      `${data.customer_first_name || ""} ${data.customer_last_name || ""}`.trim();
    const name = fullName || email.split("@")[0] || "User";
    const transactionId =
      data.transaction_id ||
      data.paykey ||
      `${platform.toUpperCase()}_${Date.now()}`;
    const productId = data.product_id;
    const amount = parseFloat(data.total) || 0;
    const transactionType = data.transaction_type || "SALE";

    console.log("🔍 Processing IPN:");
    console.log(`   📦 Product ID: ${productId}`);
    console.log(`   👤 Customer: ${email}`);
    console.log(`   💰 Amount: $${amount.toFixed(2)}`);
    console.log(`   📊 Type: ${transactionType}`);
    console.log(`   🏷️ Platform: ${platform}`);

    // ============================================================
    // 🔄 HANDLE REFUND / CHARGEBACK
    // Removes ONLY the refunded plan. Deactivates account only
    // if the user has NO plans left (i.e. refunded everything,
    // including plan 1).
    // ============================================================
    const isRefund =
      transactionType === "RFND" ||
      transactionType === "REFUND" ||
      transactionType === "refund" ||
      // LaunchPad-specific: action=REFUND OR status=refunded
      (platform === "launchpad" &&
        (String(rawData.action).toUpperCase() === "REFUND" ||
          String(rawData.status).toLowerCase() === "refunded" ||
          rawData.refund_status === "refunded"));

    if (isRefund) {
      console.log(`🔄 Processing REFUND for transaction: ${transactionId}`);
      console.log(`   📦 Refunded product ID: ${productId}`);

      const user = await User.findOne({ email: email });
      if (!user) {
        console.log("❌ User not found for refund:", email);
        return res.status(200).send("OK");
      }

      // 1) Find which plan was refunded (by product ID)
      const planInfo = await getPlanByProductId(productId, platform);
      const refundedPlanId = planInfo?.planId;

      if (!refundedPlanId) {
        console.log(
          "⚠️ Could not resolve refunded product to a plan ID — skipping plan removal",
        );
        return res.status(200).json({
          success: true,
          message: "Refund received but plan could not be resolved",
        });
      }

      console.log(
        `🎯 Refunded plan resolved to planId=${refundedPlanId} (${planInfo.planName})`,
      );

      // 2) Mark matching payment record as refunded
      const payment = await Payment.findOne({
        transactionId: transactionId,
        userId: user._id,
      });

      if (payment) {
        payment.status = "refunded";
        payment.refundDate = new Date();
        payment.ipnData = data;
        await payment.save();
        console.log(`✅ Payment ${transactionId} marked as refunded`);
      } else {
        // Fallback: match by user + purchased plan
        const paymentByPlan = await Payment.findOne({
          userId: user._id,
          purchasedPlanId: refundedPlanId,
          status: "completed",
        }).sort({ paymentDate: -1 });

        if (paymentByPlan) {
          paymentByPlan.status = "refunded";
          paymentByPlan.refundDate = new Date();
          paymentByPlan.ipnData = data;
          await paymentByPlan.save();
          console.log(
            `✅ Payment by plan (${refundedPlanId}) marked as refunded`,
          );
        } else {
          console.log("⚠️ No matching payment record found to mark refunded");
        }
      }

      // 3) Remove ONLY that plan from the user
      const { deactivated, remainingPlans } = await removePlanFromUser(
        user,
        refundedPlanId,
      );

      await user.save();
      console.log(`💾 User saved: ${user.email}`);

      // 4) Respond
      if (deactivated) {
        return res.status(200).json({
          success: true,
          message:
            "Refund processed. All plans refunded — account deactivated.",
          accountDeactivated: true,
          remainingPlans: [],
        });
      }

      return res.status(200).json({
        success: true,
        message: `Refund processed. Removed plan ${refundedPlanId}.`,
        accountDeactivated: false,
        remainingPlans,
      });
    }

    // ============================================================
    // 🔄 HANDLE RECURRING BILL
    // ============================================================
    if (transactionType === "BILL" || transactionType === "bill") {
      console.log(`🔄 Processing BILL for: ${email}`);

      const user = await User.findOne({ email: email });
      if (user) {
        const planInfo = await getPlanByProductId(productId, platform);
        if (planInfo && planInfo.plan) {
          if (!user.planId.includes(planInfo.planId)) {
            user.planId.push(planInfo.planId);
          }
          user.planName = planInfo.planName;
        }
        user.lastLogin = new Date();
        await user.save();
        console.log("✅ Subscription extended for user:", user.email);
      }

      return res.status(200).json({
        success: true,
        message: "Subscription extended",
      });
    }

    // ============================================================
    // 🔄 HANDLE CANCELLATION
    // ============================================================
    if (transactionType === "CANCEL" || transactionType === "cancel") {
      console.log(`🔄 Processing CANCELLATION for: ${email}`);

      const user = await User.findOne({ email: email });
      if (user) {
        user.planId = [1];
        user.planName = "Free";
        user.isActive = true;
        await user.save();
        console.log("✅ User subscription cancelled:", user.email);
      }

      return res.status(200).json({
        success: true,
        message: "Subscription cancelled",
      });
    }

    // ============================================================
    // ✅ HANDLE SALE (Main Purchase)
    // ============================================================
    const isSale =
      transactionType === "SALE" ||
      transactionType === "sale" ||
      (platform === "launchpad" && rawData.action === "sale");

    if (!isSale) {
      console.log("⚠️ Transaction not a sale:", transactionType);
      return res.status(200).send("OK");
    }

    // Check if already processed
    const existingPayment = await Payment.findOne({
      transactionId: transactionId,
    });
    if (existingPayment) {
      console.log("⚠️ Transaction already processed:", transactionId);
      return res.status(200).send("OK");
    }

    // ============================================================
    // 🎯 GET PLAN FROM DATABASE
    // ============================================================
    const planInfo = await getPlanByProductId(productId, platform);

    console.log("✅ Product Recognized from Database:");
    console.log(`   🔑 Product ID: ${productId}`);
    console.log(
      `   📦 Plan: ${planInfo.planName} (planId: ${planInfo.planId})`,
    );
    console.log(`   ⏳ Validity: ${planInfo.validityDays || 365} days`);
    console.log(`   🏷️ Platform: ${platform}`);

    // ============================================================
    // 👤 CREATE OR UPDATE USER
    // ============================================================

    let user = await User.findOne({ email: email });
    let isNewUser = false;
    const defaultPassword = email;

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);
      console.log("🔑 Password hashed successfully");

      const initialPlans = [1];
      if (planInfo.planId !== 1) {
        initialPlans.push(planInfo.planId);
      }

      user = new User({
        name: name,
        email: email,
        password: hashedPassword,
        planId: initialPlans,
        planName: planInfo.planName,
        isActive: true,
        role: "user",
        lastLogin: new Date(),
      });

      await user.save();
      isNewUser = true;

      console.log(`✅ New user created: ${user.email}`);
      console.log(`   📋 All Plans: [${user.planId.join(", ")}]`);

      try {
        console.log(`📧 Attempting to send welcome email to: ${user.email}`);
        if (sendWelcomeEmail) {
          const emailResult = await sendWelcomeEmail(user, defaultPassword);
          if (emailResult === true) {
            console.log(`✅ Welcome email sent successfully to: ${user.email}`);
          } else {
            console.log(
              `⚠️ Welcome email may not have been sent to: ${user.email}`,
            );
            console.log(`   Email service returned: ${emailResult}`);
          }
        } else {
          console.log(`⚠️ sendWelcomeEmail function is not available`);
        }
      } catch (emailError) {
        console.error(
          `❌ Failed to send welcome email to ${user.email}:`,
          emailError.message,
        );
      }
    } else {
      const newPlanId = planInfo.planId;

      if (!Array.isArray(user.planId)) {
        user.planId = [user.planId || 1];
      }

      user.planId = [...new Set(user.planId)];

      if (!user.planId.includes(newPlanId)) {
        user.planId.push(newPlanId);
        console.log(
          `📋 Added plan ${newPlanId}. All plans: [${user.planId.join(", ")}]`,
        );
      } else {
        console.log(
          `ℹ️ Plan ${newPlanId} already exists. All plans: [${user.planId.join(", ")}]`,
        );
      }

      user.planName = planInfo.planName;
      user.lastLogin = new Date();
      await user.save();

      console.log(`✅ User updated: ${user.email}`);
      console.log(`   📋 All Plans: [${user.planId.join(", ")}]`);
    }

    // ============================================================
    // 💰 SAVE PAYMENT RECORD
    // ============================================================
    const payment = new Payment({
      transactionId: transactionId,
      userId: user._id,
      buyerEmail: email,
      buyerName: name,
      productId: String(productId || ""),
      productName: data.product_name || planInfo.planName || "Healtrics Plan",
      amount: amount || 0,
      currency: "USD",
      status: "completed",
      paymentDate: new Date(),
      ipnData: data,
      purchasedPlanId: planInfo.planId,
      purchasedPlanName: planInfo.planName,
      validityDays: planInfo.validityDays || 365,
      platform: platform,
    });

    await payment.save();
    console.log("✅ Payment record saved:", transactionId);

    // ============================================================
    // 🎫 GENERATE JWT TOKEN
    // ============================================================
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        planId: user.planId,
        planName: user.planName,
      },
      process.env.JWT_SECRET || "your_jwt_secret_here",
      { expiresIn: "30d" },
    );

    // ============================================================
    // ✅ SUCCESS RESPONSE
    // ============================================================
    res.status(200).json({
      success: true,
      message: "IPN processed successfully",
      platform: platform,
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        planId: user.planId,
        planName: user.planName,
      },
      purchasedProduct: {
        productId: productId,
        planId: planInfo.planId,
        planName: planInfo.planName,
        validityDays: planInfo.validityDays || 365,
      },
      isNewUser: isNewUser,
      defaultPassword: isNewUser ? defaultPassword : undefined,
    });
  } catch (error) {
    console.error("❌ IPN Error:", error);
    console.error("📋 Stack:", error.stack);
    res.status(200).json({
      success: false,
      message: "Error processing IPN: " + error.message,
    });
  }
});

// ============================================================
// 📊 GET PRODUCT LINKS (For Frontend)
// ============================================================

router.get("/product-links", async (req, res) => {
  try {
    const plans = await Plan.find({ status: "active" }).sort({ planId: 1 });
    const platform = getPlatform();

    const products = plans.map((plan) => ({
      id: plan._id,
      planId: plan.planId,
      name: plan.name,
      slug: plan.slug,
      jvzooId: plan.jvzoo_id,
      launchpadId: plan.launchpad_id,
      validityDays: plan.validity_days || 365,
      order: plan.order,
      purchaseLink:
        platform === "jvzoo"
          ? plan.jvzoo_id
            ? `https://www.jvzoo.com/b/0/${plan.jvzoo_id}`
            : null
          : plan.launchpad_id
            ? `https://launchpad.net/checkout/${plan.launchpad_id}`
            : null,
      platform: platform,
    }));

    res.json({
      success: true,
      platform: platform,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================================
// 🔍 VERIFY PAYMENT STATUS - UPDATED
// ============================================================

router.get("/verify-payment/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({
        success: false,
        hasAccess: false,
        message: "User not found",
      });
    }

    const userPlans = user.planId || [1];
    const hasAccess = userPlans.some((id) => id > 1) && user.isActive === true;

    res.json({
      success: true,
      hasAccess,
      user: {
        name: user.name,
        email: user.email,
        planName: user.planName,
        planId: user.planId,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
