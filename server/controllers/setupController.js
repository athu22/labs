const { supabase } = require('../config/supabase');

const createSuperAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // 1. Check if any super-admin already exists
    const { data: existingAdmin, error: adminErr } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'super-admin')
      .limit(1);

    if (existingAdmin && existingAdmin.length > 0) {
      return res.status(400).json({ error: 'Super Admin already exists. Only one is allowed for initial setup.' });
    }

    // 2. Create user in Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authErr) throw authErr;

    // 3. Save role in DB
    const { error: dbErr } = await supabase
      .from('users')
      .insert([{
        auth_id: authData.user.id,
        email,
        role: 'super-admin',
        is_initial_setup: true
      }]);
      
    if (dbErr) throw dbErr;

    res.json({ 
      message: 'Super Admin created successfully',
      uid: authData.user.id 
    });
  } catch (error) {
    console.error('Error creating super admin:', error);
    res.status(500).json({ error: error.message || 'Failed to create super admin' });
  }
};

module.exports = { createSuperAdmin };
