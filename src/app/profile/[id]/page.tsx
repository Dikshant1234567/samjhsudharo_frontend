'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Profile = { name: string; email?: string; description?: string; domain?: string[] | string };
type EventItem = {
  _id?: string;
  id?: string;
  title?: string;
  date?: string;
  time?: string;           // added
  description?: string;    // added
  locationText?: string;
  images?: string[];
};
type VlogItem = {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  domain?: string;
  images?: string[];
  createdAt?: string | Date; // added
};

export default function OtherProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [vlogs, setVlogs] = useState<VlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activity' | 'events' | 'vlogs'>('activity');

  useEffect(() => {
    const load = async () => {
      try {
        // Try individual, then NGO
        let res = await fetch(`/api/individual/profile/${id}`);
        if (!res.ok) res = await fetch(`/api/ngo/profile/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name || `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
            email: data.email,
            description: data.description,
            domain: data.domain || data.domains,
          });
        }
        const [eventsRes, vlogsRes] = await Promise.all([
          fetch(`/api/post-events?authorId=${id}`),
          fetch(`/api/post-vlogs?authorId=${id}`),
        ]);
        if (eventsRes.ok) setEvents(await eventsRes.json());
        if (vlogsRes.ok) setVlogs(await vlogsRes.json());
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const startChat = async () => {
    const meId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
    const meType = typeof window !== 'undefined' ? sessionStorage.getItem('userType') : null;
    if (!meId || !meType) {
      router.push('/login');
      return;
    }
    const targetType = 'individual'; // best-effort; backend doesn’t require target type to match model in validation
    const res = await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAId: meId,
        userAType: meType === 'individual' ? 'individual_user' : 'ngo',
        userBId: id,
        userBType: targetType === 'individual' ? 'individual_user' : 'ngo',
      }),
    });
    const data = await res.json();
    if (res.ok && data?._id) router.push(`/chat/${data._id}`);
  };

  const totalEvents = events.length;
  const totalVlogs = vlogs.length;

  const initials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return `${first}${last}`.toUpperCase();
  };

  function formatDateStable(iso: string) {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC',
      }).format(new Date(iso));
    } catch {
      return new Date(iso).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!profile) return <div className="p-6">Profile not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
        <div className="h-32 bg-gradient-to-r from-green-100 to-blue-100" />
        <div className="px-6 pb-6 -mt-8 flex items-end">
          <div className="relative w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
            {/* If you add profile.profileImage, render <Image ... /> here */}
            <span className="text-2xl font-semibold text-gray-700">{initials(profile.name)}</span>
          </div>
          <div className="flex-1 ml-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                {profile.description && (
                  <p className="text-gray-600 mt-1 max-w-2xl">{profile.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={startChat}
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  Message
                </button>
                {/* Optional: Connect/Follow */}
                <button className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
                  Connect
                </button>
              </div>
            </div>
            {/* Quick stats */}
            <div className="mt-4 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Events</span>
                <span className="text-sm font-semibold text-gray-900">{totalEvents}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Vlogs</span>
                <span className="text-sm font-semibold text-gray-900">{totalVlogs}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 text-sm ${
            activeTab === 'activity'
              ? 'border-b-2 border-green-600 text-green-700'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Activity
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 text-sm ${
            activeTab === 'events'
              ? 'border-b-2 border-green-600 text-green-700'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab('vlogs')}
          className={`px-4 py-2 text-sm ${
            activeTab === 'vlogs'
              ? 'border-b-2 border-green-600 text-green-700'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Vlogs
        </button>
      </div>

      {/* Content */}
      {activeTab === 'activity' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...events.map(e => ({ ...e, _type: 'event' })), ...vlogs.map(v => ({ ...v, _type: 'vlog' }))]
            .sort((a, b) => {
              const aDate = new Date(String((a as any).createdAt ?? (a as any).date ?? ''));
              const bDate = new Date(String((b as any).createdAt ?? (b as any).date ?? ''));
              return aDate.getTime() - bDate.getTime();
            })
            .map(item => (
              <div key={String(item._id ?? item.id)} className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                {'images' in item && Array.isArray(item.images) && item.images.length > 0 && (
                  <div className="relative h-40 w-full">
<img
  src={item.images[0]}
  alt={item.title ?? 'Untitled'}
  className="w-full h-full object-cover"
/>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{item.title ?? 'Untitled'}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${item._type === 'event' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {item._type}
                    </span>
                  </div>
                  {'description' in item && item.description && <p className="mt-2 text-gray-700 line-clamp-3">{item.description}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <Link
                      href={`/post/${String(item._id ?? item.id)}`}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      View details
                    </Link>
                    {'date' in item && item.date && (
                      <span className="text-xs text-gray-500">{item.date}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {activeTab === 'events' && (
        <section>
          {events.length === 0 ? (
            <p className="text-gray-500">No events.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map(ev => (
                <div key={String(ev._id ?? ev.id)} className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                  {Array.isArray(ev.images) && ev.images.length > 0 && (
                    <div className="relative h-40 w-full">
                      <img
                        src={ev.images[0]}
                        alt={ev.title ?? 'Untitled'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{ev.title ?? 'Untitled'}</h3>
                    {ev.description && <p className="mt-2 text-gray-700 line-clamp-3">{ev.description}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <Link
                        href={`/post/${String(ev._id ?? ev.id)}`}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        View details
                      </Link>
                      {ev.date && <span className="text-xs text-gray-500">{ev.date}{ev.time ? ` • ${ev.time}` : ''}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'vlogs' && (
        <section>
          {vlogs.length === 0 ? (
            <p className="text-gray-500">No vlogs.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vlogs.map(v => (
                <div key={String(v._id ?? v.id)} className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                  {Array.isArray(v.images) && v.images.length > 0 && (
                    <div className="relative h-40 w-full">
                      <img
                        src={v.images[0]}
                        alt={v.title ?? 'Untitled'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{v.title ?? 'Untitled'}</h3>
                    {v.description && <p className="mt-2 text-gray-700 line-clamp-3">{v.description}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatDateStable(String(v.createdAt ?? Date.now()))}
                      </span>
                      <Link
                        href={`/post/${String(v._id ?? v.id)}`}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}