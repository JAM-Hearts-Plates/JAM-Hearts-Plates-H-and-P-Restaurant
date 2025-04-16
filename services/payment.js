import Stripe from "stripe";
import { logger } from '../utils/logger.js';

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
    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);
    
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      payment_method: paymentDetails.paymentMethodId,
      confirm: true,
      description: "Restaurant order payment",
      return_url: process.env.PAYMENT_RETURN_URL,
    });

    return {
      success: paymentIntent.status === 'succeeded',
      transactionId: paymentIntent.id,
      status: paymentIntent.status
    };
  } catch (error) {
    logger.error('Payment processing error:', error);
    return {
      success: false,
      message: error.message || 'Payment processing failed'
    };
  }
};

/**
 * Refund a payment
 * @param {string} transactionId - Stripe payment intent ID
 * @param {number} amount - Optional amount to refund (defaults to full amount)
 * @returns {Promise<object>} Refund result
 */
export const refundPayment = async (transactionId, amount = null) => {
  try {
    const refundParams = {
      payment_intent: transactionId
    };

    // If amount is specified, add to params
    if (amount) {
      refundParams.amount = Math.round(amount * 100);
    }

    const refund = await stripeClient.refunds.create(refundParams);
    
    return {
      success: refund.status === 'succeeded',
      refundId: refund.id
    };
  } catch (error) {
    logger.error('Refund processing error:', error);
    return {
      success: false,
      message: error.message || 'Refund processing failed'
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
    const paymentIntent = await stripeClient.paymentIntents.retrieve(transactionId);
    
    return {
      success: true,
      status: paymentIntent.status,
      paid: paymentIntent.status === 'succeeded'
    };
  } catch (error) {
    logger.error('Payment verification error:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Create a payment intent without confirming (for client-side confirmation)
 * @param {number} amount - Payment amount
 * @param {string} orderId - Optional order ID for metadata
 * @returns {Promise<object>} Payment intent client secret
 */
export const createPaymentIntent = async (amount, orderId = null) => {
  try {
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: orderId ? { orderId } : {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret
    };
  } catch (error) {
    logger.error('Create payment intent error:', error);
    return {
      success: false,
      message: error.message
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
    const event = stripeClient.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // Process different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        return {
          success: true,
          type: 'payment_success',
          paymentIntent: event.data.object
        };
        
      case 'payment_intent.payment_failed':
        // Handle failed payment
        return {
          success: true,
          type: 'payment_failed',
          paymentIntent: event.data.object
        };
        
      default:
        return {
          success: true,
          type: 'other',
          event: event
        };
    }
  } catch (error) {
    logger.error('Webhook handling error:', error);
    return {
      success: false,
      message: error.message
    };
  }
};


// const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// // Process payment
// export const processPayment = async (amount, paymentDetails) => {
//   try {
//     const paymentIntent = await stripeClient.paymentIntents.create({
//       amount: amount * 100, // Convert to cents
//       currency: "usd",
//       payment_method: paymentDetails.paymentMethodId,
//       confirm: true,
//       description: "Restaurant order payment",
//       return_url: process.env.PAYMENT_RETURN_URL,
//     });

//     return {
//       success: true,
//       transactionId: paymentIntent.id,
//     };
//   } catch (err) {
//     return {
//       success: false,
//       message: err.message,
//     };
//   }
// };

// // Refund payment
// export const refundPayment = async (transactionId) => {
//   try {
//     const refund = await stripeClient.refunds.create({
//       payment_intent: transactionId,
//     });

//     return {
//       success: true,
//       refundId: refund.id,
//     };
//   } catch (err) {
//     return {
//       success: false,
//       message: err.message,
//     };
//   }
// };
