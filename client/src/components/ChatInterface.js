import React, { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, FileText } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatInterface.css';

const API_URL = 'http://localhost:3000';

const ChatInterface = ({ uploadedFiles, onReset }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat/rag`, {
        message: input,
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.answer,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div>
          <h2>Chat with Your Documents</h2>
          <div className="uploaded-files-info">
            <FileText size={16} />
            <span>{uploadedFiles.length} document(s) uploaded</span>
          </div>
        </div>
        <button onClick={onReset} className="reset-btn">
          <RotateCcw size={18} />
          Upload New
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h3>👋 Welcome!</h3>
            <p>Ask me anything about your uploaded documents.</p>
            <div className="suggestions">
              <button onClick={() => setInput("Summarize the main points")}>
                Summarize the main points
              </button>
              <button onClick={() => setInput("What are the key skills mentioned?")}>
                What are the key skills mentioned?
              </button>
              <button onClick={() => setInput("Extract important dates and deadlines")}>
                Extract important dates
              </button>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              {message.role === 'assistant' ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom styling for different elements
                    h1: ({node, ...props}) => <h1 className="md-h1" {...props} />,
                    h2: ({node, ...props}) => <h2 className="md-h2" {...props} />,
                    h3: ({node, ...props}) => <h3 className="md-h3" {...props} />,
                    p: ({node, ...props}) => <p className="md-p" {...props} />,
                    ul: ({node, ...props}) => <ul className="md-ul" {...props} />,
                    ol: ({node, ...props}) => <ol className="md-ol" {...props} />,
                    li: ({node, ...props}) => <li className="md-li" {...props} />,
                    strong: ({node, ...props}) => <strong className="md-strong" {...props} />,
                    em: ({node, ...props}) => <em className="md-em" {...props} />,
                    code: ({node, inline, ...props}) => 
                      inline ? 
                        <code className="md-code-inline" {...props} /> : 
                        <code className="md-code-block" {...props} />,
                    pre: ({node, ...props}) => <pre className="md-pre" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="md-blockquote" {...props} />,
                    table: ({node, ...props}) => <table className="md-table" {...props} />,
                    th: ({node, ...props}) => <th className="md-th" {...props} />,
                    td: ({node, ...props}) => <td className="md-td" {...props} />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-content loading">
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

      <div className="chat-input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about your documents..."
          rows="1"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="send-btn"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;