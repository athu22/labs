const { db } = require('../config/firebase');

const approveRegistration = async (req, res) => {
  const { id } = req.params;
  try {
    const regRef = db.collection('registrations').doc(id);
    const reg = await regRef.get();

    if (!reg.exists) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    await regRef.update({
      status: 'approved',
      approvedAt: new Date(),
    });

    res.json({ message: 'Registration approved successfully' });
  } catch (error) {
    console.error('Error approving registration:', error);
    res.status(500).json({ error: 'Failed to approve registration' });
  }
};

const getPendingRegistrations = async (req, res) => {
  try {
    const snapshot = await db.collection('registrations').where('status', '==', 'pending').get();
    const registrations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

module.exports = {
  approveRegistration,
  getPendingRegistrations,
};
