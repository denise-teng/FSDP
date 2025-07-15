import dotenv from 'dotenv';
dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing from your .env file.");
}

import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);