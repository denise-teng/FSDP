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
      return data.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [data].filter(v => v !== undefined && v !== null);
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

// In newsletter.controller.js
export const updateNewsletter = async (req, res) => {
  console.log('[BACKEND] Received newsletter update request');
  try {
    const { id } = req.params;
    console.log(`[BACKEND] Updating newsletter ID: ${id}`);

    // Build updates with proper normalization (only set when provided)
    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.category !== undefined) updates.category = req.body.category;
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (req.body.type !== undefined) updates.type = req.body.type;

    if (req.body.tags !== undefined) updates.tags = convertToArray(req.body.tags);
    if (req.body.sendTo !== undefined) updates.sendTo = convertToArray(req.body.sendTo);
    if (req.body.audience !== undefined) updates.audience = convertToArray(req.body.audience);
    if (req.body.content !== undefined) updates.content = convertToArray(req.body.content);

    // files
    if (req.files?.newsletterFile?.[0]) {
      updates.newsletterFilePath = `uploads/${req.files.newsletterFile[0].filename}`;
    }
    if (req.files?.thumbnail?.[0]) {
      updates.thumbnailPath = `uploads/${req.files.thumbnail[0].filename}`;
    }

    const existing = await Newsletter.findById(id);
    if (!existing) {
      console.error('[BACKEND] Newsletter not found');
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    // preserve existing file paths if no new files provided
    if (updates.newsletterFilePath === undefined && existing.newsletterFilePath) {
      updates.newsletterFilePath = existing.newsletterFilePath;
    }
    if (updates.thumbnailPath === undefined && existing.thumbnailPath) {
      updates.thumbnailPath = existing.thumbnailPath;
    }

    console.log('[BACKEND] Final updates:', updates);

    const newsletter = await Newsletter.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    console.log('[BACKEND] Update successful:', { id: newsletter._id, title: newsletter.title, status: newsletter.status });
    res.json(newsletter);
  } catch (error) {
    console.error('[BACKEND] Update error:', { message: error.message, stack: error.stack, validationErrors: error.errors });
    res.status(400).json({ error: error.message });
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

const log = {
  info: (...args) => console.log('\x1b[36m[INFO]\x1b[0m', ...args),     // cyan
  warn: (...args) => console.warn('\x1b[33m[WARN]\x1b[0m', ...args),  // yellow
  error: (...args) => console.error('\x1b[31m[ERROR]\x1b[0m', ...args), // red
};

export const getSlots = async (req, res) => {
  log.info('===== [getSlots] START =====');
  try {
    const found = await Newsletter.find({
      homepageSlot: { $in: [0, 1, 2] },
      status: 'published',
    }).lean();

    log.info('[getSlots] Raw DB result count:', found.length);
    log.info('[getSlots] Found newsletters:', found.map(f => ({ id: f._id, slot: f.homepageSlot })));

    const slots = [null, null, null];
    for (const n of found) {
      const idx = Number(n.homepageSlot);
      log.info('[getSlots] Processing', { id: n._id, homepageSlot: n.homepageSlot, idx });
      if (Number.isFinite(idx) && idx >= 0 && idx <= 2) {
        slots[idx] = n;
      }
    }

    log.info('[getSlots] Final slots array:', slots.map(s => s?._id || null));
    log.info('===== [getSlots] END =====');
    res.json(slots);
  } catch (e) {
    log.error('[getSlots] ERROR:', e.message);
    log.error(e.stack);
    res.status(500).json({ error: 'Failed to load homepage slots' });
  }
};

// ---------------------- UPDATE SLOT ----------------------
export const updateSlot = async (req, res) => {
  log.info('===== [updateSlot] START =====');
  try {
    log.info('[updateSlot] Raw body:', req.body);
    log.info('[updateSlot] Raw params:', req.params);
    log.info('[updateSlot] Raw files:', req.files);

    const slotIndex = Number(req.body.slotIndex);
    const newsletterId = String(req.body.newsletterId || '');

    log.info('[updateSlot] Coerced values -> slotIndex:', slotIndex, '| newsletterId:', newsletterId);

    if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex > 2) {
      log.warn('[updateSlot] Invalid slot index received:', slotIndex);
      return res.status(400).json({ error: 'Invalid slot index (0–2)' });
    }
    if (!newsletterId) {
      log.warn('[updateSlot] No newsletterId provided');
      return res.status(400).json({ error: 'newsletterId is required' });
    }

    const target = await Newsletter.findById(newsletterId);
    log.info('[updateSlot] Target newsletter found:', target?._id || null);

    if (!target) {
      log.warn('[updateSlot] Newsletter not found for id:', newsletterId);
      return res.status(404).json({ error: 'Newsletter not found' });
    }

    const clearRes = await Newsletter.updateMany(
      { homepageSlot: slotIndex },
      { $set: { homepageSlot: null } }
    );
    log.info('[updateSlot] Cleared slot', slotIndex, '-> modifiedCount:', clearRes.modifiedCount);

    target.homepageSlot = slotIndex;
    await target.save();
    log.info('[updateSlot] Saved newsletter with new slot assignment:', { id: target._id, slotIndex });

    const found = await Newsletter.find({
      homepageSlot: { $in: [0, 1, 2] },
      status: 'published',
    }).lean();
    log.info('[updateSlot] Refetched slot assignments:', found.map(f => ({ id: f._id, slot: f.homepageSlot })));

    const slots = [null, null, null];
    for (const n of found) {
      const idx = Number(n.homepageSlot);
      log.info('[updateSlot] Processing newsletter', { id: n._id, homepageSlot: n.homepageSlot, idx });
      if (Number.isFinite(idx) && idx >= 0 && idx <= 2) {
        slots[idx] = n;
      }
    }

    log.info('[updateSlot] Final slots array:', slots.map(s => s?._id || null));
    log.info('===== [updateSlot] END =====');
    return res.json({ ok: true, slots });
  } catch (e) {
    log.error('[updateSlot] ERROR:', e.message);
    log.error(e.stack);
    return res.status(500).json({ error: 'Failed to update slot', details: e.message });
  }
};