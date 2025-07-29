import WhatsappContact from '../models/whatsappContact.model.js';

export const createWhatsappContact = async (req, res) => {
  try {
    console.log('📝 Received request body:', req.body); // Debug log
    const { firstName, lastName, phone, email, company, eventName, eventDate } = req.body;

    // Check each field individually for debugging
    console.log('📋 Fields check:', {
      firstName: !!firstName,
      lastName: !!lastName,
      phone: !!phone,
      email: !!email,
      company: !!company,
      eventName: !!eventName,
      eventDate: !!eventDate
    });

    if (!firstName || !lastName || !phone || !email || !company || !eventName || !eventDate) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    console.log('✅ Creating contact with data:', {
      firstName,
      lastName,
      phone,
      email,
      company,
      eventName,
      eventDate
    });

    const newContact = await WhatsappContact.create({
      firstName,
      lastName,
      phone,
      email,
      company,
      eventName,
      eventDate
    });

    console.log('🎉 Contact created successfully:', newContact);
    res.status(201).json(newContact);
  } catch (error) {
    console.error('❌ Error creating WhatsApp contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
};

export const getAllWhatsappContacts = async (req, res) => {
  try {
    const contacts = await WhatsappContact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve contacts' });
  }
};

export const updateWhatsappContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await WhatsappContact.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
};

export const deleteWhatsappContact = async (req, res) => {
  try {
    const { id } = req.params;
    await WhatsappContact.findByIdAndDelete(id);
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};
