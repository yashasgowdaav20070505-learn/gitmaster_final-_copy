import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Lesson } from '../types';
import { MessageSquare, Send, User, BrainCircuit } from 'lucide-react';

interface AITutorProps {
  currentLesson?: Lesson;
}

export default function AITutor({ currentLesson }: AITutorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Hi there! I'm Turing, your Git & GitHub Mentor.\n\nI can explain any command using plain analogies, walk you through concepts, or help you with challenge hints. Ask me anything about Git!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    setInput('');
    const userMsg: ChatMessage = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          history: messages.slice(-10),
          lessonContext: currentLesson
            ? `We are currently on the lesson "${currentLesson.title}" inside module "${currentLesson.moduleId}". The lesson goal is: ${currentLesson.description}.`
            : 'We are in open Git Sandbox mode exploring commands.',
        }),
      });

      const data = await response.json();

      const coachMsg: ChatMessage = {
        sender: 'ai',
        text:
          data.text ||
          "I'm having a small connection issue, but let's keep exploring Git!",
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Oops, I had a hitch talking to my server. Make sure the server is running and try again!',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="editorial-card flex flex-col h-[460px] overflow-hidden"
      id="ai-tutor"
    >
      {/* Header */}
      <div className="bg-[#E6DFD1] px-4 py-3 border-b-2 border-[#111111] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#D9541E] border-2 border-[#111111] rounded-lg text-[#FAF7F0]">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-xs text-[#111111] uppercase tracking-wider font-mono">
              Mentor Turing
            </div>
            <div className="text-[10px] text-[#524E48] font-mono">
              {currentLesson ? 'Lesson Assistant' : 'Sandbox Assistant'}
            </div>
          </div>
        </div>
      </div>

      {/* Message Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#FAF7F0]">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 max-w-[88%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg border-2 border-[#111111] flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-[#D9541E] text-[#FAF7F0]'
                  : 'bg-[#E6DFD1] text-[#111111]'
              }`}
            >
              {msg.sender === 'user' ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5" />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div
                className={`p-3 rounded-lg text-xs leading-relaxed whitespace-pre-line border-2 border-[#111111] ${
                  msg.sender === 'user'
                    ? 'bg-[#111111] text-[#F3EEE3]'
                    : 'bg-[#F3EEE3] text-[#111111]'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-[#524E48] font-mono self-end px-1 tabular-nums">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 mr-auto max-w-[80%]">
            <div className="bg-[#E6DFD1] p-3 rounded-lg text-xs text-[#111111] border-2 border-[#111111] font-mono">
              Turing is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSend}
        className="bg-[#E6DFD1] p-3 border-t-2 border-[#111111] flex gap-2"
      >
        <input
          type="text"
          className="editorial-input flex-1 px-3 py-2 text-xs font-medium"
          placeholder="Ask Turing (e.g. 'Commit vs staging')"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="editorial-btn-primary px-3 py-2 flex items-center justify-center cursor-pointer"
          disabled={loading}
          aria-label="Send question"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
