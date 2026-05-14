const { supabase } = require('./_lib/supabase');
const { verifyToken } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const claims = verifyToken(req);
  if (!claims) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, phone, name, dob, blood_group, created_at')
    .eq('id', claims.id)
    .maybeSingle();

  if (error) {
    console.error('Me DB error:', error);
    return res.status(500).json({ error: 'Database error' });
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json({ user });
};
