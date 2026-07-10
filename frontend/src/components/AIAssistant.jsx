import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { FiMessageSquare, FiX, FiSend, FiCpu, FiPlus } from 'react-icons/fi';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am your FlowWise HR AI assistant. How can I help you optimize your work requests, check leave calendars, or analyze approval rules today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const quickChips = [
    "What is my leave balance?",
    "Check pending request status",
    "What is the expense approval policy?",
    "Explain approval SLAs",
  ];

  // Auto scroll to chat bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const prompt = textToSend || input;
    if (!prompt.trim()) return;

    // Append user message
    const userMsg = { id: Date.now(), sender: 'user', text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/assistant', { message: prompt });
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: 'ai', text: data.reply },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: '⚠️ Sorry, I encountered a connection issue. Please verify your internet connection or check backend config.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* Floating Chat Window */}
      {isOpen && (
        <div className="w-80 md:w-96 h-[480px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-glass overflow-hidden flex flex-col mb-4 transform transition-all duration-300 translate-y-0 opacity-100">
          
          {/* Chat Window Header */}
          <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shadow-glass">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <FiCpu size={18} className="animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-none">FlowWise Smart AI</h4>
                <span className="text-[10px] text-indigo-200 block mt-0.5 leading-none">HR Assistant Online</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Chat Timeline Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-darkbg-800">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`
                    max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm
                    ${msg.sender === 'user' 
                      ? 'bg-indigo-650 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 rounded-tl-none'
                    }
                  `}
                >
                  <p className="whitespace-pre-line font-medium">{msg.text}</p>
                </div>
              </div>
            ))}

            {/* Glowing AI Loading dots */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800/80 rounded-2xl rounded-tl-none p-3 flex space-x-1.5 items-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Chips Suggestions */}
          {messages.length === 1 && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto flex space-x-2 shrink-0 no-scrollbar">
              {quickChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-[10px] text-slate-650 dark:text-slate-350 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-250 dark:border-slate-750 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Message Input Box */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex space-x-2"
          >
            <input
              type="text"
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-100 dark:bg-slate-800/85 border-0 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-glass cursor-pointer transition-colors"
              disabled={loading}
            >
              <FiSend size={14} />
            </button>
          </form>

        </div>
      )}

      {/* Glowing AI Floating Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-glass glow-indigo cursor-pointer transition-transform duration-200 active:scale-95"
        title="Open AI Assistant"
      >
        <FiMessageSquare size={22} className={`${isOpen ? 'hidden' : 'block'}`} />
        <FiX size={22} className={`${isOpen ? 'block' : 'hidden'}`} />
      </button>

    </div>
  );
};

export default AIAssistant;
