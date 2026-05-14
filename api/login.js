const bcrypt = require('bcryptjs');
const { supabase } = require('./_lib/supabase');
const { signToken } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, phone, name, dob, blood_group, created_at, password_hash')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('Login DB error:', error);
    return res.status(500).json({ error: 'Database error' });
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (!user.password_hash) {
    return res.status(401).json({ error: 'Account uses OTP login — no password set' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { password_hash: _removed, ...safeUser } = user;
  const token = signToken(safeUser);
  return res.status(200).json({ token, user: safeUser });
};
