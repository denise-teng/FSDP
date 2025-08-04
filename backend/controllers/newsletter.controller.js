import Newsletter from '../models/newsletter.model.js';
import path from 'path';

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


// Add this to your newsletter.controller.js
export const getNewsletterById = async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id)
      .select('-__v')
      .lean();
    
    if (!newsletter) {
      return res.status(404).json({ 
        success: false,
        message: 'Newsletter not found' 
      });
    }

    if (newsletter.newsletterFilePath) {
      newsletter.downloadUrl = generateFileUrl(newsletter.newsletterFilePath);
    }

    res.json({
      success: true,
      data: newsletter
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch newsletter',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};