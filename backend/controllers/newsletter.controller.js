import Newsletter from '../models/newsletter.model.js';
import cloudinary from '../lib/cloudinary.js';

export const createNewsletter = async (req, res) => {
  try {
    const { title, content, category, isDraft } = req.body;
    let thumbnailUrl = null;

    if (req.file) { // Assuming you're using Multer for file uploads
      const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
        folder: 'newsletters',
      });
      thumbnailUrl = cloudinaryResponse.secure_url;
    }

    const newsletter = await Newsletter.create({
      title,
      content,
      category,
      thumbnail: thumbnailUrl,
      isDraft: isDraft || true, // Default to draft if not specified
      createdBy: req.user._id, // Assuming you have user auth
    });

    res.status(201).json(newsletter);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create newsletter', error: error.message });
  }
};

export const getNewsletters = async (req, res) => {
  try {
    const { isDraft } = req.query;
    const filter = { createdBy: req.user._id };

    if (isDraft !== undefined) filter.isDraft = isDraft;

    const newsletters = await Newsletter.find(filter);
    res.json(newsletters);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch newsletters', error: error.message });
  }
};
export const updateNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, isDraft } = req.body;

    const newsletter = await Newsletter.findById(id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found' });

    // Update fields
    newsletter.title = title || newsletter.title;
    newsletter.content = content || newsletter.content;
    newsletter.category = category || newsletter.category;
    newsletter.isDraft = isDraft !== undefined ? isDraft : newsletter.isDraft;

    await newsletter.save();
    res.json(newsletter);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update newsletter', error: error.message });
  }
};
export const deleteNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    const newsletter = await Newsletter.findByIdAndDelete(id);

    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    // Delete thumbnail from Cloudinary if it exists
    if (newsletter.thumbnail) {
      const publicId = newsletter.thumbnail.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`newsletters/${publicId}`);
    }

    res.json({ message: 'Newsletter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete newsletter', error: error.message });
  }
};

export const publishNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    const newsletter = await Newsletter.findById(id);

    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found' });

    newsletter.isDraft = false;
    await newsletter.save();

    res.json({ message: 'Newsletter published!', newsletter });
  } catch (error) {
    res.status(500).json({ message: 'Failed to publish newsletter', error: error.message });
  }
};
