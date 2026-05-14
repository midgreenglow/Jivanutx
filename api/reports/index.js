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

  const { data: reports, error } = await supabase
    .from('reports')
    .select('id, title, filename, uploaded_at')
    .eq('user_id', claims.id)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Reports fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }

  const reportsWithUrls = (reports || []).map((report) => ({
    ...report,
    doc_type: 'blood_report',
    url: `${SUPABASE_URL}/storage/v1/object/public/documents/${claims.id}/${report.filename}`,
  }));

  return res.status(200).json({ reports: reportsWithUrls });
};
