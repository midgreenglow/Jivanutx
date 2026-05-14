const bcrypt = require('bcryptjs');
const { supabase } = require('./_lib/supabase');
const { signToken } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, phone, password } = req.body || {};

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone is required' });
  }

  // Check for existing user by email
  if (email) {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
  }

  // Check for existing user by phone
  if (phone) {
    const { data: existingPhone } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (existingPhone) {
      return res.status(409).json({ error: 'Phone already registered' });
    }
  }

  const password_hash = await bcrypt.hash(password, 10);

  const insertPayload = { password_hash };
  if (email) insertPayload.email = email;
  if (phone) insertPayload.phone = phone;

  const { data: user, error } = await supabase
    .from('users')
    .insert(insertPayload)
    .select('id, email, phone, name, dob, blood_group, created_at')
    .single();

  if (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Failed to create account' });
  }

  const token = signToken(user);
  return res.status(201).json({ token, user });
};
