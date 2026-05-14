import { useEffect, useRef, useState } from 'react';
import './PatientChatBot.css';

const TOKEN_KEY = 'jivanu_token';

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` };
}

// Minimal markdown renderer: bold, italic, bullet lists, line breaks
function renderMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let key = 0;

  function flushList() {
    if (listItems.length) {
      elements.push(<ul key={key++}>{listItems}</ul>);
      listItems = [];
    }
  }

  function inlineFormat(str) {
    // Bold **text** and *italic*
    const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
      return part;
    });
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      listItems.push(<li key={key++}>{inlineFormat(trimmed.slice(2))}</li>);
    } else {
      flushList();
      if (trimmed === '') {
        elements.push(<br key={key++} />);
      } else {
        elements.push(<p key={key++}>{inlineFormat(trimmed)}</p>);
      }
    }
  }
  flushList();
  return elements;
}

export default function PatientChatBot() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem(TOKEN_KEY));
    const onStorage = () => setIsLoggedIn(!!localStorage.getItem(TOKEN_KEY));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (isOpen && !historyLoaded && isLoggedIn) {
      loadHistory();
    }
  }, [isOpen, isLoggedIn]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function loadHistory() {
    try {
      const res = await fetch('/api/chat/history', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setHistoryLoaded(true);
      }
    } catch {
      // silently fail
    }
  }

  async function sendMessage(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setError('');
    setMessages((prev) => [...prev, { role: 'user', content: text, id: Date.now() }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        return;
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, id: Date.now() + 1 }]);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function clearHistory() {
    try {
      await fetch('/api/chat/history', { method: 'DELETE', headers: authHeaders() });
      setMessages([]);
    } catch {
      // silently fail
    }
  }

  if (!isLoggedIn) return null;

  const SUGGESTIONS = [
    'Summarise my latest blood report',
    'Are any of my values out of normal range?',
    'What does my haemoglobin level mean?',
    'Show me all my documents'
  ];

  return (
    <>
      {/* Floating toggle button */}
      <button
        className={`chatbot-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Open health assistant"
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
        {!isOpen && <span className="fab-label">Health AI</span>}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">J</div>
              <div>
                <div className="chatbot-title">Jivanu Health AI</div>
                <div className="chatbot-subtitle">Ask me about your reports</div>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button className="header-action-btn" onClick={clearHistory} title="Clear history">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              </button>
              <button className="header-action-btn" onClick={() => setIsOpen(false)} title="Close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.length === 0 && !loading && (
              <div className="chatbot-welcome">
                <div className="welcome-icon">🩺</div>
                <p>Hi! I'm your personal health assistant. Ask me anything about your medical reports or documents.</p>
                <div className="suggestion-chips">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="suggestion-chip" onClick={() => { setInput(s); inputRef.current?.focus(); }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id || msg.created_at} className={`chat-msg ${msg.role}`}>
                {msg.role === 'assistant' && <div className="msg-avatar">J</div>}
                <div className="msg-bubble">
                  {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-msg assistant">
                <div className="msg-avatar">J</div>
                <div className="msg-bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {error && (
              <div className="chatbot-error">{error}</div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form className="chatbot-input-row" onSubmit={sendMessage}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your reports…"
              disabled={loading}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            />
            <button type="submit" disabled={loading || !input.trim()} className="send-btn" aria-label="Send">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
