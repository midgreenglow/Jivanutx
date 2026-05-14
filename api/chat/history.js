const { supabase } = require('../_lib/supabase');
const { verifyToken } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  const claims = verifyToken(req);
  if (!claims) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('user_id', claims.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Chat history fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch chat history' });
    }

    return res.status(200).json({ messages: messages || [] });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', claims.id);

    if (error) {
      console.error('Chat history clear error:', error);
      return res.status(500).json({ error: 'Failed to clear chat history' });
    }

    return res.status(200).json({ message: 'Chat history cleared' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
