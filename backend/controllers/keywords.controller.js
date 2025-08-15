import Keywords from '../models/Keywords.model.js';

// Get all keywords
export const getKeywords = async (req, res) => {
  try {
    const keywords = await Keywords.find().sort({ createdAt: -1 });
    res.status(200).json(keywords);
  } catch (error) {
    console.error('Error fetching keywords:', error);
    res.status(500).json({ error: 'Failed to fetch keywords' });
  }
};

// Get active keywords only
export const getActiveKeywords = async (req, res) => {
  try {
    const keywords = await Keywords.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(keywords);
  } catch (error) {
    console.error('Error fetching active keywords:', error);
    res.status(500).json({ error: 'Failed to fetch active keywords' });
  }
};

// Add a new keyword
export const addKeyword = async (req, res) => {
  try {
    console.log('Received add keyword request:', req.body);
    const { keyword, description } = req.body;

    if (!keyword) {
      console.log('No keyword provided');
      return res.status(400).json({ error: 'Keyword is required' });
    }

    console.log('Checking for existing keyword:', keyword.toLowerCase().trim());
    // Check if keyword already exists
    const existingKeyword = await Keywords.findOne({ keyword: keyword.toLowerCase().trim() });
    if (existingKeyword) {
      console.log('Keyword already exists:', existingKeyword);
      return res.status(409).json({ error: 'Keyword already exists' });
    }

    console.log('Getting next keyword ID...');
    // Get the next keywordId
    const latest = await Keywords.findOne().sort({ keywordId: -1 });
    const nextId = latest ? latest.keywordId + 1 : 1;
    console.log('Next keyword ID will be:', nextId);

    const newKeyword = new Keywords({
      keywordId: nextId,
      keyword: keyword.toLowerCase().trim(),
      description: description || ''
    });

    console.log('Saving new keyword:', newKeyword);
    await newKeyword.save();

    console.log('Keyword added successfully:', newKeyword);
    res.status(201).json({ 
      message: 'Keyword added successfully',
      keyword: newKeyword
    });
  } catch (error) {
    console.error('Error adding keyword:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Failed to add keyword' });
  }
};

// Update a keyword
export const updateKeyword = async (req, res) => {
  try {
    const { id } = req.params;
    const { keyword, description, isActive } = req.body;

    const updatedKeyword = await Keywords.findOneAndUpdate(
      { keywordId: parseInt(id) },
      { 
        keyword: keyword?.toLowerCase().trim(),
        description,
        isActive,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!updatedKeyword) {
      return res.status(404).json({ error: 'Keyword not found' });
    }

    console.log('Keyword updated:', updatedKeyword);
    res.status(200).json({ 
      message: 'Keyword updated successfully',
      keyword: updatedKeyword
    });
  } catch (error) {
    console.error('Error updating keyword:', error);
    res.status(500).json({ error: 'Failed to update keyword' });
  }
};

// Delete a keyword
export const deleteKeyword = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedKeyword = await Keywords.findOneAndDelete({ keywordId: parseInt(id) });

    if (!deletedKeyword) {
      return res.status(404).json({ error: 'Keyword not found' });
    }

    console.log('Keyword deleted:', deletedKeyword);
    res.status(200).json({ 
      message: 'Keyword deleted successfully',
      keyword: deletedKeyword
    });
  } catch (error) {
    console.error('Error deleting keyword:', error);
    res.status(500).json({ error: 'Failed to delete keyword' });
  }
};

// Toggle keyword active status
export const toggleKeywordStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const keyword = await Keywords.findOne({ keywordId: parseInt(id) });
    if (!keyword) {
      return res.status(404).json({ error: 'Keyword not found' });
    }

    keyword.isActive = !keyword.isActive;
    await keyword.save();

    console.log('Keyword status toggled:', keyword);
    res.status(200).json({ 
      success: true,
      message: 'Keyword status updated successfully',
      data: keyword
    });
  } catch (error) {
    console.error('Error toggling keyword status:', error);
    res.status(500).json({ error: 'Failed to toggle keyword status' });
  }
};
