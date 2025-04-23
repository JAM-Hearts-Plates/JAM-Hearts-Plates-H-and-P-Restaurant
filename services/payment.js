import Stripe from "stripe";
import { logger } from "../utils/logger.js";

// Initialize Stripe client
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Process payment using Stripe
 * @param {number} amount - Payment amount in dollars
 * @param {object} paymentDetails - Payment method details from client
 * @returns {Promise<object>} Payment result with transaction ID and status
 */
export const processPayment = async (amount, paymentDetails) => {
  try {
    logger.info(
      `Processing payment of $${amount} with method ID: ${paymentDetails.paymentMethodId}`
    );

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    // Support for different payment methods
    const paymentMethod = paymentDetails.paymentMethodId;

    // create payment options
    const paymentOptions = {
      amount: amountInCents,
      currency: "usd",
      description: "Restaurant order payment",
      metadata: paymentDetails.metadata || {},
    };

    // Handle direct payment method ID scenario
    if (paymentMethod) {
      paymentOptions.payment_method = paymentMethod;
      paymentOptions.confirm = true;
      paymentOptions.return_url = process.env.PAYMENT_RETURN_URL;

      // Add customer if provided
      if (paymentDetails.customerId) {
        paymentOptions.customer = paymentDetails.customerId;
      }

      const paymentIntent = await stripeClient.paymentIntents.create(
        paymentOptions
      );

      logger.info(
        `Payment processed successfully. Status: ${paymentIntent.status}`
      );

      return {
        success:
          paymentIntent.status === "succeeded" ||
          paymentIntent.status === "requires_capture",
        transactionId: paymentIntent.id,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
      };
    }

    // Handle payment intent creation for client-side confirmation
    else {
      paymentOptions.automatic_payment_methods = {
        enabled: true,
      };

      const paymentIntent = await stripeClient.paymentIntents.create(
        paymentOptions
      );

      logger.info(`Payment intent created. Client should confirm with secret.`);

      return {
        success: true,
        transactionId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: "requires_confirmation",
      };
    }
  } catch (error) {
    logger.error("Payment processing error:", {
      error: error.message,
      stack: error.stack,
    });

    let errorMessage = "Payment processing failed";

    if (error.type === "StripeCardError") {
      errorMessage = `Card error: ${error.message}`;
    } else if (error.type === "StripeInvalidRequestError") {
      errorMessage = `Invalid request: ${error.message}`;
    }

    return {
      success: false,
      message: errorMessage,
      code: error.code || "unknown_error",
    };
  }
};

/**
 * Create a customer in Stripe
 * @param {object} customerData - Customer information
 * @returns {Promise<object>} Customer creation result
 */

export const createCustomer = async (customerData) => {
  try {
    const customer = await stripeClient.customers.create({
      email: customerData.email,
      name: customerData.name,
      phone: customerData.phone,
      metadata: {
        userId: customerData.userId,
      },
    });

    return {
      success: true,
      customerId: customer.id,
    };
  } catch (error) {
    logger.error("Customer creation error:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Refund a payment
 * @param {string} transactionId - Stripe payment intent ID
 * @param {number} amount - Optional amount to refund (defaults to full amount)
 * @param {string} reason - Reason for refund
 * @returns {Promise<object>} Refund result
 */
export const refundPayment = async (
  transactionId,
  amount = null,
  reason = "requested_by_customer"
) => {
  try {
    logger.info(`Processing refund for transaction ${transactionId}`);

    const refundParams = {
      payment_intent: transactionId,
      reason: reason,
    };

    // If amount is specified, add to params
    if (amount) {
      refundParams.amount = Math.round(amount * 100);
      logger.info(`Partial refund of $${amount} requested`);
    } else {
      logger.info(`Full refund requested`);
    }

    const refund = await stripeClient.refunds.create(refundParams);

    logger.info(`Refund processed. Status: ${refund.status}, ID: ${refund.id}`);

    return {
      success: refund.status === "succeeded" || refund.status === "pending",
      refundId: refund.id,
      status: refund.status,
    };
  } catch (error) {
    logger.error("Refund processing error:", {
      error: error.message,
      stack: error.stack,
    });
    return {
      success: false,
      message: error.message || "Refund processing failed",
    };
  }
};

/**
 * Verify payment status
 * @param {string} transactionId - Payment transaction ID
 * @returns {Promise<object>} Payment status details
 */
export const verifyPaymentStatus = async (transactionId) => {
  try {
    logger.info(`Verifying payment status for transaction ${transactionId}`);

    const paymentIntent = await stripeClient.paymentIntents.retrieve(
      transactionId
    );

    logger.info(`Payment verification result: ${paymentIntent.status}`);

    return {
      success: true,
      status: paymentIntent.status,
      paid: paymentIntent.status === "succeeded",
      amount: paymentIntent.amount / 100, // Convert cents back to dollars
      paymentMethod: paymentIntent.payment_method_types[0],
      createdAt: new Date(paymentIntent.created * 1000),
    };
  } catch (error) {
    logger.error("Payment verification error:", { error: error.message });
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Create a payment intent without confirming (for client-side confirmation)
 * @param {number} amount - Payment amount
 * @param {object} metadata - Optional metadata for the payment intent
 * @returns {Promise<object>} Payment intent client secret
 */
export const createPaymentIntent = async (amount, metadata = {}) => {
  try {
    logger.info(`Creating payment intent for $${amount}`);

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      metadata: metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    logger.info(`Payment intent created with ID: ${paymentIntent.id}`);

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    logger.error("Create payment intent error:", { error: error.message });
    return {
      success: false,
      message: error.message,
    };
  }
};

/**
 * Handle Stripe webhook events
 * @param {string} payload - Raw request body
 * @param {string} signature - Stripe signature from request headers
 * @returns {object} Processed webhook event
 */
export const handleWebhook = async (payload, signature) => {
  try {
    logger.info("Processing Stripe webhook");

    const event = stripeClient.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    logger.info(`Webhook event type: ${event.type}`);

    // Process different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        logger.info(`Payment succeeded: ${event.data.object.id}`);
        // Handle successful payment
        return {
          success: true,
          type: "payment_success",
          paymentIntent: event.data.object,
        };

      case "payment_intent.payment_failed":
        logger.info(`Payment failed: ${event.data.object.id}`);

        // Handle failed payment
        return {
          success: true,
          type: "payment_failed",
          paymentIntent: event.data.object,
          failureMessage: event.data.object.last_payment_error?.message,
        };

      case "charge.refunded":
        logger.info(`Payment refunded: ${event.data.object.payment_intent}`);
        return {
          success: true,
          type: "payment_refunded",
          charge: event.data.object,
        };

      default:
        logger.info(`Other webhook event: ${event.type}`);
        return {
          success: true,
          type: "other",
          eventType: event.type,
        };
    }
  } catch (error) {
    logger.error("Webhook handling error:", { error: error.message });
    return {
      success: false,
      message: error.message,
    };
  }
};
