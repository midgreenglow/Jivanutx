const { supabase } = require('../_lib/supabase');
const { verifyToken } = require('../_lib/auth');

const SUPABASE_URL = process.env.SUPABASE_URL;

module.exports = async function handler(req, res) {
  const claims = verifyToken(req);
  if (!claims) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const { data: reports, error } = await supabase
      .from('reports')
      .select('id, title, filename, uploaded_at')
      .eq('user_id', claims.id)
      .order('uploaded_at', { ascending: false });

    if (error) return res.status(500).json({ error: 'Failed to fetch reports' });

    return res.status(200).json({
      reports: (reports || []).map((r) => ({
        ...r,
        doc_type: 'blood_report',
        url: `${SUPABASE_URL}/storage/v1/object/public/documents/${claims.id}/${r.filename}`,
      })),
    });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Report ID required' });

    const { data: report } = await supabase
      .from('reports')
      .select('id, user_id, filename')
      .eq('id', id)
      .maybeSingle();

    if (!report) return res.status(404).json({ error: 'Report not found' });
    if (report.user_id !== claims.id) return res.status(403).json({ error: 'Forbidden' });

    await supabase.storage.from('documents').remove([`${claims.id}/${report.filename}`]);

    const { error: dbError } = await supabase.from('reports').delete().eq('id', id);
    if (dbError) return res.status(500).json({ error: 'Failed to delete report' });

    return res.status(200).json({ message: 'Report deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
