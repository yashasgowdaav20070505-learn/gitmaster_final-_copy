import React, { useState, useRef, useEffect } from 'react';
import { Lesson, UserProgress } from '../types';
import { MODULES } from '../data/lessons';
import { AppRouteTab } from './LandingHub';
import { BrainCircuit, Send, X, Minimize2, MessageSquare } from 'lucide-react';

interface GlobalFloatingChatProps {
  activeTab: AppRouteTab;
  activeLesson: Lesson | null;
  progress: UserProgress;
  onNavigate: (tab: AppRouteTab) => void;
}

interface FloatingMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

function getScreenContextMeta(
  activeTab: AppRouteTab,
  activeLesson: Lesson | null
): {
  badgeLabel: string;
  repoSummary: string;
  quickPrompts: string[];
} {
  if (activeLesson) {
    return {
      badgeLabel: activeLesson.title,
      repoSummary: `Active lesson: "${activeLesson.title}" (${activeLesson.moduleId}). Goal: ${activeLesson.description}`,
      quickPrompts: [
        `Explain ${activeLesson.title} simply`,
        'Give me a terminal hint',
        'How do I undo a mistake?',
      ],
    };
  }

  switch (activeTab) {
    case 'sandbox':
      return {
        badgeLabel: 'Sandbox Coach',
        repoSummary:
          'User is in the open Git Sandbox Arena experimenting with terminal commands and the live repository visualizer.',
        quickPrompts: [
          'How do I create a pull request on GitHub?',
          'Difference between git pull and git fetch?',
          'How do I undo my last commit?',
        ],
      };
    case 'daily-test':
      return {
        badgeLabel: 'Daily Test Coach',
        repoSummary:
          'User is on the Daily Test screen. Provide clear conceptual help without spoiling active test answers.',
        quickPrompts: [
          'Difference between git add and commit?',
          'How do branches isolate work?',
          'What does git restore do?',
        ],
      };
    case 'roadmap':
      return {
        badgeLabel: 'Roadmap Guide',
        repoSummary: 'User is exploring the 8-module GitMaster learning roadmap.',
        quickPrompts: [
          'How do pull requests work?',
          'What is a Git branch?',
          'How does git stash help?',
        ],
      };
    case 'cheatsheet':
      return {
        badgeLabel: 'Command Reference',
        repoSummary: 'User is browsing the Git Command Cheatsheet.',
        quickPrompts: [
          'Explain git restore vs stash',
          'Difference between git pull and fetch',
          'How do I resolve a merge conflict?',
        ],
      };
    case 'profile':
      return {
        badgeLabel: 'Progress & Trophies',
        repoSummary:
          'User is viewing their Profile, Streak Milestones, Trophy Cabinet, and Certificate progress.',
        quickPrompts: [
          'How do I unlock the Certificate?',
          'How do 3, 7, 10-day streaks work?',
          'How do I undo my last commit?',
        ],
      };
    default:
      return {
        badgeLabel: 'Home Guide',
        repoSummary: 'User is on the GitMaster Home Hub.',
        quickPrompts: [
          'What is Git in simple words?',
          'How do I create a pull request on GitHub?',
          'Difference between git pull and git fetch?',
        ],
      };
  }
}

export default function GlobalFloatingChat({
  activeTab,
  activeLesson,
  progress,
  onNavigate,
}: GlobalFloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<FloatingMessage[]>([
    {
      role: 'assistant',
      content:
        progress.completedLessons.length === 0
          ? "Hi! I'm **Turing**, your Git & GitHub tutor. Ask me any specific question (commits, branches, pull requests, undoing edits) or tap a prompt below."
          : `Welcome back! You've finished **${progress.completedLessons.length}/${MODULES.reduce((acc, m) => acc + m.lessons.length, 0)}** lessons. Ask me any Git or GitHub question!`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const contextMeta = getScreenContextMeta(activeTab, activeLesson);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (overrideText?: string) => {
    const userMessage = (overrideText !== undefined ? overrideText : inputValue).trim();
    if (!userMessage || loading) return;

    const now = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: FloatingMessage = {
      role: 'user',
      content: userMessage,
      timestamp: now,
    };

    const updatedMessages = [...messages, userMsg];

    setInputValue('');
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: updatedMessages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            activeTab,
            activeLessonTitle: activeLesson?.title ?? null,
            completedLessonsCount: progress.completedLessons.length,
            repoSummary: contextMeta.repoSummary,
          },
        }),
      });

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload.error || `Server error (${response.status})`);
      }

      const data = await response.json();
      const replyText: string =
        data.reply || data.response || data.text || '';

      if (!replyText.trim()) {
        throw new Error('Received an empty response from Turing. Please try again.');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err?.message ||
            'Network error while reaching Turing. Please check your connection and try again.',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 flex flex-col items-end gap-3 print:hidden">
      {/* Expandable Popover Chat Window */}
      {isOpen && (
        <div
          className="w-[340px] sm:w-[380px] max-w-[calc(100vw-2rem)] h-[460px] max-h-[calc(100vh-8rem)] bg-[#FAF7F0] border-2 border-[#111111] shadow-[6px_6px_0px_#111111] rounded-xl flex flex-col overflow-hidden"
          role="dialog"
          aria-label="Ask Turing Global AI Assistant"
        >
          {/* Ink Black Header Bar */}
          <div className="bg-[#111111] text-[#F3EEE3] px-4 py-3 flex items-center justify-between border-b-2 border-[#111111]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-7 h-7 rounded-md bg-[#D9541E] text-[#FAF7F0] border border-[#F3EEE3]/30 flex items-center justify-center shrink-0">
                <BrainCircuit className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="font-mono text-xs font-extrabold tracking-wide truncate">
                  Turing &middot; {contextMeta.badgeLabel}
                </div>
                <div className="font-mono text-[10px] text-[#F3EEE3]/70 truncate">
                  Git &amp; GitHub Tutor
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#F3EEE3]/80 hover:text-[#FAF7F0] hover:bg-[#FAF7F0]/10 rounded cursor-pointer"
                aria-label="Minimize Turing chat"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#F3EEE3]/80 hover:text-[#FAF7F0] hover:bg-[#FAF7F0]/10 rounded cursor-pointer"
                aria-label="Close Turing chat"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Message History */}
          <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3 bg-[#FAF7F0]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[90%] ${
                  msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div
                  className={`px-3 py-2.5 rounded-lg text-xs leading-relaxed whitespace-pre-wrap break-words border-2 border-[#111111] ${
                    msg.role === 'user'
                      ? 'bg-[#111111] text-[#F3EEE3]'
                      : 'bg-[#F3EEE3] text-[#111111]'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="font-mono text-[9px] text-[#524E48] mt-1 px-1 tabular-nums">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div className="self-start bg-[#E6DFD1] border-2 border-[#111111] px-3 py-2 rounded-lg font-mono text-[11px] text-[#111111]">
                Turing is thinking...
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Context-Aware Quick Prompt Chips */}
          <div className="px-3 py-2 bg-[#E6DFD1] border-t-2 border-[#111111] flex flex-wrap gap-1.5">
            {contextMeta.quickPrompts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                disabled={loading}
                className="px-2.5 py-1 bg-[#FAF7F0] hover:bg-[#D9541E] hover:text-[#FAF7F0] text-[#111111] border border-[#111111] rounded text-[10px] font-semibold cursor-pointer transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-2.5 bg-[#FAF7F0] border-t-2 border-[#111111] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about Git or GitHub..."
              className="editorial-input flex-1 px-3 py-2 text-xs font-medium"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="editorial-btn-primary px-3 py-2 flex items-center justify-center cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {activeTab !== 'sandbox' && (
            <div className="px-3 py-1.5 bg-[#E6DFD1] border-t border-[#111111]/20 flex items-center justify-between text-[10px] font-mono text-[#524E48]">
              <span>Want to test commands?</span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('sandbox');
                }}
                className="text-[#D9541E] font-bold hover:underline cursor-pointer"
              >
                Open Sandbox &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Compact Floating Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#D9541E] hover:bg-[#BF4615] text-[#FAF7F0] border-2 border-[#111111] shadow-[4px_4px_0px_#111111] font-mono text-xs font-extrabold cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0.5 whitespace-nowrap"
        aria-expanded={isOpen}
        aria-label="Ask Turing AI Assistant"
      >
        {isOpen ? (
          <>
            <X className="w-4 h-4" />
            <span>Close Turing</span>
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4" />
            <span>Ask Turing</span>
          </>
        )}
      </button>
    </div>
  );
}
