'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { io } from 'socket.io-client';

type Message = { _id?: string; chat: string; sender: string; senderModel: string; text: string; createdAt?: string };
type ChatMeta = { otherName?: string };

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [meta, setMeta] = useState<ChatMeta>({});
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/chats/${id}/messages`);
      if (res.ok) setMessages(await res.json());
      // fetch meta from list API to get otherName
      const meId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
      if (meId) {
        const listRes = await fetch(`/api/chats?userId=${meId}`);
        if (listRes.ok) {
          const chats: any[] = await listRes.json();
          const found = chats.find(c => String(c._id) === String(id));
          if (found?.otherName) setMeta({ otherName: found.otherName });
          // mark as seen
          await fetch(`/api/chats/${id}/seen`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: meId })
          });
        }
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('chat:join', id);
    socketRef.current.on('chat:message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [id]);

  const send = async () => {
    const senderId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
    const senderType = typeof window !== 'undefined' ? sessionStorage.getItem('userType') : null;
    if (!senderId || !senderType || !text.trim()) return;
    const senderModel = senderType === 'individual' ? 'individual_user' : 'ngo';
    const res = await fetch(`/api/chats/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, senderModel, text }),
    });
    if (res.ok) {
      setText('');
    }
  };

  const meId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto border border-gray-200 rounded-lg">
      <div className="px-4 py-3 border-b bg-white">
        <h2 className="text-lg font-semibold">{meta.otherName || 'Chat'}</h2>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-3">
        {messages.map((m) => {
          const mine = meId && String(m.sender) === String(meId);
          return (
            <div key={m._id ?? `${m.sender}-${m.createdAt}-${Math.random()}`} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-3 py-2 rounded-2xl shadow-sm ${mine ? 'bg-green-600 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none border'}`}>
                <div className="text-sm">{m.text}</div>
                {m.createdAt && (
                  <div className={`mt-1 text-[10px] ${mine ? 'text-green-100' : 'text-gray-400'}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-white border-t flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={send}
          className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}