const { supabase } = require('./_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { identifier } = req.body || {};

  if (!identifier) {
    return res.status(400).json({ error: 'identifier (email or phone) is required' });
  }

  // Generate 6-digit OTP
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  // Upsert: handles both new and existing OTPs for the same identifier
  const { error } = await supabase
    .from('otp_store')
    .upsert(
      { identifier, code, expires_at, created_at: new Date().toISOString() },
      { onConflict: 'identifier' }
    );

  if (error) {
    console.error('OTP store error:', error);
    return res.status(500).json({ error: 'Failed to generate OTP' });
  }

  // In production, send via SMS/email. For dev/mock, return it directly.
  console.log(`[OTP] identifier=${identifier} code=${code} expires=${expires_at}`);

  return res.status(200).json({
    message: 'OTP sent',
    // Remove `code` in production — exposed here for dev/testing only
    code,
  });
};
