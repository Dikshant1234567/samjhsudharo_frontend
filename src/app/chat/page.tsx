'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type ChatItem = {
  _id: string;
  otherName: string;
  lastMessage?: { text: string; createdAt: string };
  unreadCount: number;
};

export default function ChatListPage() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const meId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
    if (!meId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      const res = await fetch(`/api/chats?userId=${meId}`);
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-3">
      <h1 className="text-2xl font-bold mb-3">Messages</h1>
      {chats.length === 0 ? (
        <div className="text-gray-500">No conversations yet.</div>
      ) : (
        <ul className="divide-y">
          {chats.map((c) => (
            <li key={c._id}>
              <Link href={`/chat/${c._id}`} className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-700 font-semibold">{(c.otherName || 'U').charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="font-medium">{c.otherName || 'Conversation'}</div>
                    <div className="text-sm text-gray-500 truncate max-w-[200px]">
                      {c.lastMessage?.text ?? 'No messages yet'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {c.lastMessage?.createdAt && (
                    <div className="text-xs text-gray-400">
                      {new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  {c.unreadCount > 0 && (
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-green-600 text-white">
                      {c.unreadCount}
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}