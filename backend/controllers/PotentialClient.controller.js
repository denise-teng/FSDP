import PotentialClient from '../models/PotentialClient.model.js';

export const getPotentialClients = async (req, res) => {
  try {
    const clients = await PotentialClient.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch potential clients' });
  }
};

export const addPotentialClient = async (req, res) => {
  try {
    const { contactId } = req.body;

    if (!contactId) {
      return res.status(400).json({ error: 'Missing contactId' });
    }

    const exists = await PotentialClient.findOne({ contactId });
    if (exists) return res.status(409).json({ error: 'Client already exists' });

    const client = new PotentialClient(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add potential client' });
  }
};


export const deletePotentialClient = async (req, res) => {
  try {
    await PotentialClient.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete client' });
  }
};

export const deleteByContactId = async (req, res) => {
  try {
    const { contactId } = req.params;
    const deleted = await PotentialClient.findOneAndDelete({ contactId });

    if (!deleted) {
      return res.status(404).json({ error: 'Potential client not found' });
    }

    res.status(200).json({ message: 'Potential client deleted by contactId' });
  } catch (err) {
    console.error('Error deleting by contactId:', err);
    res.status(500).json({ error: 'Failed to delete potential client by contactId' });
  }
};

