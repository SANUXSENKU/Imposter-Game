import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { ChatMessage } from '../shared/types.ts';
import { Avatar } from './Avatar.tsx';
import { sounds } from '../services/sound.ts';

interface ChatPanelProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (text: string) => void;
  isCompact?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentUserId,
  onSendMessage,
  isCompact = false
}) => {
  const [inputText, setInputText] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;
    sounds.playClick();
    onSendMessage(clean);
    setInputText('');
  };

  return (
    <div className={`flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all ${isCompact ? 'h-72' : 'h-96'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/60 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Room Intercom
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {messages.length} messages
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="md:hidden text-slate-400 hover:text-white"
        >
          {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 italic text-center p-4">
                No discussion yet. Messages sent here are visible to all players in the room.
              </div>
            ) : (
              messages.map(msg => {
                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="py-1 px-2.5 rounded-lg bg-purple-950/40 border border-purple-800/30 text-purple-300 text-[11px] text-center font-mono">
                      {msg.text}
                    </div>
                  );
                }

                const isMe = msg.senderId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Avatar avatarId={msg.senderAvatar} size="sm" />
                    <div className={`max-w-[78%] rounded-xl px-3 py-2 ${
                      isMe
                        ? 'bg-purple-600 text-white rounded-tr-none'
                        : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none'
                    }`}>
                      <div className="flex items-center justify-between gap-3 mb-0.5 text-[10px] text-slate-400 font-mono">
                        <span className={isMe ? 'text-purple-200 font-semibold' : 'text-slate-300 font-semibold'}>
                          {msg.senderName}
                        </span>
                        <span className="opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="break-words leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-2 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Type suspicion or message..."
              maxLength={200}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white rounded-xl transition-all active:scale-95 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
