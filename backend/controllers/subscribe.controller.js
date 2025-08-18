import sgMail from '@sendgrid/mail';
import Subscriber from '../models/subscribe.model.js';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const subscribe = async (req, res) => {
  const { email, firstName, lastName, source } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      code: 'MISSING_EMAIL',
      message: 'Email address is required'
    });
  }

  try {
    const existing = await Subscriber.findOne({ email }).lean();
    if (existing) {
      return res.status(200).json({
        success: true,
        code: 'ALREADY_SUBSCRIBED',
        message: 'You are already subscribed',
        data: existing
      });
    }

    const subscriber = await Subscriber.create({
      email: email.toLowerCase().trim(),
      firstName,
      lastName,
      source: source || 'website',
      isActive: true
    });

    try {
      const msg = {
        to: email,
        from: {
          email: 'densie.t2910@gmail.com',
          name: 'Yip Cheu Fong'
        },
        templateId: 'd-de474d9c07a347569e076cec7efe85fa',
        dynamicTemplateData: {
          firstName: firstName || 'there',
          unsubscribeUrl: `${process.env.BASE_URL}/unsubscribe?email=${encodeURIComponent(email)}`
        }
      };
      await sgMail.send(msg);
    } catch (emailError) {
      console.error('Email send failed:', {
        message: emailError.message,
        code: emailError.code,
        responseErrors: emailError.response?.body?.errors
      });
    }

    return res.status(201).json({
      success: true,
      code: 'SUBSCRIBED',
      message: 'Subscription successful',
      data: subscriber
    });

  } catch (error) {
    console.error('Subscription error:', error);
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        code: 'ALREADY_SUBSCRIBED',
        message: 'You were already subscribed'
      });
    }
    return res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'Subscription failed'
    });
  }
};

export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find()
      .sort({ subscribedAt: -1 })
      .select('email firstName lastName source isActive subscribedAt') // IMPORTANT
      .lean();

    res.status(200).json({
      success: true,
      data: subscribers,
      count: subscribers.length
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers'
    });
  }
};

export const removeSubscriber = async (req, res) => {
  try {
    const { email } = req.params;
    const subscriber = await Subscriber.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' });
    }
    const result = await Subscriber.deleteOne({ email });
    if (result.deletedCount === 1) {
      return res.status(200).json({ success: true, message: 'Subscriber removed successfully' });
    }
    return res.status(400).json({ success: false, message: 'Failed to remove subscriber' });
  } catch (error) {
    console.error('Error removing subscriber:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
