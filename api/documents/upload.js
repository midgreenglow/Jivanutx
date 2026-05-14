const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const { supabase } = require('../_lib/supabase');
const { verifyToken } = require('../_lib/auth');

const SUPABASE_URL = process.env.SUPABASE_URL;
const ALLOWED_MIMES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
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

  const claims = verifyToken(req);
  if (!claims) {
    return res.status(401).json({ error: 'Unauthorized' });
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
    console.error('Form parse error:', err);
    return res.status(400).json({ error: 'Failed to parse upload: ' + err.message });
  }

  // formidable v2 — files.file is a single object (not an array)
  const file = Array.isArray(files.file) ? files.file[0] : files.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded (field name must be "file")' });
  }

  const mimetype = file.mimetype;
  if (!ALLOWED_MIMES.includes(mimetype)) {
    return res.status(415).json({
      error: `Unsupported file type: ${mimetype}. Allowed: PDF, JPEG, PNG, WebP, GIF`,
    });
  }

  const originalName = file.originalFilename || 'upload';
  const ext = path.extname(originalName) || '';
  const safeName = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
  const storagePath = `${claims.id}/${safeName}`;

  // Read file buffer
  let buffer;
  try {
    buffer = fs.readFileSync(file.filepath);
  } catch (err) {
    console.error('File read error:', err);
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
    console.error('Storage upload error:', uploadError);
    return res.status(500).json({ error: 'Failed to upload file to storage' });
  }

  // Parse extra metadata from form fields
  const title = (Array.isArray(fields.title) ? fields.title[0] : fields.title) || originalName;
  const doc_type = (Array.isArray(fields.doc_type) ? fields.doc_type[0] : fields.doc_type) || 'other';
  const description = (Array.isArray(fields.description) ? fields.description[0] : fields.description) || null;

  // Insert record into DB
  const { data: doc, error: dbError } = await supabase
    .from('documents')
    .insert({
      user_id: claims.id,
      title,
      filename: safeName,
      original_name: originalName,
      doc_type,
      description,
      file_mime: mimetype,
    })
    .select('id, title, filename, original_name, doc_type, description, file_mime, uploaded_at')
    .single();

  if (dbError) {
    console.error('DB insert error:', dbError);
    // Attempt storage cleanup
    await supabase.storage.from('documents').remove([storagePath]);
    return res.status(500).json({ error: 'Failed to save document record' });
  }

  return res.status(201).json({
    document: {
      ...doc,
      url: `${SUPABASE_URL}/storage/v1/object/public/documents/${storagePath}`,
    },
  });
};
