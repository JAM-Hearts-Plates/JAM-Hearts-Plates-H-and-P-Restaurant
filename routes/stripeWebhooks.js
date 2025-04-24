import express from "express"
import {Router} from 'express';
import { handleWebhook } from '../services/payment.js';
import {logger} from "../utils/logger.js"

const stripeRouter = Router();

stripeRouter.post('/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    const result = await handleWebhook(req.body, signature);
    
    if (result.success) {
      res.status(200).json({received: true});
    } else {
      res.status(400).json({
        success: false,
        error: result.message 
      });
    }
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook handling failed' });
  }
});

export default stripeRouter;