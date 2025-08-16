import Draft from '../models/draft.model.js';

export const getDeletedDrafts = async (req, res) => {
  try {
    const drafts = await Draft.find({ deletedAt: { $ne: null } })
      .sort({ deletedAt: -1 });
    res.json(drafts);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch deleted drafts',
      details: error.message 
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
    
    res.json({ draft });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to restore draft',
      details: error.message 
    });
  }
};

export const permanentlyDeleteDraft = async (req, res) => {
  try {
    const result = await Draft.deleteOne({ 
      _id: req.params.id,
      deletedAt: { $ne: null } 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Draft not found or not marked as deleted' 
      });
    }

    res.json({ 
      success: true,
      message: 'Draft permanently deleted'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete draft',
      details: error.message 
    });
  }
};

export const deleteDraft = async (req, res) => {
  try {
    const draft = await Draft.findByIdAndUpdate(
      req.params.id,
      { $set: { deletedAt: new Date() } },
      { new: true }
    );
    
    if (!draft) {
      return res.status(404).json({ 
        success: false,
        message: 'Draft not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Draft moved to trash',
      draft // Make sure to return the updated draft
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