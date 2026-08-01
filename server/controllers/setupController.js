const { auth, db } = require('../config/firebase');

const createSuperAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // 1. Check if any super-admin already exists
    const superAdminQuery = await db.collection('users').where('role', '==', 'super-admin').get();
    if (!superAdminQuery.empty) {
      return res.status(400).json({ error: 'Super Admin already exists. Only one is allowed for initial setup.' });
    }

    // 2. Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: true,
      displayName: 'Super Admin'
    });

    // 3. Save role in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      role: 'super-admin',
      createdAt: new Date(),
      isInitialSetup: true
    });

    res.json({ 
      message: 'Super Admin created successfully',
      uid: userRecord.uid 
    });
  } catch (error) {
    console.error('Error creating super admin:', error);
    res.status(500).json({ error: error.message || 'Failed to create super admin' });
  }
};

module.exports = { createSuperAdmin };
