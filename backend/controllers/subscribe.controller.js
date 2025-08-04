import sgMail from '@sendgrid/mail';
import Subscriber from '../models/subscribe.model.js';

sgMail.setApiKey(process.env.SENDGRID_API_KEY_2);

export const subscribe = async (req, res) => {
  const { email, firstName, lastName, source } = req.body;

  // 1. Validate input
  if (!email) {
    return res.status(400).json({
      success: false,
      code: 'MISSING_EMAIL',
      message: 'Email address is required'
    });
  }

  // 2. Check existing subscriber
  try {
    const existing = await Subscriber.findOne({ email }).lean();
    
    if (existing) {
      return res.status(200).json({ // 200 OK since this isn't really an error
        success: true,
        code: 'ALREADY_SUBSCRIBED',
        message: 'You are already subscribed',
        data: {
          email: existing.email,
          isActive: existing.isActive,
          subscribedAt: existing.subscribedAt
        }
      });
    }

    // 3. Create new subscriber
    const subscriber = await Subscriber.create({
      email: email.toLowerCase().trim(),
      firstName,
      lastName,
      source: source || 'website',
      isActive: true
    });

    // 4. Send welcome email
    try {
      await sgMail.send({
        to: email,
        from: {
          email: process.env.SENDGRID_TRANSACTIONAL_FROM,
          name: 'Your Brand Name'
        },
        subject: 'Welcome to our newsletter!',
        html: `
          <h1>Welcome ${firstName || 'Subscriber'}!</h1>
          <p>Thank you for subscribing to our newsletter.</p>
          <p><small>
            <a href="${process.env.BASE_URL}/unsubscribe?email=${encodeURIComponent(email)}">
              Unsubscribe
            </a>
          </small></p>
        `,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        }
      });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      // Continue even if email fails - we'll retry later
    }

    // 5. Return success
    return res.status(201).json({
      success: true,
      code: 'SUBSCRIBED',
      message: 'Subscription successful',
      data: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt
      }
    });

  } catch (error) {
    console.error('Subscription error:', error);
    
    // Handle duplicate email (race condition)
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
      message: 'Subscription failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};