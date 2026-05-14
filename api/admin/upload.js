const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const { supabase } = require('../_lib/supabase');

const SUPABASE_URL = process.env.SUPABASE_URL;
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

// Disable Vercel's built-in body parser so formidable can handle the stream
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify admin secret
  const adminSecret = req.headers['x-admin-secret'];
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden: invalid admin secret' });
  }

  // Parse multipart form with formidable v2
  const form = new formidable.IncomingForm({ maxFileSize: MAX_FILE_SIZE });

  let fields, files;
  try {
    [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, f, fi) => {
        if (err) reject(err);
        else resolve([f, fi]);
      });
    });
  } catch (err) {
    console.error('Admin form parse error:', err);
    return res.status(400).json({ error: 'Failed to parse upload: ' + err.message });
  }

  // formidable v2 — files.file is a single object (not an array)
  const file = Array.isArray(files.file) ? files.file[0] : files.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded (field name must be "file")' });
  }

  // Extract fields
  const email = (Array.isArray(fields.email) ? fields.email[0] : fields.email) || null;
  const phone = (Array.isArray(fields.phone) ? fields.phone[0] : fields.phone) || null;
  const title = (Array.isArray(fields.title) ? fields.title[0] : fields.title) || file.originalFilename || 'report';

  if (!email && !phone) {
    return res.status(400).json({ error: 'email or phone is required to identify the user' });
  }

  // Find or create user
  let user = null;

  if (email) {
    const { data } = await supabase
      .from('users')
      .select('id, email, phone')
      .eq('email', email)
      .maybeSingle();
    user = data;
  }

  if (!user && phone) {
    const { data } = await supabase
      .from('users')
      .select('id, email, phone')
      .eq('phone', phone)
      .maybeSingle();
    user = data;
  }

  if (!user) {
    // Create user account (no password — OTP only)
    const insertPayload = {};
    if (email) insertPayload.email = email;
    if (phone) insertPayload.phone = phone;

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(insertPayload)
      .select('id, email, phone')
      .single();

    if (createError) {
      console.error('Admin user creation error:', createError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    user = newUser;
  }

  const originalName = file.originalFilename || 'report';
  const ext = path.extname(originalName) || '';
  const safeName = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
  const storagePath = `${user.id}/${safeName}`;
  const mimetype = file.mimetype || 'application/octet-stream';

  // Read file buffer
  let buffer;
  try {
    buffer = fs.readFileSync(file.filepath);
  } catch (err) {
    console.error('Admin file read error:', err);
    return res.status(500).json({ error: 'Failed to read uploaded file' });
  }

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, buffer, {
      contentType: mimetype,
      upsert: false,
    });

  if (uploadError) {
    console.error('Admin storage upload error:', uploadError);
    return res.status(500).json({ error: 'Failed to upload file to storage' });
  }

  // Insert record into reports table
  const { data: report, error: dbError } = await supabase
    .from('reports')
    .insert({
      user_id: user.id,
      title,
      filename: safeName,
    })
    .select('id, user_id, title, filename, uploaded_at')
    .single();

  if (dbError) {
    console.error('Admin DB insert error:', dbError);
    // Attempt storage cleanup
    await supabase.storage.from('documents').remove([storagePath]);
    return res.status(500).json({ error: 'Failed to save report record' });
  }

  return res.status(201).json({
    report: {
      ...report,
      url: `${SUPABASE_URL}/storage/v1/object/public/documents/${storagePath}`,
    },
    user: { id: user.id, email: user.email, phone: user.phone },
  });
};
