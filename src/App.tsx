/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Film, 
  Calendar, 
  Phone, 
  Star, 
  MoreHorizontal, 
  Plus, 
  Search, 
  X, 
  Paperclip, 
  Smile, 
  Mic, 
  Menu,
  ChevronDown,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  isGroup?: boolean;
  participants?: string;
  isVerified?: boolean;
}

const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    name: 'Zoho Schools of Learning',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ZS&backgroundColor=d11141',
    lastMessage: '~ Rawther sekkathi joined via invite link',
    time: '02:55 PM',
    isGroup: true,
    participants: '722 participants'
  },
  {
    id: '2',
    name: '~ RKhanna',
    avatar: 'https://i.pravatar.cc/150?u=rk',
    lastMessage: 'You: hello mam',
    time: 'Yesterday',
    isVerified: true
  },
  {
    id: '3',
    name: 'Arattai',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AR&backgroundColor=f9d71c',
    lastMessage: 'Your Arattai sign-in code: 5861909.',
    time: 'Yesterday',
    isVerified: true
  },
  {
    id: '4',
    name: '~ Ruby',
    avatar: 'https://i.pravatar.cc/150?u=ruby',
    lastMessage: 'Previous messages are currently unavailable a...',
    time: 'March 1',
    isVerified: true
  },
  {
    id: '5',
    name: '~ Miraculine',
    avatar: 'https://i.pravatar.cc/150?u=mira',
    lastMessage: 'Previous messages are currently unavailable a...',
    time: 'March 1',
    isVerified: true
  },
  {
    id: '6',
    name: '~ Charles',
    avatar: 'https://i.pravatar.cc/150?u=charles',
    lastMessage: 'Previous messages are currently unavailable a...',
    time: 'March 1',
    isVerified: true
  },
  {
    id: '7',
    name: '~ Rajendran Dandapani',
    avatar: 'https://i.pravatar.cc/150?u=raj',
    lastMessage: 'Previous messages are currently unavailable a...',
    time: 'March 1',
    isVerified: true
  },
  {
    id: '8',
    name: '~ T.Santhi Murugesan',
    avatar: 'https://i.pravatar.cc/150?u=santhi',
    lastMessage: 'Previous messages are currently unavailable a...',
    time: 'March 1',
    isVerified: true
  }
];

interface Message {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  isMe?: boolean;
  quote?: {
    sender: string;
    text: string;
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: '~ Prabagar S',
    avatar: 'https://i.pravatar.cc/150?u=prabagar',
    text: 'Mam you sent a link ok but that link doesn\'t open',
    time: '10:29 PM',
    quote: {
      sender: '~ RKhanna',
      text: 'Why??'
    }
  },
  {
    id: '2',
    sender: '~ Sri',
    avatar: 'https://i.pravatar.cc/150?u=sri',
    text: 'Mam can you check do zoho schools has alumi from this school?\nT N P M MARIMUTHU NADAR HIGHER SECONDARY SCHOOL',
    time: '10:29 PM'
  },
  {
    id: '3',
    sender: '~ Anshuman',
    avatar: 'https://i.pravatar.cc/150?u=anshuman',
    text: 'Because I am already meet in interview',
    time: '10:31 PM',
    quote: {
      sender: '~ RKhanna',
      text: 'Why??'
    }
  },
  {
    id: '4',
    sender: 'Throw Zestober',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TZ',
    text: '',
    time: '10:31 PM'
  },
  {
    id: '5',
    sender: 'I need help from them',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=IH',
    text: '',
    time: '10:31 PM'
  },
  {
    id: '6',
    sender: 'Please',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PL',
    text: '',
    time: '10:31 PM'
  }
];

export default function App() {
  const [activeChat, setActiveChat] = useState<Chat>(MOCK_CHATS[0]);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: '~ RKhanna',
      avatar: 'https://i.pravatar.cc/150?u=rk',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <div className="flex h-screen w-full bg-[#f4f7f9] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[72px] flex flex-col items-center py-4 border-r border-slate-200 bg-white">
        <div className="mb-6 p-2.5 rounded-xl bg-[#00a3ff] text-white cursor-pointer shadow-sm">
          <MessageSquare size={24} />
        </div>
        <nav className="flex flex-col gap-6 text-slate-400">
          <Film size={24} className="cursor-pointer hover:text-slate-600" />
          <Calendar size={24} className="cursor-pointer hover:text-slate-600" />
          <Phone size={24} className="cursor-pointer hover:text-slate-600" />
          <Star size={24} className="cursor-pointer hover:text-slate-600" />
        </nav>
        <div className="mt-auto flex flex-col gap-6 items-center">
          <div className="w-9 h-9 rounded-full bg-[#00a3ff] flex items-center justify-center text-white text-xs font-bold cursor-pointer">
            V
          </div>
          <Menu size={24} className="text-slate-400 cursor-pointer hover:text-slate-600" />
        </div>
      </aside>

      {/* Chat List */}
      <section className="w-[420px] min-w-[320px] flex flex-col border-r border-slate-200 bg-white">
        <header className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Chats</h1>
          <div className="flex gap-3">
            <MoreHorizontal size={20} className="text-slate-400 cursor-pointer" />
            <div className="p-1 rounded-full bg-[#00a3ff] text-white cursor-pointer">
              <Plus size={18} />
            </div>
          </div>
        </header>

        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search chats and contacts (ctrl + k)"
              className="w-full pl-9 pr-4 py-2 bg-[#f0f2f5] rounded-lg text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="px-4 mb-4 flex items-center gap-2 overflow-hidden">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
            {['Chats', 'Channels', 'Direct', 'Groups'].map((filter, i) => (
              <button 
                key={filter}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap",
                  i === 0 ? "bg-white border border-slate-200 shadow-sm" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
          <Menu size={18} className="text-slate-400 cursor-pointer" />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {MOCK_CHATS.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-50",
                activeChat.id === chat.id ? "bg-[#e1f3ff]" : "hover:bg-slate-50"
              )}
            >
              <img 
                src={chat.avatar} 
                alt={chat.name} 
                className="w-12 h-12 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-[15px] truncate">{chat.name}</span>
                    {chat.isVerified && (
                      <ShieldCheck size={14} className="text-[#00a3ff]" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{chat.time}</span>
                </div>
                <p className="text-[13px] text-slate-500 truncate italic">{chat.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-[#f0f2f5]">
        {/* Header */}
        <header className="h-16 px-4 flex items-center justify-between bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img 
              src={activeChat.avatar} 
              alt={activeChat.name} 
              className="w-10 h-10 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 className="font-bold text-[15px] leading-tight">{activeChat.name}</h2>
              <span className="text-[12px] text-slate-500">{activeChat.participants || 'Online'}</span>
            </div>
          </div>
          <div className="flex items-center gap-5 text-slate-400">
            <Search size={20} className="cursor-pointer hover:text-slate-600" />
            <MoreHorizontal size={20} className="cursor-pointer hover:text-slate-600" />
            <X size={20} className="cursor-pointer hover:text-slate-600" />
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-2", msg.isMe ? "flex-row-reverse" : "flex-row")}>
              {!msg.isMe && (
                <img 
                  src={msg.avatar} 
                  alt={msg.sender} 
                  className="w-8 h-8 rounded-full object-cover mt-1"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className={cn("flex flex-col", msg.isMe ? "items-end" : "items-start")}>
                {!msg.isMe && <span className="text-[12px] font-semibold text-slate-600 mb-1 ml-1">{msg.sender}</span>}
                <div className={cn(
                  "px-3 py-2 rounded-xl shadow-sm max-w-[700px]",
                  msg.isMe ? "bg-[#00a3ff] text-white" : "bg-white text-slate-800"
                )}>
                  {msg.quote && (
                    <div className="mb-2 p-2 bg-slate-50 rounded-lg border-l-4 border-[#00a3ff] text-[13px]">
                      <div className="font-bold text-[#00a3ff] mb-0.5">{msg.quote.sender}</div>
                      <div className="text-slate-600 truncate">{msg.quote.text}</div>
                    </div>
                  )}
                  <p className="text-[14px] leading-relaxed">{msg.text}</p>
                  <div className="flex justify-end mt-1">
                    <span className={cn("text-[10px]", msg.isMe ? "text-sky-100" : "text-slate-400")}>{msg.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Bottom Avatar in Screenshot */}
          <div className="flex gap-2 mt-auto">
            <img 
              src="https://i.pravatar.cc/150?u=rk" 
              alt="RKhanna" 
              className="w-8 h-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="text-[12px] font-semibold text-slate-600 mt-2">~ RKhanna</span>
          </div>
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="max-w-5xl mx-auto flex items-center gap-3 bg-[#f0f2f5] rounded-full px-4 py-2 shadow-inner">
            <button className="text-slate-400 hover:text-slate-600">
              <Paperclip size={20} />
            </button>
            <div className="flex-1 flex items-center gap-2">
              <Sparkles size={18} className="text-[#00a3ff]" />
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 bg-transparent py-1.5 focus:outline-none text-[14px]"
              />
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <ChevronDown size={20} className="cursor-pointer" />
              <Smile size={20} className="cursor-pointer" />
              <Mic size={20} className="cursor-pointer" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
