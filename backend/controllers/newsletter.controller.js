import Newsletter from '../models/newsletter.model.js';
import Subscriber from '../models/subscribe.model.js';
import sgMail from '@sendgrid/mail';
import path from 'path';

sgMail.setApiKey(process.env.SENDGRID_API_KEY_2);

// Helper function to convert various formats to arrays
function convertToArray(data) {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return data.split(',').map(item => item.trim()).filter(item => item);
    }
  }
  return [data].filter(item => item !== undefined && item !== null);
}

// Normalize file paths
const normalizePath = (file) => {
  if (!file) return undefined;
  return `uploads/${file.filename}`;
};

// Generate public URL for files
const generateFileUrl = (filePath) => {
  if (!filePath) return null;
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
};

// Get file extension
const getFileExtension = (filePath) => {
  if (!filePath) return 'PDF';
  const ext = path.extname(filePath).toUpperCase().replace('.', '');
  return ext || 'PDF';
};

export const createOrUpdateHomepageSlot = async (req, res) => {
  try {
    let { title, tags, sendTo, audience, content, category, slotIndex } = req.body;

    const newsletterData = {
      title,
      tags: convertToArray(tags),
      sendTo: convertToArray(sendTo),
      audience: convertToArray(audience),
      content: convertToArray(content),
      category,
      newsletterFilePath: normalizePath(req.files?.newsletterFile?.[0]),
      thumbnailPath: normalizePath(req.files?.thumbnail?.[0]),
      status: req.body.status || 'published',
      type: 'newsletter',
      homepageSlot: slotIndex !== undefined ? slotIndex : null
    };

    if (slotIndex !== undefined) {
      const updatedSlot = await Newsletter.findByIdAndUpdate(slotIndex, newsletterData, { new: true });
      return res.status(200).json(updatedSlot);
    }

    const newNewsletter = await Newsletter.create(newsletterData);
    res.status(201).json(newNewsletter);
  } catch (error) {
    res.status(400).json({ 
      error: "Failed to create or update homepage slot",
      details: error.message 
    });
  }
};

export const createNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.create({
      title: req.body.title,
      tags: convertToArray(req.body.tags),
      sendTo: convertToArray(req.body.sendTo),
      audience: convertToArray(req.body.audience),
      content: convertToArray(req.body.content),
      category: req.body.category,
      newsletterFilePath: normalizePath(req.files?.newsletterFile?.[0]),
      thumbnailPath: normalizePath(req.files?.thumbnail?.[0]),
      status: req.body.status || 'published',
      type: 'newsletter'
    });
    res.status(201).json(newsletter);
  } catch (error) {
    res.status(400).json({ 
      error: "Failed to create newsletter",
      details: error.message 
    });
  }
};

export const getNewsletters = async (req, res) => {
  try {
    const newsletters = await Newsletter.find({ status: "published" });
    res.json(newsletters);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch newsletters" });
  }
};

export const deleteNewsletter = async (req, res) => {
  try {
    await Newsletter.findByIdAndDelete(req.params.id);
    res.json({ message: 'Newsletter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete newsletter" });
  }
};

export const updateNewsletter = async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      tags: convertToArray(req.body.tags),
      sendTo: convertToArray(req.body.sendTo),
      audience: convertToArray(req.body.audience),
      content: convertToArray(req.body.content),
      category: req.body.category,
      status: req.body.status || 'published',
      ...(req.files?.newsletterFile?.[0] && { 
        newsletterFilePath: normalizePath(req.files.newsletterFile[0].path)
      }),
      ...(req.files?.thumbnail?.[0] && { 
        thumbnailPath: normalizePath(req.files.thumbnail[0].path)
      })
    };

    const updated = await Newsletter.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ 
      error: "Update failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const sendNewsletterToSubscribers = async (req, res) => {
  try {
    // Verify SendGrid API key is set
    if (!process.env.SENDGRID_API_KEY_2) {
      throw new Error('SendGrid API key not configured');
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY_2);

    const newsletter = await Newsletter.findById(req.params.id);
    if (!newsletter) {
      return res.status(404).json({ 
        success: false,
        code: 'NEWSLETTER_NOT_FOUND'
      });
    }

    // Debug: Log subscriber query
    console.log('Fetching active subscribers...');
    const subscribers = await Subscriber.find({ isActive: true });
    console.log(`Found ${subscribers.length} active subscribers`);

    if (subscribers.length === 0) {
      return res.status(200).json({ 
        success: true,
        code: 'NO_ACTIVE_SUBSCRIBERS',
        message: 'No active subscribers found'
      });
    }

    // Generate file URLs
    const thumbnailUrl = generateFileUrl(newsletter.thumbnailPath);
    const fileUrl = generateFileUrl(newsletter.newsletterFilePath);
    const fileExtension = getFileExtension(newsletter.newsletterFilePath);

    // Prepare template data
    const templateData = {
      subject: newsletter.title,
      title: newsletter.title,
      category: newsletter.category,
      content: convertToArray(newsletter.content).join('<br><br>'),
      tags: newsletter.tags,
      thumbnailUrl,
      fileUrl,
      fileExtension,
      currentYear: new Date().getFullYear(),
      sendDate: new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      headerImage: thumbnailUrl
    };

    // Send emails in smaller batches (100 per batch)
    const batchSize = 100;
    let successfulSends = 0;
    let failedSends = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      try {
        const messages = batch.map(subscriber => ({
          to: subscriber.email,
          from: {
            email: process.env.SENDGRID_FROM_EMAIL,
            name: process.env.SENDGRID_FROM_NAME || 'Financial Newsletter'
          },
          templateId: 'd-2534187eb2f646a795c59081b017b635',
          dynamicTemplateData: {
            ...templateData,
            firstName: subscriber.firstName || 'Subscriber',
            unsubscribeLink: `${process.env.BASE_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
          },
          mail_settings: {
            sandbox_mode: {
              enable: false // Ensure this is false in production
            }
          }
        }));

        await sgMail.send(messages);
        successfulSends += batch.length;
        console.log(`Sent batch ${i/batchSize + 1} successfully`);
      } catch (batchError) {
        failedSends += batch.length;
        console.error(`Error sending batch ${i/batchSize + 1}:`, batchError.response?.body || batchError.message);
      }
    }

    // Update newsletter status
    newsletter.sentAt = new Date();
    newsletter.sentToCount = successfulSends;
    await newsletter.save();

    res.status(200).json({
      success: true,
      sentCount: successfulSends,
      failedCount: failedSends,
      newsletterId: newsletter._id,
      message: `Newsletter sent to ${successfulSends} subscribers${failedSends > 0 ? ` (${failedSends} failed)` : ''}`
    });

  } catch (error) {
    console.error('Full Send Error:', {
      error: error.message,
      stack: error.stack,
      response: error.response?.body
    });

    res.status(500).json({
      success: false,
      code: 'SEND_FAILED',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        response: error.response?.body,
        stack: error.stack
      } : undefined
    });
  }
};