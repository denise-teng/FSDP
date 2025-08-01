import sgMail from '@sendgrid/mail';
import Subscriber from '../models/subscribe.model.js';

sgMail.setApiKey(process.env.SENDGRID_API_KEY_2);

export const subscribe = async (req, res) => {
  try {
    const { email, firstName, lastName, source } = req.body;

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@(?!example\.com|test\.com|mailinator\.com)[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address from a non-test domain',
        code: 'INVALID_EMAIL'
      });
    }

    // Check if subscriber already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(409).json({  // Changed back to 409 Conflict status
        success: false,
        message: 'This email address is already subscribed to our newsletter',
        code: 'ALREADY_SUBSCRIBED',
        details: {
          email: existingSubscriber.email,
          subscribedSince: existingSubscriber.subscribedAt,
          suggestion: 'If you want to update your preferences, please contact us'
        }
      });
    }

    // Create and save new subscriber
    const newSubscriber = await Subscriber.create({
      email,
      firstName,
      lastName,
      source: source || 'website'
    });

    // Send welcome email
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_TRANSACTIONAL_FROM.trim(),
        name: 'Yip Cheu Fong - Financial Freedom'
      },
      templateId: 'd-f20170e597324e86ab504d7a77e0bb98',
      dynamicTemplateData: {
        subject: 'Welcome to Our Financial Newsletter!',
        preheader: 'Get ready for valuable financial insights',
        firstName: firstName || 'Subscriber',
        signupDate: new Date().toLocaleDateString('en-SG', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        unsubscribeLink: `${process.env.BASE_URL}/unsubscribe?email=${encodeURIComponent(email)}`
      },
      mail_settings: {
        sandbox_mode: {
          enable: process.env.NODE_ENV === 'test'
        }
      },
      headers: {
        'X-SMTPAPI': JSON.stringify({
          unique_args: {
            campaign: 'newsletter_signup',
            source: 'website_form'
          }
        })
      }
    };

    await sgMail.send(msg);

    return res.status(201).json({
      success: true,
      message: 'Subscription successful! Please check your email for confirmation.',
      code: 'SUBSCRIBED',
      data: {
        email,
        firstName,
        subscribedAt: newSubscriber.subscribedAt
      }
    });

  } catch (error) {
    console.error('Subscription Error:', error);

    // Handle MongoDB duplicate key error (fallback in case findOne check fails)
    if (error.code === 11000) {
      const existing = await Subscriber.findOne({ email: req.body.email });
      return res.status(409).json({
        success: false,
        message: 'This email address is already subscribed',
        code: 'DUPLICATE_SUBSCRIPTION',
        details: {
          email: existing?.email,
          subscribedSince: existing?.subscribedAt,
          suggestion: existing?.isActive 
            ? 'You are already receiving our newsletters' 
            : 'Contact us to reactivate your subscription'
        }
      });
    }

    // Handle SendGrid errors
    if (error.response?.body?.errors) {
      return res.status(500).json({
        success: false,
        message: 'Subscription recorded, but we couldn\'t send the welcome email',
        code: 'EMAIL_FAILED',
        systemError: process.env.NODE_ENV === 'development' ? {
          service: 'SendGrid',
          error: error.response.body.errors[0].message
        } : undefined,
        action: 'Please check your spam folder or contact support'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'We encountered an error processing your subscription',
      code: 'SUBSCRIPTION_ERROR',
      systemError: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined,
      action: 'Please try again later or contact support'
    });
  }
};


