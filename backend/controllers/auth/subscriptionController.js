// backend/controllers/subscriptionController.js
const User = require("../../models/auth/User");
const Plan = require("../../models/auth/Plan");
const Payment = require("../../models/auth/Payment");

// ============================================================
// GET USER SUBSCRIPTION DETAILS
// ============================================================

// backend/src/controllers/subscriptionController.js

exports.getSubscriptionDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userPlans = user.planId || [1];
    const planDetails = [];

    for (const planId of userPlans) {
      const plan = await Plan.findOne({ planId: planId });
      if (plan) {
        // ✅ Get the payment record for this plan
        const payment = await Payment.findOne({
          userId: userId,
          purchasedPlanId: planId,
        }).sort({ paymentDate: -1 });

        // ✅ Use actual payment date or fallback to user creation date
        const purchaseDate =
          payment?.paymentDate || user.createdAt || new Date();

        // ✅ Calculate expiry date
        const validityDays = plan.validity_days || 365;
        const expiryDate = new Date(
          new Date(purchaseDate).getTime() + validityDays * 24 * 60 * 60 * 1000,
        );

        planDetails.push({
          planId: plan.planId,
          name: plan.name,
          slug: plan.slug,
          validityDays: validityDays,
          status: "active",
          purchaseDate: purchaseDate, // ✅ Actual purchase date
          expiryDate: expiryDate, // ✅ Calculated expiry date
          transactionId: payment?.transactionId || null,
          source: payment?.platform || "Manual",
        });
      }
    }

    // Get the highest plan (current active plan)
    const highestPlanId = Math.max(...userPlans);
    const currentPlan = await Plan.findOne({ planId: highestPlanId });

    // Get payment history
    const payments = await Payment.find({ userId: userId })
      .sort({ paymentDate: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          planId: user.planId,
          planName: user.planName,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        currentPlan: currentPlan
          ? {
              planId: currentPlan.planId,
              name: currentPlan.name,
              slug: currentPlan.slug,
              validityDays: currentPlan.validity_days || 365,
              features: currentPlan.features || [],
            }
          : null,
        allPlans: planDetails,
        payments: payments.map((p) => ({
          id: p._id,
          transactionId: p.transactionId,
          productName: p.productName,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          paymentDate: p.paymentDate,
          platform: p.platform,
          purchasedPlanName: p.purchasedPlanName,
        })),
        totalPurchased: planDetails.length,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("❌ Get subscription error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET PLAN FEATURES
// ============================================================

exports.getPlanFeatures = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await Plan.findOne({ planId: parseInt(planId) });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    res.json({
      success: true,
      data: {
        planId: plan.planId,
        name: plan.name,
        slug: plan.slug,
        features: plan.features || [],
        validityDays: plan.validity_days || 365,
        status: plan.status,
      },
    });
  } catch (error) {
    console.error("❌ Get plan features error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
