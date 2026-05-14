const { supabase } = require('./_lib/supabase');
const { verifyToken } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  const claims = verifyToken(req);
  if (!claims) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, phone, name, dob, blood_group, created_at')
      .eq('id', claims.id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ user });
  }

  if (req.method === 'PUT') {
    const { name, dob, blood_group, phone } = req.body || {};
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (dob !== undefined) updates.dob = dob;
    if (blood_group !== undefined) updates.blood_group = blood_group;
    if (phone !== undefined) updates.phone = phone;

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ error: 'No fields to update' });

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', claims.id)
      .select('id, email, phone, name, dob, blood_group, created_at')
      .single();

    if (error) return res.status(500).json({ error: 'Failed to update profile' });
    return res.status(200).json({ user });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
