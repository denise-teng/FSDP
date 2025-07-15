import Contact from '../models/Contact.model.js';
import PotentialClient from '../models/PotentialClient.model.js';

export const submitContact = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, subject, message } = req.body;

    if (!firstName || !lastName || !phone || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Get latest contactId from existing contacts
    const latest = await Contact.findOne().sort({ contactId: -1 });
    const nextId = latest ? latest.contactId + 1 : 1;

    const newContact = new Contact({
      contactId: nextId,
      firstName,
      lastName,
      phone,
      email,
      subject,
      message,
    });

    await newContact.save();

    console.log('Contact saved:', newContact);
    res.status(200).json({ message: 'Contact submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit contact' });
  }
};


export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Contact.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) return res.status(404).json({ error: 'Contact not found' });

    res.status(200).json({ message: 'Contact updated successfully', updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Contact not found' });

    // Step 3: Also delete the matching potential client using contactId
    await PotentialClient.findOneAndDelete({ contactId: deleted.contactId });

    res.status(200).json({ message: 'Contact and matching potential client deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};
