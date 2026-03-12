/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Film, 
  Calendar, 
  Phone, 
  Star, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Video,
  X, 
  Smile, 
  Menu,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { auth, provider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, setDoc, doc } from 'firebase/firestore';

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
  isOfficial?: boolean;
  hasCheck?: boolean;
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
    isVerified: true,
    hasCheck: true
  },
  {
    id: '3',
    name: 'Arattai',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AR&backgroundColor=f9d71c',
    lastMessage: 'Your Arattai sign-in code: 5861909.',
    time: 'Yesterday',
    isOfficial: true
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
  const [activeChat, setActiveChat] = useState<Chat>(MOCK_CHATS[4]); // ~ Miraculine
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [showAllUsersModal, setShowAllUsersModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');

  function openUserChat(u: any) {
    const chat: Chat = {
      id: u.id,
      name: u.displayName || u.email || 'Unknown',
      avatar: u.photoURL || `https://i.pravatar.cc/150?u=${u.id}`,
      lastMessage: '',
      time: ''
    };
    setActiveChat(chat);
    setShowUsers(false);
    setShowAllUsersModal(false);
  }

  // read URL params to support opening a full users page or a user profile in a new tab
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const profileUid = params.get('profile');
  const showAllUsersPage = params.get('users') === '1';

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));

    const q = query(collection(db, 'messages'), orderBy('createdAt'));
    const unsubMsgs = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          sender: data.sender || (data.email ?? 'Unknown'),
          avatar: data.avatar || 'https://i.pravatar.cc/150?u=guest',
          text: data.text || '',
          time: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          isMe: user ? data.uid === user.uid : false,
          quote: data.quote
        } as Message;
      });
      setMessages(docs);
    });

    return () => {
      unsubAuth();
      unsubMsgs();
    };
  }, [db, user]);

  // write/update the signed-in user's profile in `users` collection
  useEffect(() => {
    if (!user) return;
    const uRef = doc(db, 'users', user.uid);
    console.log('Writing user profile to Firestore for', user.uid, user.email);
    setDoc(uRef, {
      displayName: user.displayName || null,
      email: user.email || null,
      photoURL: user.photoURL || null,
      // store provider id so we can filter Google sign-ins
      provider: (user.providerData && user.providerData[0] && user.providerData[0].providerId) || null,
      lastSeen: serverTimestamp()
    }, { merge: true })
      .then(() => console.log('User profile saved successfully for', user.email))
      .catch((err) => console.error('Error saving user profile:', err));
  }, [user]);

  // subscribe to `users` collection to show who signed-in
  useEffect(() => {
    // Remove orderBy to avoid index requirement issues
    const usersRef = collection(db, 'users');
    const unsub = onSnapshot(usersRef, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      console.log('Users snapshot received', list);
      setOnlineUsers(list);
    }, (error) => {
      console.error('Error fetching users:', error);
    });
    return () => unsub();
  }, []);

  // If the app was opened with ?users=1 or ?profile=<uid>, render a full-screen users/profile page
  const filteredUsers = onlineUsers.filter(u => {
    const q = usersSearch.trim().toLowerCase();
    if (!q) return true;
    const name = (u.displayName || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  if (showAllUsersPage) {
    return (
      <div className="flex h-screen w-full items-start justify-center bg-[#f4f7f9] text-slate-900 font-sans">
        <div className="w-full max-w-3xl mt-8 bg-white rounded-lg shadow-lg border">
          <div className="p-4 flex items-center justify-between border-b">
            <h2 className="text-lg font-semibold">All Signed-in Users</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => { if (typeof window !== 'undefined') window.close(); }} className="px-3 py-1 rounded bg-[#efefef]">Close</button>
            </div>
          </div>
          <div className="p-4">
            <div className="mb-3">
              <input
                value={usersSearch}
                onChange={(e) => setUsersSearch(e.target.value)}
                placeholder="Search users"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
              />
            </div>
            {onlineUsers.length === 0 ? (
              <div className="text-sm text-slate-500">No users yet</div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {filteredUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-3 border rounded hover:bg-slate-50 cursor-pointer" onClick={() => openUserChat(u)}>
                    <div className="w-12 flex-shrink-0">
                      <img src={u.photoURL || `https://i.pravatar.cc/150?u=${u.id}`} alt={u.displayName || u.email} className="w-12 h-12 rounded-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{u.displayName || u.email}</div>
                      <div className="text-xs text-slate-500 truncate">{u.email}</div>
                    </div>
                    <div className="text-xs text-slate-400">{u.lastSeen ? (u.lastSeen.seconds ? new Date(u.lastSeen.seconds * 1000).toLocaleString() : String(u.lastSeen)) : '—'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (profileUid) {
    const p = onlineUsers.find(u => u.id === profileUid) || null;
    return (
      <div className="flex h-screen w-full items-start justify-center bg-[#f4f7f9] text-slate-900 font-sans">
        <div className="w-full max-w-2xl mt-8 bg-white rounded-lg shadow-lg border">
          <div className="p-4 flex items-center justify-between border-b">
            <h2 className="text-lg font-semibold">User Profile</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => { if (typeof window !== 'undefined') window.close(); }} className="px-3 py-1 rounded bg-[#efefef]">Close</button>
            </div>
          </div>
          <div className="p-6">
            {p ? (
              <div className="flex items-center gap-4">
                <img src={p.photoURL || `https://i.pravatar.cc/150?u=${p.id}`} alt={p.displayName || p.email} className="w-24 h-24 rounded-full object-cover" />
                <div>
                  <div className="text-xl font-semibold">{p.displayName || p.email}</div>
                  <div className="text-sm text-slate-500">{p.email}</div>
                  <div className="mt-2 text-sm text-slate-600">Last seen: {p.lastSeen ? new Date(p.lastSeen.seconds * 1000).toLocaleString() : 'Unknown'}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">User not found.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Sign-in failed', err);
    }
  };

  // message sending/input removed per request

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-6xl font-extrabold mb-12">LinkUp</h1>

          <div className="mx-auto bg-[#070707] rounded-3xl p-12 w-[560px] text-center shadow-2xl">
            <div className="mb-8 text-slate-400 tracking-widest">SECURE GATEWAY</div>
            <button onClick={handleSignIn} className="inline-flex items-center gap-4 px-6 py-3 bg-white text-black rounded-full shadow hover:opacity-90">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="google" className="w-6 h-6" />
              <span className="font-medium">Sign in with Google</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="mt-auto flex flex-col gap-6 items-center pb-4 relative">
          <button onClick={() => setShowProfile(s => !s)} className="w-9 h-9 rounded-full bg-[#00a3ff] flex items-center justify-center text-white cursor-pointer overflow-hidden">
            <img src={user?.photoURL || 'https://api.dicebear.com/7.x/initials/svg?seed=V&backgroundColor=00a3ff'} alt="V" className="w-full h-full object-cover" />
          </button>
          <Menu size={24} className="text-slate-400 cursor-pointer hover:text-slate-600" />

          {showProfile && user && (
            <div className="absolute left-12 bottom-20 w-64 bg-white border rounded-md shadow-lg z-50">
              <div className="p-4 flex items-center gap-3 border-b">
                <img src={user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`} alt={user.displayName || user.email} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{user.displayName || user.email}</div>
                  <div className="text-xs text-slate-500 truncate">{user.email}</div>
                  {user.email === 'vickybhelave25@navgurukul.org' && <div className="text-xs text-[#00a3ff]">Admin</div>}
                </div>
              </div>
              <div className="p-3">
                <div className="text-sm text-slate-600 mb-2">Profile</div>
                <div className="text-sm text-slate-700">UID: {user.uid}</div>
                <div className="mt-3">
                  <button onClick={() => { signOut(auth); setShowProfile(false); }} className="w-full px-3 py-2 bg-[#00a3ff] text-white rounded">Sign out</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Chat List */}
      <section className="w-[450px] flex flex-col border-r border-slate-200 bg-white">
        <header className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Chats</h1>
          <div className="flex gap-3 relative">
            <MoreHorizontal size={20} className="text-slate-400 cursor-pointer" />
            <button
              onClick={() => { setShowNewChatModal(true); setShowUsers(false); }}
              aria-label="show users"
              className="p-1 rounded-full bg-[#00a3ff] text-white cursor-pointer relative"
            >
              <Plus size={18} />
            </button>

            {showUsers && (
              <div className="absolute right-0 mt-10 w-64 bg-white border rounded-md shadow-lg z-50">
                <div className="p-3 border-b text-sm font-semibold">Logged in users</div>
                <div className="px-3 py-2">
                  <input
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                    placeholder="Search users"
                    className="w-full px-2 py-1 border rounded text-sm focus:outline-none"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {onlineUsers.length === 0 ? (
                    <div className="p-3 text-sm text-slate-500">No users yet</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-3 text-sm text-slate-500">No matching users</div>
                  ) : (
                    <div>
                      {/* Avatar grid similar to WhatsApp "new chat" */}
                      <div className="px-3 py-2">
                        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                          {filteredUsers.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => openUserChat(u)}
                              className="w-20 flex-none flex flex-col items-center gap-2 px-1 py-1 hover:bg-slate-50 rounded"
                            >
                              <img src={u.photoURL || `https://i.pravatar.cc/150?u=${u.id}`} alt={u.displayName || u.email} className="w-12 h-12 rounded-full object-cover" />
                              <div className="text-xs text-center truncate w-full">{u.displayName || u.email}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-t p-2">
                        <button onClick={() => setShowAllUsersModal(true)} className="w-full text-sm text-left px-2 py-2 hover:bg-slate-50 rounded">View all signed-in users</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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
                      <ShieldCheck size={14} className="text-[#4caf50]" />
                    )}
                    {chat.isOfficial && (
                      <ShieldCheck size={14} className="text-[#ff9800]" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{chat.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  {chat.hasCheck && <CheckCheck size={14} className="text-slate-400" />}
                  <p className="text-[13px] text-slate-500 truncate">{chat.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Chat Area */}
      <main className={`flex-1 flex flex-col bg-[#f0f2f5] ${showNewChatModal ? 'opacity-50 pointer-events-none' : ''}`}>
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
              <div className="flex items-center gap-1">
                <h2 className="font-bold text-[15px] leading-tight">{activeChat.name}</h2>
                {activeChat.isVerified && <ShieldCheck size={14} className="text-[#4caf50]" />}
                {activeChat.isOfficial && <ShieldCheck size={14} className="text-[#ff9800]" />}
              </div>
              <span className="text-[12px] text-slate-500">{activeChat.participants || ''}</span>
            </div>
          </div>
          <div className="flex items-center gap-5 text-slate-400">
            <Search size={20} className="cursor-pointer hover:text-slate-600" />
            <Phone size={20} className="cursor-pointer hover:text-slate-600" />
            <Video size={20} className="cursor-pointer hover:text-slate-600" />
            <MoreHorizontal size={20} className="cursor-pointer hover:text-slate-600" />
            <X size={20} className="cursor-pointer hover:text-slate-600" />
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar items-center justify-end pb-8">
          {messages.length === 0 ? (
            <div className="flex flex-col gap-3 items-center w-full max-w-2xl">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-[#e8f5e9] text-[#2e7d32] rounded-lg text-[13px] border border-[#c8e6c9]">
                <ShieldCheck size={14} />
                <span>Messages and calls in this chat are now protected with end-to-end encryption.</span>
              </div>
              <div className="px-4 py-1.5 bg-white text-slate-500 rounded-lg text-[13px] border border-slate-100 shadow-sm">
                Previous messages are currently unavailable as this device has been added recently.
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-2 w-full", msg.isMe ? "flex-row-reverse" : "flex-row")}>
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
                    "px-3 py-2 rounded-xl shadow-sm max-w-[500px]",
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
            ))
          )}
        </div>

        {/* Input removed per request */}
      </main>
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex">
          {/* New Chat Panel - Left Side */}
          <div className="w-[400px] bg-white flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowNewChatModal(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X size={20} className="text-slate-700" />
                </button>
                <h2 className="text-lg font-semibold text-slate-900">New chat</h2>
              </div>
              <div className="p-2 hover:bg-slate-100 rounded cursor-pointer">
                <div className="w-5 h-5 flex flex-col gap-0.5">
                  <div className="w-full h-0.5 bg-slate-600"></div>
                  <div className="w-full h-0.5 bg-slate-600"></div>
                  <div className="w-full h-0.5 bg-slate-600"></div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search name or number"
                  value={newChatSearch}
                  onChange={(e) => setNewChatSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#f0f2f5] rounded-lg text-sm focus:outline-none focus:bg-white focus:border focus:border-slate-300"
                  autoFocus
                />
              </div>
            </div>

            {/* Options */}
            <div className="px-4 pb-4">
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <Plus size={12} className="text-[#00a884]" />
                      </div>
                      <div className="w-3 h-3 bg-white rounded-full absolute -right-1 -bottom-1"></div>
                    </div>
                  </div>
                  <span className="font-medium text-slate-900">New group</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-slate-400 rounded-full"></div>
                    </div>
                    <Plus size={14} className="text-white absolute" />
                  </div>
                  <span className="font-medium text-slate-900">New contact</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center">
                    <div className="flex gap-0.5">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <span className="font-medium text-slate-900">New community</span>
                </button>
              </div>
            </div>

            {/* Recent Chats */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 pb-2">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Recent chats</h3>
                <div className="space-y-1">
                  {/* Online Users - Only Google Sign-ins */}
                  {filteredUsers.filter(u => u.provider === 'google.com').slice(0, 5).map((u) => (
                    <div 
                      key={u.id} 
                      className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => {
                        openUserChat(u);
                        setShowNewChatModal(false);
                      }}
                    >
                      <img 
                        src={u.photoURL || `https://i.pravatar.cc/150?u=${u.id}`} 
                        alt={u.displayName || u.email} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">{u.displayName || u.email}</div>
                        <div className="text-sm text-slate-500 truncate">Hey there! I am using WhatsApp.</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* No backdrop needed - just dim the main content */}
        </div>
      )}
      
      {showAllUsersModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg border">
            <div className="p-4 flex items-center justify-between border-b">
              <h2 className="text-lg font-semibold">All Signed-in Users</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowAllUsersModal(false)} className="px-3 py-1 rounded bg-[#efefef]">Close</button>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <input
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  placeholder="Search users"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                />
              </div>
              {onlineUsers.length === 0 ? (
                <div className="text-sm text-slate-500">No users yet</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-sm text-slate-500">No matching users</div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="flex items-center gap-3 p-3 border rounded hover:bg-slate-50 cursor-pointer" onClick={() => openUserChat(u)}>
                      <img src={u.photoURL || `https://i.pravatar.cc/150?u=${u.id}`} alt={u.displayName || u.email} className="w-12 h-12 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{u.displayName || u.email}</div>
                        <div className="text-xs text-slate-500 truncate">{u.email}</div>
                      </div>
                      <div className="text-xs text-slate-400">{u.lastSeen ? (u.lastSeen.seconds ? new Date(u.lastSeen.seconds * 1000).toLocaleString() : String(u.lastSeen)) : '—'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


