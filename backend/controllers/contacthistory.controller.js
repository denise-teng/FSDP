import ContactHistory from '../models/contacthistory.model.js';
import Contact from '../models/Contact.model.js'; // For restoring to the main contact collection

// Fetch all contact history (deleted contacts)
export const getContactHistory = async (req, res) => {
  try {
    const history = await ContactHistory.find().sort({ deletedAt: -1 });  // Sorting by deletion date (newest first)
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contact history' });
  }
};

// Add an archived contact to history (instead of flagged)
export const addContactHistory = async (req, res) => {
  try {
    const { contactId } = req.body;

    if (!contactId) {
      return res.status(400).json({ error: 'Missing contactId' });
    }

    // Check if the contact already exists in history
    const exists = await ContactHistory.findOne({ contactId });
    if (exists) return res.status(409).json({ error: 'Contact already archived' });

    const contactHistory = new ContactHistory(req.body);
    await contactHistory.save();
    res.status(201).json(contactHistory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add contact to history' });
  }
};

// Recover a deleted contact (undo deletion)
export const recoverContact = async (req, res) => {
  try {
    const { id } = req.params; // Get the contact history record by ID

    // 1. Find the contact history record to recover
    const contactHistory = await ContactHistory.findById(id);
    if (!contactHistory) {
      return res.status(404).json({ success: false, error: 'Contact history record not found' });
    }

    // 2. Restore the contact back to the main Contact collection
    const restoredContact = new Contact({
      contactId: contactHistory.contactId,
      firstName: contactHistory.firstName,
      lastName: contactHistory.lastName,
      phone: contactHistory.phone,
      email: contactHistory.email,
      subject: contactHistory.subject,
      message: contactHistory.message,
    });

    // Save the restored contact
    await restoredContact.save();

    res.status(200).json({
      success: true,
      message: 'Contact recovered successfully',
      data: restoredContact,
    });
  } catch (err) {
    console.error('Recovery error:', err);
    res.status(500).json({ error: 'Failed to recover contact' });
  }
};

// Permanently delete a contact from history (by ID)
export const deleteContactHistory = async (req, res) => {
  try {
    const { id } = req.params; // The ID of the contact history record to delete
    const deletedRecord = await ContactHistory.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ error: 'Contact history record not found' });
    }

    res.status(200).json({ message: 'Contact history deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contact history' });
  }
};

// Permanently delete a contact history by its contactId
export const deleteByContactIdHistory = async (req, res) => {
  try {
    const { contactId } = req.params; // contactId to search for in history
    const deleted = await ContactHistory.findOneAndDelete({ contactId });

    if (!deleted) {
      return res.status(404).json({ error: 'Contact history not found for this contactId' });
    }

    res.status(200).json({ message: 'Contact history deleted by contactId' });
  } catch (err) {
    console.error('Error deleting by contactId:', err);
    res.status(500).json({ error: 'Failed to delete contact history by contactId' });
  }
};

// Archive a deleted contact (Create history record)
// contacthistory.controller.js

// Archive a deleted contact (Create history record)
// Archive a deleted contact (Create history record)
// Archive a deleted contact (Create history record)
// Archive a deleted contact (Create history record)
export const createContactHistory = async (req, res) => {
  try {
    const { contactId, originalContactId, firstName, lastName, email, phone, subject, message } = req.body;

    if (!contactId || !originalContactId || !firstName || !lastName || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure the next contactId is unique by checking the highest contactId in the ContactHistory collection
    const latestHistory = await ContactHistory.findOne().sort({ contactId: -1 });
    let nextContactId = latestHistory ? latestHistory.contactId + 1 : 1;

    // If nextContactId is NaN, reset to 1 (in case there's some error in calculation)
    if (isNaN(nextContactId)) {
      nextContactId = 1;
    }

    // Now create a new history record with the new unique contactId
    const historyRecord = new ContactHistory({
      contactId: nextContactId,  // Use the newly calculated unique contactId
      originalContactId,         // MongoDB _id as originalContactId
      firstName,
      lastName,
      phone,
      email,
      subject,
      message,
      action: 'deleted',
      removedAt: new Date(),
    });

    // Save the history record
    await historyRecord.save();

    return res.status(201).json({
      success: true,
      message: 'Contact archived successfully',
      data: historyRecord,
    });
  } catch (err) {
    console.error('Error archiving contact:', err);
    return res.status(500).json({ success: false, error: 'Failed to archive contact' });
  }
};





// Permanently delete a contact and move it to the ContactHistory collection
// Permanently delete a contact and move it to the ContactHistory collection
// Permanently delete a contact and move it to the ContactHistory collection
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the contact to delete
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }

    // 2. Archive the contact to ContactHistory first
    const archiveRes = await createContactHistory({
      body: {
        contactId: contact.contactId,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
        action: 'deleted', // Archive action as 'deleted'
        removedAt: new Date(),
        originalContactId: contact._id, // MongoDB ID (original contact ID)
      },
    }, res);

    // Check if archive was successful, then proceed with deletion
    if (archiveRes.status !== 201) {
      return res.status(500).json({ success: false, error: 'Failed to archive contact' });
    }

    // 3. Delete the contact from the main collection after successful archiving
    await Contact.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Contact archived and deleted successfully' });
  } catch (err) {
    console.error('Error deleting contact:', err);
    res.status(500).json({ success: false, error: 'Failed to delete contact' });
  }
};
