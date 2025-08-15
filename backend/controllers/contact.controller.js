import Contact from '../models/Contact.model.js';
import PotentialClient from '../models/PotentialClient.model.js';
import { createContactHistory } from './contacthistory.controller.js';  // Adjust path if needed
import ContactHistory from '../models/contacthistory.model.js';  // Import ContactHistory
import Keywords from '../models/Keywords.model.js';  // Import Keywords model


export const submitContact = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, subject, message } = req.body;

    if (!firstName || !lastName || !phone || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Get latest contactId from existing contacts
    const latest = await Contact.findOne().sort({ contactId: -1 });
    const nextId = latest ? latest.contactId + 1 : 1;

    // Fetch active keywords from database
    let flaggedKeywords = ['schedule', 'meeting', 'help', 'urgent']; // fallback
    try {
      const activeKeywords = await Keywords.find({ isActive: true });
      if (activeKeywords.length > 0) {
        flaggedKeywords = activeKeywords.map(k => k.keyword);
      }
    } catch (keywordError) {
      console.error('Error fetching keywords, using fallback:', keywordError);
    }

    // Check for flagged keywords in the message
    const flaggedKeywordsFound = flaggedKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // If any flagged keywords are found, flag as potential client
    let potentialClientReason = flaggedKeywordsFound.length > 0 
      ? `${flaggedKeywordsFound.join(', ')}`
      : '';

    // Save the contact details
    const newContact = new Contact({
      contactId: nextId,
      firstName,
      lastName,
      phone,
      email,
      subject,
      message,
    });

    // Save to the database
    await newContact.save();

    // If flagged as a potential client, save to PotentialClient collection
    if (flaggedKeywordsFound.length > 0) {
      const newPotentialClient = new PotentialClient({
        contactId: nextId,
        firstName,
        lastName,
        phone,
        email,
        subject,
        message,
        reason: potentialClientReason
      });

      await newPotentialClient.save();
    }

    console.log('Contact saved:', newContact);
    res.status(200).json({ 
      message: 'Contact submitted successfully',
      flaggedKeywords: potentialClientReason // Return the flagged keywords reason
    });
  } catch (error) {
    console.error('Error submitting contact:', error);
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

// contact.controller.js - Delete contact (backend)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params; // The ID of the contact to delete

    // 1. Find the contact to delete
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    // 2. Check if the contact already exists in the ContactHistory collection
    const existingHistory = await ContactHistory.findOne({ contactId: contact.contactId });

    // If it already exists in the history, return early
    if (existingHistory) {
      return res.status(400).json({ success: false, error: 'Contact already archived in history' });
    }

    // 3. Archive the contact in history
    const historyRecord = {
      contactId: contact.contactId, // Preserve the original contactId
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
      originalContactId: contact._id,  // MongoDB ID as originalContactId
      action: 'deleted',  // Archive action as 'deleted'
      deletedAt: new Date(),  // Archive the time of deletion
    };

    // Save the contact history record
    await ContactHistory.create(historyRecord);

    // 4. Delete the contact from the main collection
    await Contact.findByIdAndDelete(id);

    // 5. Send success response after both operations are completed
    return res.status(200).json({
      success: true,
      message: 'Contact archived and deleted successfully',
      data: { contactId: contact.contactId, originalContactId: contact._id }
    });

  } catch (err) {
    console.error('Error deleting contact:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to archive contact',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
