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
  CheckCheck,
  Lock,
  Camera,
  Target,
  Users,
  Settings,
  LogOut,
  Trash2,
  UserX,
  Paperclip,
  Mic,
  Send,
  User,
  Key,
  Bell,
  Keyboard,
  HelpCircle
} from 'lucide-react';
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  setDoc, 
  doc,
  where,
  getDocs
} from 'firebase/firestore';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Custom scrollbar styles
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

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
    , isMe: false
  },
  {
    id: '2',
    sender: '~ Sri',
    avatar: 'https://i.pravatar.cc/150?u=sri',
    text: 'Mam can you check do zoho schools has alumi from this school?\nT N P M MARIMUTHU NADAR HIGHER SECONDARY SCHOOL',
    time: '10:29 PM'
    , isMe: false
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
    , isMe: false
  },
  { 
    id: '4',
    sender: 'Throw Zestober',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TZ',
    text: '',
    time: '10:31 PM'
    , isMe: true
  },
  {
    id: '5',
    sender: 'I need help from them',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=IH',
    text: '',
    time: '10:31 PM'
    , isMe: false
  },
  {
    id: '6',
    sender: 'Please',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PL',
    text: '',
    time: '10:31 PM'
    , isMe: true
  }
];

export default function App() {
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [dotsImage, setDotsImage] = useState('default');
  const [showProfileInterface, setShowProfileInterface] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showAccountEdit, setShowAccountEdit] = useState(false);
  const [profileName, setProfileName] = useState(user?.displayName || '');
  const [profileAbout, setProfileAbout] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [showAllUsersModal, setShowAllUsersModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [showChatDropdown, setShowChatDropdown] = useState(false);
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const [showSidebarDropdown, setShowSidebarDropdown] = useState(false);
  const [showStatusScreen, setShowStatusScreen] = useState(false);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showFriendRequestsModal, setShowFriendRequestsModal] = useState(false);
  const [selectedFriendRequest, setSelectedFriendRequest] = useState<any>(null);
  const [userFriends, setUserFriends] = useState<any[]>([]);
  const [showMeetings, setShowMeetings] = useState(false);
  const [showCalls, setShowCalls] = useState(false);
  const [showSidebarUsers, setShowSidebarUsers] = useState(false);

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

  const sendMessage = async () => {
    if (inputMessage.trim() === '' || isUserBlocked) return;
    let currentUser = user;
    if (!currentUser) {
      const provider = new GoogleAuthProvider();
      try {
        const res = await signInWithPopup(auth, provider);
        currentUser = res.user;
        setUser(res.user);
      } catch (err) {
        console.error('Sign-in required to send message', err);
        return;
      }
    }

    // Try multiple potential id fields (some objects may come from different sources)
    const receiverId = activeChat?.id ?? activeChat?.uid ?? activeChat?.userId ?? (activeChat && (activeChat as any).email) ?? null;
    if (!receiverId) {
      console.error('No receiver selected. activeChat:', activeChat);
      // help user select a chat
      setShowUsers(true);
      alert('Please select a user to chat with first.');
      return;
    }

    const senderId = currentUser?.uid || auth.currentUser?.uid;
    if (!senderId) {
      console.error('No sender id available', { currentUser, authCurrent: auth.currentUser });
      return;
    }

    const convId = [senderId, receiverId].sort().join('_');
    const msgsRef = collection(db, 'conversations', convId, 'messages');

    // optimistic local message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      sender: currentUser?.displayName || currentUser?.email || 'You',
      avatar: currentUser?.photoURL || 'https://api.dicebear.com/7.x/initials/svg?seed=YOU&backgroundColor=00a3ff',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInputMessage('');

    // save to Firestore
    (async () => {
      try {
        const docRef = await addDoc(msgsRef, {
          sender_id: senderId,
          receiver_id: receiverId,
          message_text: inputMessage,
          timestamp: serverTimestamp(),
          avatar: currentUser?.photoURL || null,
          sender_displayName: currentUser?.displayName || null
        });
        // add message_id field
        await setDoc(doc(db, 'conversations', convId, 'messages', docRef.id), { message_id: docRef.id }, { merge: true });
      } catch (err) {
        console.error('Failed to save message', err);
      }
    })();
  };

  const deleteChat = () => {
    setMessages([]);
    setShowChatDropdown(false);
  };

  const toggleBlockUser = () => {
    setIsUserBlocked(!isUserBlocked);
    setShowChatDropdown(false);
  };

  // Send friend request
  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return;
    try {
      const requestRef = await addDoc(collection(db, 'friendRequests'), {
        senderId: user.uid,
        senderName: user.displayName || user.email,
        senderAvatar: user.photoURL,
        receiverId: receiverId,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      console.log('Friend request sent:', requestRef.id);
    } catch (err) {
      console.error('Error sending friend request:', err);
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (requestId: string, senderId: string) => {
    if (!user) return;
    try {
      // Update request status
      await setDoc(doc(db, 'friendRequests', requestId), { status: 'accepted' }, { merge: true });
      
      // Create friendship
      await addDoc(collection(db, 'friendships'), {
        participants: [user.uid, senderId],
        status: 'accepted',
        createdAt: serverTimestamp()
      });

      // Remove from pending friend requests
      setFriendRequests(friendRequests.filter(req => req.id !== requestId));
      
      console.log('Friend request accepted');
    } catch (err) {
      console.error('Error accepting friend request:', err);
    }
  };

  // Reject friend request
  const rejectFriendRequest = async (requestId: string) => {
    try {
      await setDoc(doc(db, 'friendRequests', requestId), { status: 'rejected' }, { merge: true });
      console.log('Friend request rejected');
    } catch (err) {
      console.error('Error rejecting friend request:', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.chat-dropdown-container') && !target.closest('.chat-dropdown-menu')) {
        setShowChatDropdown(false);
      }
      if (!target.closest('.sidebar-dropdown-container') && !target.closest('.sidebar-dropdown-menu')) {
        setShowSidebarDropdown(false);
      }
    };

    if (showChatDropdown || showSidebarDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChatDropdown, showSidebarDropdown]);

  // read URL params to support opening a full users page or a user profile in a new tab
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const profileUid = params.get('profile');
  const showAllUsersPage = params.get('users') === '1';

  // auth listener (sets `user`)
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubAuth();
  }, []);

  // Listen to messages for the active conversation between signed-in user and activeChat
  useEffect(() => {
    if (!user || !activeChat || !activeChat.id) {
      setMessages(INITIAL_MESSAGES);
      return;
    }

    const senderId = user.uid;
    const convId = [senderId, activeChat.id].sort().join('_');
    const msgsRef = collection(db, 'conversations', convId, 'messages');
    const q = query(msgsRef, orderBy('timestamp'));
    const unsub = onSnapshot(q, (snap) => {
      console.log('Conversation snapshot', convId, 'count=', snap.size);
      if (snap.empty) {
        setMessages(INITIAL_MESSAGES);
        return;
      }

      const docs = snap.docs.map((d) => {
        const data: any = d.data();
        const ts = data.timestamp && data.timestamp.toDate ? data.timestamp.toDate() : null;
        return {
          id: d.id,
          sender: data.sender_displayName || data.displayName || data.sender || (data.email ?? 'Unknown'),
          avatar: data.avatar || 'https://i.pravatar.cc/150?u=guest',
          text: data.message_text || data.text || '',
          time: ts ? ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          isMe: user ? data.sender_id === user.uid : false,
          quote: data.quote
        } as Message;
      });
      setMessages(docs);
    });

    return () => unsub();
  }, [db, user, activeChat]);

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
      provider: (user.providerData && user.providerData[0] && user.providerData[0].providerId) || 'unknown',
      lastSeen: serverTimestamp()
    }, { merge: true })
      .then(() => console.log('User profile saved successfully for', user.email))
      .catch((err) => console.error('Error saving user profile:', err));
  }, [user]);

  // subscribe to `users` collection to show who signed-in
  useEffect(() => {
    // Remove orderBy to avoid index requirement issues
    const usersRef = collection(db, 'users');
    setUsersLoaded(false);
    const unsub = onSnapshot(usersRef, (snap) => {
      const raw = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      // coalesce users by normalized email (fallback to id) so the same person
      // signed in with multiple uids doesn't appear multiple times
      const byKey: Record<string, any> = {};
      raw.forEach(u => {
        const email = (u.email || '').toString().trim().toLowerCase();
        const key = email || u.id;
        if (!byKey[key]) {
          // normalize id to email when available so keys in lists are stable
          byKey[key] = { ...u, id: email || u.id };
        } else {
          // merge: prefer the entry with latest lastSeen timestamp if present
          const existing = byKey[key];
          const aTs = existing.lastSeen && existing.lastSeen.seconds ? existing.lastSeen.seconds : 0;
          const bTs = u.lastSeen && u.lastSeen.seconds ? u.lastSeen.seconds : 0;
          if (bTs > aTs) {
            byKey[key] = { ...existing, ...u, id: email || u.id };
          }
        }
      });
      const unique = Object.values(byKey);
      console.log('Users snapshot received', unique);
      setOnlineUsers(unique);
      setUsersLoaded(true);
    }, (error) => {
      console.error('Error fetching users:', error);
    });
    return () => unsub();
  }, []);

  // Subscribe to friend requests for current user
  useEffect(() => {
    if (!user) return;
    const requestsRef = collection(db, 'friendRequests');
    const q = query(requestsRef, where('receiverId', '==', user.uid), where('status', '==', 'pending'));
    const unsub = onSnapshot(q, (snap) => {
      const reqs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      console.log('Friend requests received', reqs);
      setFriendRequests(reqs);
    });
    return () => unsub();
  }, [user]);

  // Subscribe to friends list
  useEffect(() => {
    if (!user) return;
    const friendsRef = collection(db, 'friendships');
    const q = query(friendsRef, 
      where('status', '==', 'accepted'),
      where('participants', 'array-contains', user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const friendships = snap.docs.map(d => d.data() as any);
      let friendIds = friendships.map(f => f.participants.find((p: string) => p !== user.uid));
      // dedupe friend ids
      friendIds = Array.from(new Set(friendIds.filter(Boolean)));
      // Get full user data for friends
      const friendsPromise = Promise.all(
        friendIds.map(fid =>
          getDocs(query(collection(db, 'users'), where('__name__', '==', fid)))
            .then(snap => {
              const d = snap.docs[0];
              if (!d) return null;
              return { id: d.id, ...(d.data() as any) };
            })
        )
      );
      friendsPromise.then(friends => {
        const list = friends.filter(Boolean) as any[];
        // final dedupe by id
        const seen: Record<string, boolean> = {};
        const unique = list.filter(u => {
          const id = u.id || u.uid || u.email || JSON.stringify(u);
          if (seen[id]) return false;
          seen[id] = true;
          return true;
        });
        setUserFriends(unique);
      });
    });
    return () => unsub();
  }, [user]);

  // If the app was opened with ?users=1 or ?profile=<uid>, render a full-screen users/profile page
  const filteredUsers = (() => {
    const q = usersSearch.trim().toLowerCase();
    const list = onlineUsers.filter(u => {
      if (!q) return true;
      const name = (u.displayName || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
    const seen: Record<string, boolean> = {};
    return list.filter(u => {
      const id = u.id || u.uid || u.email || JSON.stringify(u);
      if (seen[id]) return false;
      seen[id] = true;
      return true;
    });
  })();

  // Users filtered for the New Chat modal (uses its own search input)
  const newChatFilteredUsers = (() => {
    const q = newChatSearch.trim().toLowerCase();
    const list = onlineUsers.filter(u => {
      if (!q) return true;
      const name = (u.displayName || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
    const seen: Record<string, boolean> = {};
    return list.filter(u => {
      const id = u.id || u.uid || u.email || JSON.stringify(u);
      if (seen[id]) return false;
      seen[id] = true;
      return true;
    });
  })();

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
            {!usersLoaded ? (
              <div className="text-sm text-slate-500">Loading users...</div>
            ) : onlineUsers.length === 0 ? (
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
      const provider = new GoogleAuthProvider();
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
    <>
      <style>{scrollbarHideStyles}</style>
      <div className="flex h-screen w-full bg-[#f4f7f9] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[72px] flex flex-col items-center py-4 border-r border-slate-200 bg-white relative z-[60]">
        <div className="mb-6 p-2.5 rounded-xl bg-[#00a3ff] text-white cursor-pointer shadow-sm">
          <MessageSquare size={24} onClick={() => {setShowStatusScreen(false); setShowMeetings(false); setShowCalls(false); setShowSidebarUsers(false);}} />
        </div>
        <nav className="flex flex-col gap-6 text-slate-400">
          <div className="relative">
            <Target size={24} className="cursor-pointer hover:text-slate-600" onClick={() => setShowStatusScreen(true)} />
          </div>
          <Calendar size={24} className="cursor-pointer hover:text-slate-600" onClick={() => {setShowMeetings(true); setShowStatusScreen(false); setShowCalls(false); setShowSidebarUsers(false);}} />
          <Phone size={24} className="cursor-pointer hover:text-slate-600" onClick={() => {setShowCalls(true); setShowStatusScreen(false); setShowMeetings(false); setShowSidebarUsers(false);}} />
          <Users size={20} className="cursor-pointer hover:text-slate-600" onClick={() => {setShowSidebarUsers(true); setShowStatusScreen(false); setShowMeetings(false); setShowCalls(false);}} />
        </nav>
        <div className="mt-auto flex flex-col gap-6 items-center pb-4 relative">
          <Settings size={24} className="text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => setShowProfileInterface(true)} />
        </div>
      </aside>

      {/* Chat List */}
      <section className="w-[450px] flex flex-col border-r bg-white border-slate-200">
        <header className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Chats</h1>
          <div className="flex gap-3 relative">
            <div className="relative sidebar-dropdown-container">
              <button 
                onClick={() => setShowSidebarDropdown(!showSidebarDropdown)}
                className="p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <MoreHorizontal size={20} className="text-slate-400 cursor-pointer" />
              </button>
              
              {showSidebarDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg border z-50 sidebar-dropdown-menu bg-white border-slate-200">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors text-slate-900">
                    <Users size={16} className="text-slate-600" />
                    <span className="text-sm">New Group</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors text-slate-900">
                    <Star size={16} className="text-yellow-500" />
                    <span className="text-sm">Starred Messages</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors text-slate-900">
                    <CheckCheck size={16} className="text-blue-500" />
                    <span className="text-sm">Select Chats</span>
                  </button>
                  
                  <div className="border-t border-slate-200" />
                  
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors text-slate-900">
                    <Settings size={16} className="text-slate-600" />
                    <span className="text-sm">Settings</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors text-slate-900">
                    <Lock size={16} className="text-green-600" />
                    <span className="text-sm">App Lock</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      signOut(auth);
                      setShowSidebarDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors text-red-600"
                  >
                    <LogOut size={16} className="text-red-600" />
                    <span className="text-sm">Log Out</span>
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => { setShowNewChatModal(true); setShowUsers(false); }}
              aria-label="show users"
              className="p-1 rounded-full bg-[#00a3ff] text-white cursor-pointer relative"
            >
              <Plus size={18} />
            </button>

            {/* Friend Request Notification Icon */}
            <button
              onClick={() => setShowFriendRequestsModal(true)}
              className="p-2 rounded-full hover:bg-slate-100 relative cursor-pointer transition-colors"
              aria-label="friend requests"
            >
              <Users size={20} className="text-slate-600" />
              {friendRequests.length > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {friendRequests.length}
                </div>
              )}
            </button>

            {/* Friend Requests Dropdown - Removed, now showing as full-screen modal */}


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
                <div className="max-h-64 overflow-y-auto scrollbar-hide">
                  {!usersLoaded ? (
                    <div className="p-3 text-sm text-slate-500">Loading users...</div>
                  ) : onlineUsers.length === 0 ? (
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

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Show accepted friends first, then mock chats as fallback */}
          {userFriends.length > 0 ? (
            userFriends.map((friend) => (
              <div 
                key={friend.id}
                onClick={() => openUserChat(friend)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-50",
                  activeChat?.id === friend.id ? "bg-[#e1f3ff]" : "hover:bg-slate-50"
                )}
              >
                <img 
                  src={friend.photoURL || `https://i.pravatar.cc/150?u=${friend.id}`} 
                  alt={friend.displayName || friend.email} 
                  className="w-12 h-12 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-[15px] truncate">{friend.displayName || friend.email}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="text-[13px] text-slate-500 truncate">Friend</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            MOCK_CHATS.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-50",
                  activeChat?.id === chat.id ? "bg-[#e1f3ff]" : "hover:bg-slate-50"
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
            ))
          )}
        </div>
      </section>

      {/* Meetings View */}
      {showMeetings && (
        <main className="absolute top-0 left-[72px] right-0 bottom-0 flex flex-col bg-[#fbf9f7] z-50">
          {/* Meetings Header */}
          <header className="h-16 px-8 flex items-center bg-white justify-between">
            <h1 className="text-xl font-semibold text-slate-900">Meetings</h1>
            <button onClick={() => setShowMeetings(false)} className="p-1 hover:bg-slate-100 rounded">
              <X size={20} className="text-slate-700" />
            </button>
          </header>

          {/* Meetings Content */}
          <div className="flex-1 flex">
            {/* Left Side - Meetings List */}
            <div className="w-[450px] flex flex-col border-r border-slate-200 bg-white">
              {/* Tabs */}
              <div className="px-4 py-3 border-b border-slate-200 flex gap-6">
                <button className="pb-2 font-semibold text-slate-900 border-b-2 border-[#00a3ff] text-sm">
                  Upcoming
                </button>
                <button className="pb-2 text-slate-500 hover:text-slate-700 text-sm">
                  Previous
                </button>
                <button className="pb-2 text-slate-500 hover:text-slate-700 text-sm">
                  Recordings
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search meetings"
                    className="w-full pl-9 pr-4 py-2 bg-[#f0f2f5] rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Empty State */}
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-[#f0f2f5] rounded-full">
                    <Calendar size={40} className="text-slate-400" />
                  </div>
                  <h3 className="text-slate-900 font-semibold mb-2">Organize, join and schedule your meetings in one place</h3>
                  <p className="text-slate-500 text-sm">No upcoming meetings</p>
                </div>
              </div>
            </div>

            {/* Right Side - Meeting Details */}
            <div className="flex-1 flex flex-col items-center justify-center bg-transparent relative p-8">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <div className="text-[#00a3ff] text-7xl font-bold">V</div>
                </div>
                <h2 className="text-4xl font-bold text-slate-900 mb-2">Hello</h2>
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">Vicky Bhelave</h3>
                <p className="text-slate-600 mb-8">Connect instantly or schedule a meeting for later</p>
                
                <div className="flex flex-col gap-4">
                  <button className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <Video size={20} className="text-[#00a3ff]" />
                    <span className="font-medium text-slate-900">Meet now</span>
                  </button>
                  
                  <button className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <Calendar size={20} className="text-[#00a3ff]" />
                    <span className="font-medium text-slate-900">Schedule meeting</span>
                  </button>
                  
                  <button className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <Phone size={20} className="text-[#00a3ff]" />
                    <span className="font-medium text-slate-900">Join meeting</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Calls View */}
      {showCalls && (
        <main className="absolute top-0 left-[72px] right-0 bottom-0 flex flex-col bg-[#fbf9f7] z-50">
          {/* Calls Header */}
          <header className="h-16 px-8 flex items-center bg-white justify-between">
            <h1 className="text-xl font-semibold text-slate-900">Calls</h1>
            <button onClick={() => setShowCalls(false)} className="p-1 hover:bg-slate-100 rounded">
              <X size={20} className="text-slate-700" />
            </button>
          </header>

          {/* Calls Content */}
          <div className="flex-1 flex">
            {/* Left Side - Calls List */}
            <div className="w-[450px] flex flex-col border-r border-slate-200 bg-white">
              {/* Search Bar */}
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search calls"
                    className="w-full pl-9 pr-4 py-2 bg-[#f0f2f5] rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Empty State */}
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-[#f0f2f5] rounded-full">
                    <Phone size={40} className="text-slate-400" />
                  </div>
                  <h3 className="text-slate-900 font-semibold mb-2">No calls yet</h3>
                  <p className="text-slate-500 text-sm">Your call activity will appear here</p>
                </div>
              </div>
            </div>

            {/* Right Side - Call Details */}
            <div className="flex-1 flex flex-col items-center justify-center bg-transparent relative p-8">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-[#e3f2fd] rounded-full">
                  <Phone size={50} className="text-[#00a3ff]" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Calls</h2>
                <p className="text-slate-600 mb-8">Your call activity will appear here.</p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Users/Friends View */}
      {showSidebarUsers && (
        <main className="absolute top-0 left-[72px] right-0 bottom-0 flex flex-col bg-[#fbf9f7] z-50">
          {/* Users Header */}
          <header className="h-16 px-8 flex items-center bg-white justify-between">
            <h1 className="text-xl font-semibold text-slate-900">Friends</h1>
            <button onClick={() => setShowSidebarUsers(false)} className="p-1 hover:bg-slate-100 rounded">
              <X size={20} className="text-slate-700" />
            </button>
          </header>

          {/* Users Content */}
          <div className="flex-1 flex">
            {/* Left Side - Friends List */}
            <div className="w-[450px] flex flex-col border-r border-slate-200 bg-white">
              {/* Search Bar */}
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search friends"
                    className="w-full pl-9 pr-4 py-2 bg-[#f0f2f5] rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Friends List */}
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {userFriends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Users size={40} className="text-slate-400 mb-4" />
                    <h3 className="text-slate-900 font-semibold mb-2">No friends yet</h3>
                    <p className="text-slate-500 text-sm">Accept friend requests to add them to your friends list</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {userFriends.map((friend) => (
                      <div key={friend.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors">
                        <img 
                          src={friend.photoURL || `https://i.pravatar.cc/150?u=${friend.id}`} 
                          alt={friend.displayName || friend.email} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate">{friend.displayName || friend.email}</div>
                          <div className="text-sm text-slate-500">Online</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Friend Details */}
            <div className="flex-1 flex flex-col items-center justify-center bg-transparent relative p-8">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-[#f0f2f5] rounded-full">
                  <Users size={50} className="text-slate-400" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Friends</h2>
                <p className="text-slate-600">Select a friend to see their profile</p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Main Chat Area */}
      {showStatusScreen && (
        <main className="absolute top-0 left-[72px] right-0 bottom-0 flex flex-col bg-[#fbf9f7] z-50">
          {/* Status Header */}
          <header className="h-16 px-8 flex items-center bg-white">
            <h1 className="text-xl font-semibold text-slate-900 ml-4">Status</h1>
          </header>

          {/* Status Content */}
          <div className="flex-1 flex">
            {/* Left Side - Status List */}
            <div className="w-[450px] flex flex-col border-r border-slate-200 bg-white">
              {/* My Status Section */}
              <div className="p-4">
                <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                  <div className="relative">
                    <img 
                      src={user?.photoURL || 'https://api.dicebear.com/7.x/initials/svg?seed=YOU&backgroundColor=00a3ff'} 
                      alt="My Status" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#00a884] rounded-full flex items-center justify-center border-2 border-white">
                      <Plus size={14} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-slate-900">My Status</div>
                    <div className="text-slate-500 text-sm">Tap to add status update</div>
                  </div>
                </div>
              </div>

              {/* Recent Status Section */}
              <div className="p-4">
                <h2 className="text-slate-500 text-sm font-semibold mb-4">RECENT</h2>
                
                {/* Status Items */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                    <img 
                      src="https://i.pravatar.cc/150?u=elon" 
                      alt="Elon Musk" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">Elon Musk</div>
                      <div className="text-slate-500 text-sm">07:48</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                    <img 
                      src="https://i.pravatar.cc/150?u=mom" 
                      alt="Mom" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">Mom</div>
                      <div className="text-slate-500 text-sm">Yesterday</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                    <img 
                      src="https://i.pravatar.cc/150?u=friend" 
                      alt="Friend" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">Best Friend</div>
                      <div className="text-slate-500 text-sm">2 days ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Share Status */}
            <div className="flex-1 flex flex-col items-center justify-center bg-transparent relative">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <circle cx="36" cy="36" r="12" fill="#EFEFEF" />
                    <circle cx="36" cy="36" r="22" stroke="#D6D6D6" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="36 18" />
                    <circle cx="36" cy="36" r="28" stroke="#EEEEEE" strokeWidth="2" fill="none" opacity="0.6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Share status updates</h2>
                <p className="text-slate-600 mb-6">Share photos, videos and text that disappear after 24 hours.</p>
                
              </div>
              <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Lock size={14} className="text-slate-400" />
                  <span>Your status updates are end-to-end encrypted</span>
                </div>
              </div>
              
            </div>
          </div>
        </main>
      )}
      
      {!showStatusScreen && !showMeetings && !showCalls && !showSidebarUsers && (
      <main className={`flex-1 flex flex-col bg-[#f0f2f5] ${showNewChatModal ? 'opacity-50 pointer-events-none' : ''}`}>
        {activeChat ? (
          <>
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
              <div className="flex items-center gap-8 pr-6">
                <Video size={24} className="text-black cursor-pointer hover:text-gray-700" />
                <Phone size={24} className="text-black cursor-pointer hover:text-gray-700 ml-2" />
                <div className="h-8 w-px bg-gray-400 mx-4" />
                <Search size={24} className="text-black cursor-pointer hover:text-gray-700" />
                <div className="relative chat-dropdown-container">
                  <button 
                    onClick={() => setShowChatDropdown(!showChatDropdown)}
                    className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <MoreHorizontal size={24} className="text-black cursor-pointer hover:text-gray-700" />
                  </button>
                  
                  {showChatDropdown && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 chat-dropdown-menu bg-white border-slate-200">
                      <button
                        onClick={deleteChat}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors text-slate-900"
                      >
                        <Trash2 size={16} className="text-red-500" />
                        <span className="text-sm">Clear Chat</span>
                      </button>
                      
                      <div className="border-t border-slate-200" />
                      
                      <button
                        onClick={toggleBlockUser}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors text-slate-900"
                      >
                        <UserX size={16} className={isUserBlocked ? 'text-red-500' : 'text-orange-500'} />
                        <span className="text-sm">{isUserBlocked ? 'Unblock User' : 'Block User'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide items-center justify-end pb-8">
              {isUserBlocked && (
                <div className="w-full max-w-2xl">
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-[13px] border border-red-200">
                    <UserX size={14} />
                    <span>You have blocked this user. You cannot send or receive messages.</span>
                  </div>
                </div>
              )}
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

            {/* Chat Input Section */}
            <div className="px-4 py-3 border-t border-slate-200 bg-white">
              {isUserBlocked ? (
                <div className="flex items-center justify-center py-2">
                  <span className="text-red-500 text-sm">You cannot send messages to this user</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Emoji Button */}
                  <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <Smile size={24} className="text-black" />
                  </button>
                  
                  {/* Attach Button */}
                  <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <Paperclip size={24} className="text-black" />
                  </button>
                  
                  {/* Text Input */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2.5 bg-[#f0f2f5] rounded-[25px] text-sm focus:outline-none focus:bg-white focus:border-slate-300 border border-transparent transition-all"
                    />
                  </div>
                  
                  {/* Microphone Button - Dynamic */}
                  <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    {inputMessage.trim() === '' ? (
                      <Mic size={24} className="text-black" />
                    ) : (
                      <Send size={24} className="text-black" onClick={sendMessage} />
                    )}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          // Empty state when no chat is selected
          <div className="flex-1 flex flex-col items-center justify-center bg-white">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <circle cx="36" cy="36" r="12" fill="#EFEFEF" />
                  <circle cx="36" cy="36" r="22" stroke="#D6D6D6" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="36 18" />
                  <circle cx="36" cy="36" r="28" stroke="#EEEEEE" strokeWidth="2" fill="none" opacity="0.6" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">Send documents</h2>
              <p className="text-slate-600 mb-8">Select a chat to get started.</p>
              
              <div className="flex gap-4 justify-center mb-8">
                <button className="flex flex-col items-center gap-2 px-6 py-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="w-12 h-12 bg-[#00a3ff] rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                      <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-900">Send document</span>
                </button>
                
                <button className="flex flex-col items-center gap-2 px-6 py-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="w-12 h-12 bg-[#00a3ff] rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-900">Add contact</span>
                </button>
                
                <button className="flex flex-col items-center gap-2 px-6 py-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="w-12 h-12 bg-[#00a3ff] rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v18"></path>
                      <path d="M3 12h18"></path>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-900">Ask Meta AI</span>
                </button>
              </div>
            </div>
            <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Lock size={14} className="text-slate-400" />
                <span>Your messages are end-to-end encrypted</span>
              </div>
            </div>
          </div>
        )}
      </main>
      )}
      
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex">
          {/* New Chat Panel - Left Side */}
          <div className="w-[450px] bg-white flex flex-col z-[70] h-full absolute left-16 top-0">
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
                      <button className="w-8 h-8 bg-white rounded-full hover:bg-slate-100 transition-colors" onClick={() => {
                        console.log('Second dot clicked');
                        setDotsImage('second');
                      }}>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </button>
                    </div>
                  </div>
                  <span className="font-medium text-slate-900">New community</span>
                </button>
              </div>
            </div>

            {/* Recent Chats */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="px-4 pb-2">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Recent chats</h3>
                <div className="space-y-1">
                  {/* Online Users - Only Google Sign-ins */}
                  {newChatFilteredUsers.filter(u => u.provider === 'google.com').slice(0, 5).map((u) => (
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
                      <div className="flex-shrink-0">
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            sendFriendRequest(u.id);
                          }}
                          className="px-3 py-1 bg-[#00a3ff] text-white rounded-full text-sm hover:bg-[#0088cc]"
                        >
                          Add
                        </button>
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
      
      {showProfileInterface && (
        <div className="fixed inset-0 z-50 flex">
          {/* Left Sidebar */}
          <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 z-[70]">
            {/* Profile Icon in Sidebar */}
            <div className="w-10 h-10 rounded-full overflow-hidden mb-4">
              <img src={user?.photoURL || 'https://api.dicebear.com/7.x/initials/svg?seed=V&backgroundColor=00a3ff'} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Profile Interface Panel - Main Content */}
          <div className="w-[450px] bg-white flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowProfileInterface(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X size={20} className="text-slate-700" />
                </button>
                <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
              </div>
              <div className="p-2 hover:bg-slate-100 rounded cursor-pointer">
                <div className="w-5 h-5 flex flex-col gap-0.5">
                  <div className="w-full h-0.5 bg-slate-600"></div>
                  <div className="w-full h-0.5 bg-slate-600"></div>
                  <div className="w-full h-0.5 bg-slate-600"></div>
                </div>
              </div>
            </div>

            {/* Search Bar - Moved to Top */}
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-3 bg-[#f8f9fa] border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-[#00a3ff] focus:ring-1 focus:ring-[#00a3ff] transition-all"
                />
              </div>
            </div>

            {/* Settings Options */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="px-6 py-2">
                {/* Profile Section - Now Scrollable */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                    <img src={user?.photoURL || 'https://api.dicebear.com/7.x/initials/svg?seed=V&backgroundColor=00a3ff'} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-1">{user?.displayName || user?.email || 'User'}</h3>
                  <p className="text-sm text-slate-500 mb-4">{user?.email || ''}</p>
                </div>
                <button 
                  onClick={() => {
                    setShowProfileEdit(true);
                    setProfileName(user?.displayName || '');
                  }}
                  className="w-full flex items-center gap-3 py-4 hover:bg-slate-50 transition-colors rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <User size={20} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <span className="text-slate-900 font-medium block">Profile</span>
                    <p className="text-sm text-slate-500 mt-0.5">Name, profile photo, username</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 py-4 hover:bg-slate-50 transition-colors rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <Key size={20} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <span className="text-slate-900 font-medium block">Account</span>
                    <p className="text-sm text-slate-500 mt-0.5">Security notifications, account info</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 py-4 hover:bg-slate-50 transition-colors rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <Lock size={20} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <span className="text-slate-900 font-medium block">Privacy</span>
                    <p className="text-sm text-slate-500 mt-0.5">Block contacts, disappearing messages</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 py-4 hover:bg-slate-50 transition-colors rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <span className="text-slate-900 font-medium block">Chats</span>
                    <p className="text-sm text-slate-500 mt-0.5">Theme, wallpapers, chat history</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 py-4 hover:bg-slate-50 transition-colors rounded-lg bg-slate-50">
                  <div className="w-8 h-8 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <Bell size={20} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <span className="text-slate-900 font-medium block">Notifications</span>
                    <p className="text-sm text-slate-500 mt-0.5">Message, group & call tones</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 py-4 hover:bg-slate-50 transition-colors rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <Keyboard size={20} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <span className="text-slate-900 font-medium block">Keyboard shortcuts</span>
                    <p className="text-sm text-slate-500 mt-0.5">Quick actions from keyboard</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 py-4 hover:bg-slate-50 transition-colors rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <HelpCircle size={20} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <span className="text-slate-900 font-medium block">Help and feedback</span>
                    <p className="text-sm text-slate-500 mt-0.5">FAQs, contact us, privacy policy</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => {
                    signOut(auth);
                    setShowProfileInterface(false);
                  }}
                  className="w-full flex items-center gap-3 py-4 hover:bg-slate-50 transition-colors rounded-lg"
                >
                  <div className="w-8 h-8 flex items-center justify-center text-red-600 flex-shrink-0">
                    <LogOut size={20} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <span className="text-red-600 font-medium block">Log out</span>
                    <p className="text-sm text-red-400 mt-0.5">Sign out of your account</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          {/* No backdrop needed - just dim the main content */}
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 z-50 flex">
          {/* Left Sidebar */}
          <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 z-[70]">
            <div className="w-10 h-10 rounded-full overflow-hidden mb-4">
              <img src={user?.photoURL || 'https://api.dicebear.com/7.x/initials/svg?seed=V&backgroundColor=00a3ff'} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Profile Edit Panel */}
          <div className="w-[450px] bg-white flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowProfileEdit(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X size={20} className="text-slate-700" />
                </button>
                <h2 className="text-lg font-semibold text-slate-900">Edit Profile</h2>
              </div>
            </div>

            {/* Profile Edit Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="px-6 py-6">
                {/* Profile Photo Section */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative mb-4">
                    <img 
                      src={user?.photoURL || 'https://api.dicebear.com/7.x/initials/svg?seed=V&backgroundColor=00a3ff'} 
                      alt="Profile" 
                      className="w-28 h-28 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <label className="absolute bottom-0 right-0 bg-[#00a3ff] text-white p-2 rounded-full cursor-pointer hover:bg-[#0088cc] transition-colors">
                      <Camera size={18} />
                      <input type="file" accept="image/*" className="hidden" />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 text-center">Click photo to change</p>
                </div>

                {/* Name Field */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Name</label>
                  <input 
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-slate-100 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:border focus:border-[#00a3ff] transition-all"
                  />
                  <p className="text-xs text-slate-500 mt-1">{profileName.length} / 50</p>
                </div>

                {/* About/Bio Field */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">About</label>
                  <textarea 
                    value={profileAbout}
                    onChange={(e) => setProfileAbout(e.target.value.slice(0, 139))}
                    placeholder="Add a bio or status..."
                    className="w-full px-4 py-3 bg-slate-100 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:border focus:border-[#00a3ff] transition-all resize-none"
                    rows={4}
                  />
                  <p className="text-xs text-slate-500 mt-1">{profileAbout.length} / 139</p>
                </div>

                {/* Save Button */}
                <button 
                  onClick={() => setShowProfileEdit(false)}
                  className="w-full px-4 py-3 bg-[#00a3ff] text-white rounded-lg hover:bg-[#0088cc] transition-colors font-semibold text-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
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
              {!usersLoaded ? (
                <div className="text-sm text-slate-500">Loading users...</div>
              ) : onlineUsers.length === 0 ? (
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

      {/* Full-screen Friend Requests Modal with Two-Panel Layout */}
      {showFriendRequestsModal && (
        <main className="absolute top-0 left-[72px] right-0 bottom-0 flex flex-col bg-white z-50">
          {/* Header */}
          <header className="h-16 px-6 flex items-center justify-between border-b border-slate-200 bg-white">
            <h1 className="text-2xl font-bold text-slate-900">Friend Requests</h1>
            <button 
              onClick={() => {setShowFriendRequestsModal(false); setSelectedFriendRequest(null);}} 
              className="p-1 hover:bg-slate-100 rounded transition-colors shrink-0"
              aria-label="close friend requests"
            >
              <X size={24} className="text-slate-700" />
            </button>
          </header>

          {/* Two-Panel Layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel - Friend Requests List */}
            <div className="w-[500px] flex flex-col border-r border-slate-200 bg-white">
              {/* Search Bar */}
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search requests..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-lg text-sm placeholder-slate-600 focus:outline-none focus:bg-white focus:border focus:border-slate-300"
                  />
                </div>
              </div>

              {/* Requests List */}
              <div className="flex-1 overflow-y-auto">
                {friendRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12 px-6">
                    <Users size={56} className="text-slate-300 mb-4" />
                    <h3 className="text-base font-semibold text-slate-900">No friend requests</h3>
                    <p className="text-sm text-slate-500 mt-2">You don't have any pending requests</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {friendRequests.map((request) => (
                      <div 
                        key={request.id}
                        onClick={() => setSelectedFriendRequest(request)}
                        className={`px-4 py-4 flex items-center gap-4 cursor-pointer transition-colors ${
                          selectedFriendRequest?.id === request.id 
                            ? 'bg-blue-50 border-l-4 border-l-[#00a3ff]' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <img 
                          src={request.senderAvatar || `https://i.pravatar.cc/150?u=${request.senderId}`} 
                          alt={request.senderName}
                          className="w-12 h-12 rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">
                            {request.senderName}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">Sent you a request</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Request Details */}
            <div className="flex-1 flex flex-col bg-slate-50">
              {selectedFriendRequest ? (
                <>
                  {/* Details Header */}
                  <div className="p-8 text-center border-b border-slate-200 bg-white">
                    <img 
                      src={selectedFriendRequest.senderAvatar || `https://i.pravatar.cc/150?u=${selectedFriendRequest.senderId}`} 
                      alt={selectedFriendRequest.senderName}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                    />
                    <h2 className="text-2xl font-bold text-slate-900">
                      {selectedFriendRequest.senderName}
                    </h2>
                    <p className="text-sm text-slate-500 mt-2">Sent you a friend request</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-1 flex flex-col items-center justify-center px-6">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => {
                          acceptFriendRequest(selectedFriendRequest.id, selectedFriendRequest.senderId);
                          setSelectedFriendRequest(null);
                        }}
                        className="px-8 py-3 bg-[#00a3ff] text-white rounded-lg hover:bg-[#0088cc] transition-colors font-semibold text-sm"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => {
                          rejectFriendRequest(selectedFriendRequest.id);
                          setSelectedFriendRequest(null);
                        }}
                        className="px-8 py-3 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-semibold text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <Users size={80} className="text-slate-200 mb-4" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Friend Requests</h3>
                  <p className="text-slate-500">Select a request to accept or reject</p>
                </div>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
    </>
  );
}


