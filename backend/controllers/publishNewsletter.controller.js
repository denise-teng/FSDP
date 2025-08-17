import Newsletter from '../models/newsletter.model.js';
import Subscriber from '../models/subscribe.model.js';
import sgMail from '@sendgrid/mail';
import path from 'path';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Helper function to generate file URLs
const generateFileUrl = (filePath) => {
  if (!filePath) return null;
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
};

// Helper to get file extension
const getFileExtension = (filePath) => {
  if (!filePath) return 'PDF';
  const ext = path.extname(filePath).toUpperCase().replace('.', '');
  return ext || 'PDF';
};

export const sendNewsletterToSubscribers = async (req, res) => {
  try {
    console.log('Starting newsletter send process...');
   
    // 1. Validate newsletter exists and is published
    const newsletter = await Newsletter.findById(req.params.id);
    if (!newsletter || newsletter.status !== 'published') {
      console.error('Newsletter not found or not published');
      return res.status(404).json({
        success: false,
        message: 'Newsletter not found or not published'
      });
    }

    // 2. Get active subscribers
    const subscribers = await Subscriber.find({ isActive: true });
    if (subscribers.length === 0) {
      console.warn('No active subscribers found');
      return res.status(400).json({
        success: false,
        message: 'No active subscribers found'
      });
    }

    // 3. Generate file URLs and metadata
    const fileUrl = generateFileUrl(newsletter.newsletterFilePath);
    const thumbnailUrl = generateFileUrl(newsletter.thumbnailPath);
    const fileExtension = getFileExtension(newsletter.newsletterFilePath);
    const currentYear = new Date().getFullYear();
    const headerImage = 'https://yourdomain.com/path/to/logo.png'; // Replace with your actual logo URL

    // 4. Prepare template data
    const baseTemplateData = {
      title: newsletter.title,
      category: newsletter.category,
      content: Array.isArray(newsletter.content) ?
              newsletter.content.join('<br><br>') :
              newsletter.content,
      tags: Array.isArray(newsletter.tags) ? newsletter.tags :
            typeof newsletter.tags === 'string' ?
            newsletter.tags.split(',').map(tag => tag.trim()) :
            [],
      thumbnailUrl: thumbnailUrl,
      fileUrl: fileUrl,
      fileExtension: fileExtension,
      currentYear: currentYear,
      headerImage: headerImage,
      unsubscribeLink: `${process.env.BASE_URL}/unsubscribe?email={{email}}` // SendGrid will replace {{email}}
    };

    // 5. Send emails in batches using template
    const BATCH_SIZE = 50;
    let successfulSends = 0;
    const templateId = 'd-24f783e679cd435a88d5888d94555fc0';
   
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
     
      try {
        const messages = batch.map(subscriber => ({
          to: subscriber.email,
          from: {
            email: 'densie.t2910@gmail.com',
            name: 'Yip Cheu Fong Financial Advisory'
          },
          templateId: templateId,
          dynamicTemplateData: {
            ...baseTemplateData,
            firstName: subscriber.firstName || 'Subscriber',
            email: subscriber.email // Required for unsubscribe link
          },
          trackingSettings: {
            clickTracking: { enable: true },
            openTracking: { enable: true }
          }
        }));

        await sgMail.send(messages);
        successfulSends += batch.length;
        console.log(`Sent batch ${i} to ${i + BATCH_SIZE}`);
      } catch (batchError) {
        console.error(`Failed batch ${i}:`, batchError.response?.body?.errors);
        // Track failed sends if needed
      }
     
      // Add delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 6. Update newsletter status
    newsletter.sentAt = new Date();
    newsletter.sentCount = successfulSends;
    await newsletter.save();

    console.log('Newsletter sent successfully');
    res.json({
      success: true,
      sent: successfulSends,
      total: subscribers.length
    });

  } catch (error) {
    console.error('Send error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send newsletter',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
