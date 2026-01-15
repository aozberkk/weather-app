import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatPanel.css';

function ChatPanel({ messages, input, setInput, isLoading, onSubmit, onCityDetected }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extract city from assistant messages (simple heuristic)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      // Try to extract city name from message (very basic implementation)
      // In a real scenario, you'd want the backend to send structured data
      const cityMatch = lastMessage.content.match(/İstanbul|Ankara|İzmir|Bursa|Antalya|Adana|Konya|Gaziantep|Şanlıurfa|Kocaeli|Mersin|Diyarbakır|Hatay|Manisa|Kayseri/);
      if (cityMatch) {
        onCityDetected(cityMatch[0]);
      }
    }
  }, [messages, onCityDetected]);

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h1>🌤️ Hava Durumu Asistanı</h1>
        <p>Şehir adını yazın, hava durumunu öğrenin!</p>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>Merhaba! Hangi şehrin hava durumunu öğrenmek istersiniz?</p>
            <p className="hint">Örnek: "İstanbul'da hava nasıl?" veya "Ankara hava durumu"</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.role === 'user' ? (
              <div className="message-content user-content">
                {msg.content}
              </div>
            ) : (
              <div className="message-content assistant-content">
                <ReactMarkdown
                  components={{
                    img: ({ node, ...props }) => (
                      <img {...props} style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '10px' }} />
                    ),
                    p: ({ node, ...props }) => (
                      <p {...props} style={{ marginBottom: '10px' }} />
                    )
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="message-content assistant-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={onSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Şehir adı yazın..."
          disabled={isLoading}
          className="message-input"
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="send-button"
        >
          Gönder
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;

