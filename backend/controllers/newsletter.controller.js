import Newsletter from '../models/newsletter.model.js';



export const createOrUpdateHomepageSlot = async (req, res) => {
  console.log('CREATE OR UPDATE HOMEPAGE SLOT FUNCTION CALLED');
  console.log('REQ BODY:', req.body);

  try {
    let { title, tags, sendTo, audience, content, category, slotIndex } = req.body;

    // Convert fields to proper arrays
    tags = convertToArray(tags);
    audience = convertToArray(audience);
    sendTo = convertToArray(sendTo);
    content = convertToArray(content);

    // Handle file uploads
    const newsletterFile = req.files?.newsletterFile?.[0];
    const thumbnail = req.files?.thumbnail?.[0];

    const normalizePath = (path) => path ? path.replace(/\\/g, '/') : null;

    // Construct newsletter data for the slot
    const newsletterData = {
      title,
      tags,
      sendTo,
      audience,
      content,
      category,
      newsletterFilePath: normalizePath(newsletterFile?.path),
      thumbnailPath: normalizePath(thumbnail?.path),
      status: req.body.status || 'published',
      type: 'newsletter'
    };

    console.log('Processed data:', newsletterData);

    // If the slotIndex is provided, update the existing newsletter (slot) for that index
    if (slotIndex !== undefined) {
      const updatedSlot = await Newsletter.findByIdAndUpdate(slotIndex, newsletterData, { new: true });
      return res.status(200).json({
        message: 'Slot updated successfully!',
        newsletter: updatedSlot
      });
    }

    // Otherwise, create a new newsletter (slot)
    const newNewsletter = await Newsletter.create(newsletterData);
    
    res.status(201).json({
      message: 'Newsletter created successfully!',
      newsletter: newNewsletter
    });
  } catch (error) {
    console.error("Error creating or updating homepage slot:", error);
    res.status(400).json({ 
      error: "Failed to create or update homepage slot",
      details: error.message 
    });
  }
};



export const createNewsletter = async (req, res) => {
  console.log('CREATE NEWSLETTER FUNCTION CALLED');
  console.log('REQ BODY:', req.body);

  try {
    let { title, tags, sendTo, audience, content, category } = req.body;

    // Convert fields to proper arrays
    tags = convertToArray(tags);
    audience = convertToArray(audience);
    sendTo = convertToArray(sendTo);
    content = convertToArray(content);

    // Handle file uploads
    const newsletterFile = req.files?.newsletterFile?.[0];
    const thumbnail = req.files?.thumbnail?.[0];

    const normalizePath = (path) => path ? path.replace(/\\/g, '/') : null;

    // Construct newsletter data
    const newsletterData = {
      title,
      tags,
      sendTo,
      audience,
      content,
      category,
      newsletterFilePath: normalizePath(newsletterFile?.path),
      thumbnailPath: normalizePath(thumbnail?.path),
      status: req.body.status || 'published',
      type: 'newsletter'
    };

    console.log('Processed data:', newsletterData);
    console.log("Creating newsletter with status:", newsletterData.status);

    const newNewsletter = await Newsletter.create(newsletterData);
    
    res.status(201).json({
      message: 'Newsletter created successfully!',
      newsletter: newNewsletter
    });
  } catch (error) {
    console.error("Error creating newsletter:", error);
    res.status(400).json({ 
      error: "Failed to create newsletter",
      details: error.message 
    });
  }
};

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

// In your newsletter.controller.js
export const getNewsletters = async (req, res) => {
  try {
    const newsletters = await Newsletter.find({ status: "published" }); // 👈 Only published
    res.json(newsletters);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch newsletters." });
  }
};

export const deleteNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    await Newsletter.findByIdAndDelete(id);
    res.json({ message: 'Newsletter deleted successfully' });
  } catch (error) {
    console.error("Error deleting newsletter:", error);
    res.status(500).json({ error: "Failed to delete newsletter." });
  }
};

// In newsletter.controller.js
const normalizePath = (file) => {
  if (!file) return undefined;
  // Force Unix-style path and ensure consistent format
  return `uploads/${file.filename}`;
};

export const updateNewsletter = async (req, res) => {
  try {
    // Safer field processing
    const processField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return field.split(',').map(item => item.trim());
        }
      }
      return [field];
    };

    // Handle file updates
    const updateData = {
      title: req.body.title,
      tags: processField(req.body.tags),
      sendTo: processField(req.body.sendTo),
      audience: processField(req.body.audience),
      content: processField(req.body.content),
      category: req.body.category,
      status: req.body.status || 'published',
      type: Array.isArray(req.body.type) ? req.body.type[0] : req.body.type, // Handle array case
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

    res.json({
      message: 'Newsletter updated successfully!',
      newsletter: updated
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ 
      error: "Update failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};