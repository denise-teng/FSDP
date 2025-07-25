import Draft from '../models/draft.model.js';
import path from 'path';

// Helper function to ensure array structure for tags, sendTo, audience, and content
const ensureArray = (data) => {
  if (!data) return [];  // If data is undefined or null, return an empty array

  if (Array.isArray(data)) {
    return data.map(item => String(item));  // Ensure all items are strings
  }

  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);  // Try parsing if it's a stringified array
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return data.split(',')  // If parsing fails, treat it as comma-separated
        .map(item => item.trim())
        .filter(item => item);  // Ensure no empty items
    }
  }
  return [data];  // Convert single values into an array
};

// Create a new draft
export const createDraft = async (req, res) => {
  console.log('RAW REQUEST BODY:', req.body);

  try {
    // Validate category field
    const validCategories = ['Financial Planning', 'Insurance', 'Estate Planning', 'Tax Relief'];
    const category = String(req.body.category || '').trim();
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
      });
    }

    // Process fields using the ensureArray function for tags, sendTo, audience, and content
    const draftData = {
      title: String(req.body.title || ''),
      tags: ensureArray(req.body.tags),
      sendTo: ensureArray(req.body.sendTo),
      audience: ensureArray(req.body.audience),
      content: ensureArray(req.body.content),
      category, // Use the validated category
      status: "draft", // Default to 'draft' status
      type: "newsletter", // Default to 'newsletter' type
      newsletterFilePath: req.files?.newsletterFile?.[0]?.path?.replace(/\\/g, '/'),
      thumbnailPath: req.files?.thumbnail?.[0]?.path?.replace(/\\/g, '/'),
    };

    console.log('PROCESSED DATA:', draftData);  // Check processed data before inserting into DB

    // Validate required fields
    if (!draftData.title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Create the draft in the database
    const draft = await Draft.create(draftData);
    res.status(201).json({
      message: 'Draft created successfully!',
      draft
    });
  } catch (error) {
    console.error('FULL ERROR:', error);
    res.status(400).json({
      error: "Validation failed",
      details: error.message
    });
  }
};


export const getDrafts = async (req, res) => {
try{
const drafts = await Draft.find({ status: "draft" }).sort({ createdAt: -1 });
res.json(drafts);
} catch (error) {
console.log('Error in drafts controller', error.message);
res.status(500).json({message: ' Server error', error: error.message});
}
};

// Delete a draft by ID
export const deleteDraft = async (req, res) => {
  try {
    const draft = await Draft.findByIdAndDelete(req.params.id);
    if (!draft) return res.status(404).json({ message: 'Draft not found' });
    res.status(200).json({ message: 'Draft deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete draft' });
  }
};

// Edit an existing draft
export const editDraft = async (req, res) => {
  try {
    const { title, content, category, type } = req.body;

    // Validate category field
    const validCategories = ['Financial Planning', 'Insurance', 'Estate Planning', 'Tax Relief'];
    const validType = ['draft', 'newsletter'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
      });
    }

    if (!validType.includes(type)) {
      return res.status(400).json({
        error: `Invalid type. Must be one of: ${validType.join(', ')}`,
      });
    }

    // Update the draft data
    const updateData = {
      title,
      content,
      category,
      type: type === 'newsletter' ? 'newsletter' : 'draft', // Use 'newsletter' if type is passed as 'newsletter'
      ...(req.files?.newsletterFile && {
        newsletterFilePath: `uploads/${req.files.newsletterFile[0].filename}`,
      }),
      ...(req.files?.thumbnail && {
        thumbnailPath: `uploads/${req.files.thumbnail[0].filename}`,
      }),
    };

    // Update the draft or newsletter
    const draft = await Draft.findByIdAndUpdate(req.params.id, updateData, {
      new: true, 
      runValidators: true, // Ensure any validations are run
    });

    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    // Return the updated draft
    res.status(200).json({
      message: type === 'newsletter' ? 'Newsletter published successfully' : 'Draft updated successfully',
      draft,
    });
  } catch (error) {
    console.error("Error updating draft:", error);
    res.status(500).json({ error: "Failed to update draft" });
  }
};
