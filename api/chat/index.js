const OpenAI = require('openai').default;
const { supabase } = require('../_lib/supabase');
const { verifyToken } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const claims = verifyToken(req);
  if (!claims) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return res.status(503).json({ error: 'AI service not configured (DEEPSEEK_API_KEY missing)' });
  }

  const { message } = req.body || {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  // Save user message
  const { error: saveUserMsgError } = await supabase.from('chat_messages').insert({
    user_id: claims.id,
    role: 'user',
    content: message.trim(),
  });

  if (saveUserMsgError) {
    console.error('Save user message error:', saveUserMsgError);
    return res.status(500).json({ error: 'Failed to save message' });
  }

  // Fetch chat history (last 40 messages)
  const { data: history, error: historyError } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('user_id', claims.id)
    .order('created_at', { ascending: false })
    .limit(40);

  if (historyError) {
    console.error('History fetch error:', historyError);
    return res.status(500).json({ error: 'Failed to fetch chat history' });
  }

  // Reverse to chronological order
  const chatHistory = (history || []).reverse();

  // Fetch user profile for context
  const { data: userProfile } = await supabase
    .from('users')
    .select('name, dob, blood_group, email, phone')
    .eq('id', claims.id)
    .maybeSingle();

  // Fetch user's documents for context (titles and types only)
  const { data: userDocuments } = await supabase
    .from('documents')
    .select('title, doc_type, uploaded_at')
    .eq('user_id', claims.id)
    .order('uploaded_at', { ascending: false });

  const { data: userReports } = await supabase
    .from('reports')
    .select('title, uploaded_at')
    .eq('user_id', claims.id)
    .order('uploaded_at', { ascending: false });

  // Build system prompt
  const patientInfo = userProfile
    ? `Patient Information:
- Name: ${userProfile.name || 'Not provided'}
- Date of Birth: ${userProfile.dob || 'Not provided'}
- Blood Group: ${userProfile.blood_group || 'Not provided'}
- Contact: ${userProfile.email || userProfile.phone || 'Not provided'}`
    : 'Patient information not available.';

  const docList = [
    ...(userDocuments || []).map((d) => `  - ${d.title} (${d.doc_type})`),
    ...(userReports || []).map((r) => `  - ${r.title} (blood_report)`),
  ];

  const documentsContext =
    docList.length > 0
      ? `Uploaded Documents & Reports:\n${docList.join('\n')}`
      : 'No documents or reports uploaded yet.';

  const systemPrompt = `You are Jivanu Health Assistant, a knowledgeable and empathetic AI health companion. You help users understand their health, interpret medical information, and provide general wellness guidance.

${patientInfo}

${documentsContext}

Important guidelines:
- Always recommend consulting a qualified healthcare professional for medical decisions
- Be empathetic and supportive
- Provide clear, accurate health information based on established medical knowledge
- If the user mentions symptoms that sound serious or life-threatening, urge them to seek immediate medical attention
- Do not diagnose conditions — instead, help users understand information and guide them to seek appropriate care
- When referencing their documents, note that you can see the titles but not the full content unless they paste it in the chat`;

  // Prepare messages for DeepSeek API
  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.map((m) => ({ role: m.role, content: m.content })),
  ];

  // Call DeepSeek API
  const deepseek = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
  });

  let reply;
  try {
    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      max_tokens: 1024,
    });
    reply = completion.choices[0]?.message?.content || 'I could not generate a response. Please try again.';
  } catch (err) {
    console.error('DeepSeek API error:', err);
    return res.status(502).json({ error: 'AI service error: ' + err.message });
  }

  // Save assistant reply
  const { error: saveReplyError } = await supabase.from('chat_messages').insert({
    user_id: claims.id,
    role: 'assistant',
    content: reply,
  });

  if (saveReplyError) {
    console.error('Save assistant reply error:', saveReplyError);
    // Non-fatal — still return the reply
  }

  return res.status(200).json({ reply });
};
