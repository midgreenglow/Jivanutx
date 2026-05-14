const { supabase } = require('../_lib/supabase');
const { verifyToken } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const claims = verifyToken(req);
  if (!claims) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Document ID is required' });
  }

  // Fetch doc to verify ownership and get filename
  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('id, user_id, filename')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) {
    console.error('Document fetch error:', fetchError);
    return res.status(500).json({ error: 'Database error' });
  }

  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  if (doc.user_id !== claims.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const storagePath = `${claims.id}/${doc.filename}`;

  // Delete from Supabase Storage
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([storagePath]);

  if (storageError) {
    console.error('Storage delete error:', storageError);
    // Continue to delete DB record even if storage fails
  }

  // Delete from DB
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (dbError) {
    console.error('DB delete error:', dbError);
    return res.status(500).json({ error: 'Failed to delete document record' });
  }

  return res.status(200).json({ message: 'Document deleted successfully' });
};
