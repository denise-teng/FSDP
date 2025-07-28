import Draft from '../models/draft.model.js';

export const getDeletedDrafts = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = { deletedAt: { $ne: null } };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const deletedDrafts = await Draft.find(query).sort({ deletedAt: -1 });
    res.json(deletedDrafts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deleted drafts' });
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
    const draft = await Draft.findByIdAndDelete(req.params.id);
    
    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }
    
    // Optionally delete associated files here
    res.json({ message: 'Draft permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete draft' });
  }
};