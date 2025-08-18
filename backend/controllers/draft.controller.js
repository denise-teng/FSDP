import Draft from '../models/draft.model.js';
import path from 'path';

const getDraftsQuery = {
  status: "draft",
  deletedAt: null
};

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

export const createDraft = async (req, res) => {
  console.log('RAW REQUEST BODY:', req.body);
  console.log('FILES:', req.files);

  try {
    // Enhanced ensureArray function that handles both FormData and JSON
    const ensureArray = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) return data.map(String);

      // Handle JSON strings
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
        } catch {
          return data.split(',').map(item => item.trim()).filter(item => item);
        }
      }
      return [String(data)];
    };

    // Process all fields
    const draftData = {
      title: String(req.body.title || ''),
      content: ensureArray(req.body.content),
      tags: ensureArray(req.body.tags),
      sendTo: ensureArray(req.body.sendTo),
      audience: ensureArray(req.body.audience),
      category: req.body.category || 'General',
      status: "draft",
      type: req.body.type || "generated",
      newsletterFilePath: req.files?.newsletterFile?.[0]
        ? `uploads/${req.files.newsletterFile[0].filename}`
        : undefined,
      thumbnailPath: req.files?.thumbnail?.[0]
        ? `uploads/${req.files.thumbnail[0].filename}`
        : undefined,

    };

    console.log('PROCESSED DRAFT DATA:', draftData);

    // Validate required fields
    if (!draftData.title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Create the draft
    const draft = await Draft.create(draftData);

    res.status(201).json({
      message: 'Draft created successfully!',
      draft
    });

  } catch (error) {
    console.error('Create draft error:', {
      message: error.message,
      stack: error.stack,
      errors: error.errors
    });

    res.status(400).json({
      error: "Validation failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



export const getDrafts = async (req, res) => {
  try {
    console.log('Fetching drafts...');
    const drafts = await Draft.find({ status: 'draft' });
    console.log('Fetched drafts:', drafts);  // Log the fetched drafts
    res.json(drafts);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
};


export const deleteDraft = async (req, res) => {
  try {
    // Verify draft exists and isn't already deleted
    const existingDraft = await Draft.findOne({
      _id: req.params.id,
      deletedAt: null
    });

    if (!existingDraft) {
      return res.status(404).json({
        message: 'Draft not found or already deleted'
      });
    }

    // Soft delete with timestamp only (don't change status)
    const updatedDraft = await Draft.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          deletedAt: new Date()
          // Remove status update since it's not in your schema
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Draft moved to trash',
      draft: updatedDraft
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete draft',
      details: error.message
    });
  }
};

export const getDeletedDrafts = async (req, res) => {
  try {
    console.log('Fetching deleted drafts...');
    const drafts = await Draft.find({
      deletedAt: { $ne: null }
    })
      .sort({ deletedAt: -1 })
      .lean(); // Use lean() for better performance

    console.log('Fetched deleted drafts count:', drafts.length);
    res.json(drafts);
  } catch (error) {
    console.error('Error fetching deleted drafts:', error);
    res.status(500).json({
      error: 'Failed to fetch deleted drafts',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const restoreDraft = async (req, res) => {
  try {
    const draft = await Draft.findByIdAndUpdate(
      req.params.id,
      { $set: { deletedAt: null } },
      { new: true }
    );

    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    res.json({ message: 'Draft restored successfully', draft });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore draft' });
  }
};

export const permanentlyDeleteDraft = async (req, res) => {
  try {
    const result = await Draft.deleteOne({ _id: req.params.id, deletedAt: { $ne: null } });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found or not marked as deleted'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Draft permanently deleted',
      id: req.params.id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete draft',
      details: error.message
    });
  }
};


export const editDraft = async (req, res) => {
  try {
    const { title, content, category /*, status, type */ } = req.body;

    const validCategories = ['Financial Planning', 'Insurance', 'Estate Planning', 'Tax Relief'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
    }

    // optional: normalize arrays if you allow editing them
    const toArr = (v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      try { const p = JSON.parse(v); return Array.isArray(p) ? p : [String(p)]; } catch { return String(v).split(',').map(s=>s.trim()).filter(Boolean); }
    };

    const updateData = {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content: toArr(content) }),
      ...(category !== undefined && { category }),
      ...(req.body.tags !== undefined && { tags: toArr(req.body.tags) }),
      ...(req.body.sendTo !== undefined && { sendTo: toArr(req.body.sendTo) }),
      ...(req.body.audience !== undefined && { audience: toArr(req.body.audience) }),
      ...(req.files?.newsletterFile && { newsletterFilePath: `uploads/${req.files.newsletterFile[0].filename}` }),
      ...(req.files?.thumbnail && { thumbnailPath: `uploads/${req.files.thumbnail[0].filename}` }),
      // Do NOT set `type` to 'draft' (invalid). Don’t flip status here either.
    };

    const draft = await Draft.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!draft) return res.status(404).json({ message: 'Draft not found' });

    res.status(200).json({ message: 'Draft updated successfully', draft });
  } catch (error) {
    console.error("Error updating draft:", error);
    res.status(500).json({ error: "Failed to update draft" });
  }
};



// controllers/draft.controller.js
export const getDraftById = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id).lean();
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    // Clean path helper
    const asPublic = (p) => p ? p.replace(/\\/g, '/').replace(/^\/+/, '') : null;

    // ✅ Build absolute URLs from the incoming request origin (works in dev & prod)
    const origin = `${req.protocol}://${req.get('host')}`;

    if (draft.newsletterFilePath) {
      const clean = asPublic(draft.newsletterFilePath);
      draft.downloadUrl = `${origin}/${clean}`;
    }

    if (draft.thumbnailPath) {
      const clean = asPublic(draft.thumbnailPath);
      draft.thumbnailUrl = `${origin}/${clean}`;
    }

    return res.json({ success: true, data: draft });
  } catch (error) {
    console.error('getDraftById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch draft' });
  }
};
