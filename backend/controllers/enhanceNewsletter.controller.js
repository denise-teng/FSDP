import Newsletter from '../models/NewsletterModel.js';

export const createNewsletter = async (req, res) => {
  try {
    const { title, content } = req.body;

    const newNewsletter = new Newsletter({
      title,
      content,
    });

    await newNewsletter.save();
    res.status(201).json(newNewsletter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rename the enhance function to avoid conflict
export const enhanceNewsletter = async (req, res) => {
  try {
    const { newsletterId, enhancedContent } = req.body;

    const newsletter = await Newsletter.findById(newsletterId);
    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    newsletter.enhancedContent = enhancedContent;
    await newsletter.save();
    res.status(200).json(newsletter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
