"use client";

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { messages, sendMessage, status } = useChat();
  const messagesEndRef = useRef(null);

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const text = inputValue;
    setInputValue('');

    await sendMessage({ text });
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-white text-navy flex items-center justify-center border border-outline-var transition-all duration-300 hover:scale-105 hover:bg-[#f3ede4] cursor-pointer shadow-[0_4px_24px_rgba(10,10,10,0.15)]"
          aria-label="Open Chat"
        >
          <span className="material-symbols-outlined text-[20px]">forum</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[90vw] md:w-[380px] h-[580px] max-h-[85vh] bg-background shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-outline-var">
          {/* Header */}
          <div className="bg-navy px-5 py-4 flex justify-between items-center border-b border-gold-light/20 relative w-full h-[76px]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-gold-light text-[22px]">diamond</span>
              <div className="flex flex-col text-left">
                <span className="font-label text-[10px] tracking-[0.2em] uppercase text-white font-semibold m-0 leading-tight">Swarnika Concierge</span>
                <span className="font-body text-[9px] tracking-wider uppercase text-white/50 m-0 leading-tight">At your service</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors cursor-pointer p-1"
              aria-label="Close Chat"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 pb-2 flex flex-col gap-5 bg-background no-scrollbar">
            {messages.length === 0 && (
              <div className="text-center text-outline text-[12px] font-body flex flex-col items-center justify-center h-full opacity-60">
                <span className="material-symbols-outlined text-[32px] mb-3 text-gold">auto_awesome</span>
                <p>Welcome to The Archive.<br/>How may we assist you today?</p>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-5 py-3.5 text-sm font-body leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-navy text-white'
                      : 'bg-[#f3ede4] border border-outline-var/30 text-navy'
                  }`}
                  style={{ borderRadius: m.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0' }}
                >
                  {m.parts?.filter(p => p.type === 'text').map((p, i) => (
                    <span key={i}>{p.text}</span>
                  )) || m.content}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex w-full justify-start">
                <div className="max-w-[85%] px-5 py-3.5 bg-[#f3ede4] border border-outline-var/30 text-navy text-sm font-body" style={{ borderRadius: '12px 12px 12px 0' }}>
                  <span className="animate-pulse">· · ·</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background border-t border-outline-var/50 h-[80px] w-full flex items-center justify-center box-border">
            <form onSubmit={handleSubmit} className="flex gap-2 w-full h-full">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about our collections..."
                className="flex-1 bg-white border border-outline-var px-4 py-0 h-[48px] text-[12px] font-body text-navy placeholder:text-outline focus:outline-none focus:border-gold-light transition-colors m-0 box-border"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-navy text-gold-light w-[48px] h-[48px] flex items-center justify-center disabled:opacity-50 transition-opacity cursor-pointer m-0 border-none shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
