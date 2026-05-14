const { supabase } = require('./_lib/supabase');
const { signToken } = require('./_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { identifier, code } = req.body || {};

  if (!identifier || !code) {
    return res.status(400).json({ error: 'identifier and code are required' });
  }

  // Look up OTP record
  const { data: otpRecord, error: otpError } = await supabase
    .from('otp_store')
    .select('*')
    .eq('identifier', identifier)
    .maybeSingle();

  if (otpError) {
    console.error('OTP lookup error:', otpError);
    return res.status(500).json({ error: 'Database error' });
  }

  if (!otpRecord) {
    return res.status(400).json({ error: 'No OTP found for this identifier' });
  }

  // Check expiry
  if (new Date() > new Date(otpRecord.expires_at)) {
    // Clean up expired OTP
    await supabase.from('otp_store').delete().eq('identifier', identifier);
    return res.status(400).json({ error: 'OTP has expired' });
  }

  // Verify code
  if (otpRecord.code !== String(code)) {
    return res.status(400).json({ error: 'Invalid OTP code' });
  }

  // Delete used OTP
  await supabase.from('otp_store').delete().eq('identifier', identifier);

  // Determine if identifier is email or phone
  const isEmail = identifier.includes('@');
  const lookupField = isEmail ? 'email' : 'phone';

  // Find or create user
  let { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, phone, name, dob, blood_group, created_at')
    .eq(lookupField, identifier)
    .maybeSingle();

  if (userError) {
    console.error('User lookup error:', userError);
    return res.status(500).json({ error: 'Database error' });
  }

  if (!user) {
    // Create new user
    const insertPayload = isEmail ? { email: identifier } : { phone: identifier };
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(insertPayload)
      .select('id, email, phone, name, dob, blood_group, created_at')
      .single();

    if (createError) {
      console.error('User creation error:', createError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    user = newUser;
  }

  const token = signToken(user);
  return res.status(200).json({ token, user });
};
