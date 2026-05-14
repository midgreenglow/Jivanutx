const { supabase } = require('../_lib/supabase');
const { verifyToken } = require('../_lib/auth');

const SUPABASE_URL = process.env.SUPABASE_URL;

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const claims = verifyToken(req);
  if (!claims) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: documents, error } = await supabase
    .from('documents')
    .select('id, title, filename, original_name, doc_type, description, file_mime, uploaded_at')
    .eq('user_id', claims.id)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Documents fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }

  const docsWithUrls = (documents || []).map((doc) => ({
    ...doc,
    url: `${SUPABASE_URL}/storage/v1/object/public/documents/${claims.id}/${doc.filename}`,
  }));

  return res.status(200).json({ documents: docsWithUrls });
};
