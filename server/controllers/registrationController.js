const { supabase } = require('../config/supabase');

const approveRegistration = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: reg, error: fetchErr } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !reg) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const { error: updateErr } = await supabase
      .from('registrations')
      .update({
        status: 'approved',
        approved_at: new Date()
      })
      .eq('id', id);

    if (updateErr) throw updateErr;

    res.json({ message: 'Registration approved successfully' });
  } catch (error) {
    console.error('Error approving registration:', error);
    res.status(500).json({ error: 'Failed to approve registration' });
  }
};

const getPendingRegistrations = async (req, res) => {
  try {
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('status', 'pending');
      
    if (error) throw error;
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
