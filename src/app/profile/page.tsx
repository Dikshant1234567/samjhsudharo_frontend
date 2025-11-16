'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { UserRound, Calendar, MapPin, Mail, Phone, Edit, LogOut, Heart, MessageSquare, Share, Award, Tag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setAddPostModalOpen, setAddPostType } from '@/lib/slices/modalSlice';
import CreatePostModal from '@/component/posts/CreatePostModal';
import { io } from 'socket.io-client';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAddPostOpen = useAppSelector((state) => state.modal.isAddPostModalOpen);
  const [activeTab, setActiveTab] = useState('vlogs');
  const [profile, setProfile] = useState<{ name: string; email: string; phone?: string; location?: string; bio?: string; coverImage?: string; avatar?: string; domain?: string[] | string; joinedDate?: string }>({
    name: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{ firstName?: string; lastName?: string; name?: string; description?: string; city?: string; state?: string; country?: string; domains?: string; domain?: string }>();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  // Mock activities data
  const [activities, setActivities] = useState([
    { type: 'volunteer', event: 'Beach Cleanup Drive', date: '2 days ago', icon: <Award className="h-5 w-5 text-green-500" /> },
    { type: 'like', post: 'Environmental Awareness Campaign', date: '3 days ago', icon: <Heart className="h-5 w-5 text-red-500" /> },
    { type: 'comment', post: 'Tree Plantation Initiative', comment: 'Great initiative! Count me in for the next event.', date: '5 days ago', icon: <MessageSquare className="h-5 w-5 text-blue-500" /> },
    { type: 'post', title: 'Education for All', content: 'Started a new campaign for underprivileged children...', date: '1 week ago', icon: <Share className="h-5 w-5 text-purple-500" /> },
  ]);

  // Mock stats data
  const [stats, setStats] = useState([
    { label: 'Events Joined', value: 12, icon: <Calendar className="h-5 w-5 text-green-500" /> },
    { label: 'Posts Liked', value: 48, icon: <Heart className="h-5 w-5 text-red-500" /> },
    { label: 'Comments Posted', value: 24, icon: <MessageSquare className="h-5 w-5 text-blue-500" /> },
    { label: 'Insights Shared', value: 8, icon: <Share className="h-5 w-5 text-purple-500" /> },
  ]);

  type EventItem = { _id?: string; id?: string; title?: string; date?: string; location?: string | { district?: string; state?: string; country?: string }; locationText?: string; image?: string };
  type VlogItem = { _id?: string; id?: string; title?: string; description?: string; domain?: string; image?: string };
  const [events, setEvents] = useState<EventItem[]>([]);
  const [vlogs, setVlogs] = useState<VlogItem[]>([]);
  const openCreateEvent = () => { dispatch(setAddPostType('event')); dispatch(setAddPostModalOpen(true)); };
  const openCreateVlog = () => { dispatch(setAddPostType('vlog')); dispatch(setAddPostModalOpen(true)); };

  useEffect(() => {
    const load = async () => {
      try {
        const id = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
        const type = typeof window !== 'undefined' ? sessionStorage.getItem('userType') : null;
        if (!id || !type) return;
        const authorModel = type === 'individual' ? 'individual_user' : 'ngo';
        const profileRes = await fetch(type === 'individual' ? `/api/individual/profile/${id}` : `/api/ngo/profile/${id}`);
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile({
            name: data.name || `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
            email: data.email,
            domain: data.domain || data.domains,
            avatar: data.avatar,
            coverImage: data.coverImage,
          });
          if (type === 'individual') {
            setEditForm({
              firstName: data.firstName,
              lastName: data.lastName,
              description: data.description,
              city: data.city,
              state: data.state,
              country: data.country,
              domain: Array.isArray(data.domain) ? data.domain.join(', ') : ''
            });
          } else {
            setEditForm({
              name: data.name,
              description: data.description,
              domains: Array.isArray(data.domains) ? data.domains.join(', ') : '',
            });
          }
        }
        const [eventsRes, vlogsRes] = await Promise.all([
          fetch(`/api/post-events?authorId=${id}&authorModel=${authorModel}`),
          fetch(`/api/post-vlogs?authorId=${id}&authorModel=${authorModel}`),
        ]);
        if (eventsRes.ok) setEvents(await eventsRes.json());
        if (vlogsRes.ok) setVlogs(await vlogsRes.json());
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const id = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
    if (!id) return;
    socketRef.current = io('http://localhost:5000');
    socketRef.current.on('post:created', (payload: { type: 'event' | 'vlog'; post: { author?: string } & Record<string, unknown> }) => {
      if (payload?.post?.author && String(payload.post.author) === String(id)) {
        if (payload.type === 'event') {
          setEvents((prev) => [payload.post as EventItem, ...prev]);
        } else {
          setVlogs((prev) => [{ ...(payload.post as VlogItem) }, ...prev]);
        }
      }
    });
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const id = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
      const type = typeof window !== 'undefined' ? sessionStorage.getItem('userType') : null;
      if (!id || !type) return;
      const endpoint = type === 'individual' ? `/api/individual/profile/${id}` : `/api/ngo/profile/${id}`;
      const body: Record<string, unknown> = {};
      if (type === 'individual') {
        body.firstName = editForm?.firstName;
        body.lastName = editForm?.lastName;
        body.description = editForm?.description;
        body.city = editForm?.city;
        body.state = editForm?.state;
        body.country = editForm?.country;
        body.domain = (editForm?.domain || '')?.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        body.name = editForm?.name;
        body.description = editForm?.description;
        body.domains = (editForm?.domains || '')?.split(',').map(s => s.trim()).filter(Boolean);
      }
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const data = await res.json();
        setIsEditing(false);
        setProfile((prev) => ({
          ...prev,
          name: data.name || `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || prev.name,
          domain: data.domain || data.domains || prev.domain,
        }));
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update profile');
      }
    } catch (e) {
      alert('Failed to update profile');
    }
  };

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userType');
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userName');
    
    // Redirect to login page
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-64 w-full">
        <Image
          src={profile.coverImage || '/default-cover.jpg'}
          alt="Cover"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      {/* Profile Info */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32">
        <div className="relative bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex sm:space-x-5">
              <div className="flex-shrink-0">
                <div className="relative">
                  <Image
                    className="h-24 w-24 rounded-full border-4 border-white"
                    src={profile.avatar || '/default-avatar.jpg'}
                    alt={profile.name}
                    width={96}
                    height={96}
                  />
                  <button className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 sm:pt-1 text-center sm:text-left">
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{profile.name}</h1>
                <p className="text-sm font-medium text-gray-600">{profile.joinedDate}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <UserRound className="mr-1 h-3 w-3" />
                    Individual
                  </span>
                  {Array.isArray(profile.domain) && profile.domain.length > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {profile.domain.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-center sm:mt-0">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">{profile.location}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">{profile.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">{profile.phone}</span>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Bio</h2>
            {!isEditing ? (
              <>
                <p className="mt-1 text-sm text-gray-500">{profile.bio}</p>
                <div className="mt-4 flex gap-3">
                  <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-green-600 text-white rounded-md">Edit Profile</button>
                  <button onClick={openCreateVlog} className="px-4 py-2 bg-blue-600 text-white rounded-md">Create Post</button>
                </div>
              </>
            ) : (
              <div className="mt-4 space-y-3">
                {'firstName' in (editForm || {}) && (
                  <div>
                    <label className="text-sm text-gray-700">First Name</label>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={editForm?.firstName || ''} onChange={(e) => setEditForm({ ...(editForm || {}), firstName: e.target.value })} />
                  </div>
                )}
                {'lastName' in (editForm || {}) && (
                  <div>
                    <label className="text-sm text-gray-700">Last Name</label>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={editForm?.lastName || ''} onChange={(e) => setEditForm({ ...(editForm || {}), lastName: e.target.value })} />
                  </div>
                )}
                {'name' in (editForm || {}) && (
                  <div>
                    <label className="text-sm text-gray-700">Name</label>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={editForm?.name || ''} onChange={(e) => setEditForm({ ...(editForm || {}), name: e.target.value })} />
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-700">Description</label>
                  <textarea className="mt-1 w-full border rounded px-3 py-2" value={editForm?.description || ''} onChange={(e) => setEditForm({ ...(editForm || {}), description: e.target.value })} />
                </div>
                {'city' in (editForm || {}) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm text-gray-700">City</label>
                      <input className="mt-1 w-full border rounded px-3 py-2" value={editForm?.city || ''} onChange={(e) => setEditForm({ ...(editForm || {}), city: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">State</label>
                      <input className="mt-1 w-full border rounded px-3 py-2" value={editForm?.state || ''} onChange={(e) => setEditForm({ ...(editForm || {}), state: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Country</label>
                      <input className="mt-1 w-full border rounded px-3 py-2" value={editForm?.country || ''} onChange={(e) => setEditForm({ ...(editForm || {}), country: e.target.value })} />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-700">Domains (comma separated)</label>
                  <input className="mt-1 w-full border rounded px-3 py-2" value={(editForm?.domain || editForm?.domains) || ''} onChange={(e) => setEditForm({ ...(editForm || {}), domain: e.target.value, domains: e.target.value })} />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleUpdateProfile} className="px-4 py-2 bg-green-600 text-white rounded-md">Save</button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('vlogs')}
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'vlogs'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vlogs
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'events'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Events
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'activities'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Activities
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'stats'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Stats
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {activeTab === 'vlogs' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Vlogs</h2>
              {vlogs.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No vlogs yet</p>
                  <button onClick={openCreateVlog} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md">Create Vlog</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vlogs.map((vlog) => (
                    <div key={vlog._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                      <div className="p-4">
                        <h3 className="text-md font-medium text-gray-900">{vlog.title}</h3>
                        <p className="mt-2 text-sm text-gray-700">{vlog.description}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Tag className="mr-1.5 h-4 w-4 text-gray-400" />
                          {vlog.domain}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Events</h2>
              {events.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No events yet</p>
                  <button onClick={openCreateEvent} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md">Create Event</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.map((event) => (
                    <div key={event.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                      <div className="h-40 relative">
                        {event.image && (
                          <Image src={event.image || '/default-event.jpg'} alt={event.title || 'Event'} fill style={{ objectFit: 'cover' }} />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-md font-medium text-gray-900">{event.title}</h3>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
                          {event.date}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <MapPin className="mr-1.5 h-4 w-4 text-gray-400" />
                          {event.locationText || (typeof event.location === 'string' ? event.location : `${event.location?.district ?? ''}, ${event.location?.state ?? ''}, ${event.location?.country ?? ''}`.replace(/,\s*,/g, ',').replace(/(^,\s*|,\s*$)/g, ''))}
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                          <Link href={`/event/${event.id}`} className="text-sm font-medium text-green-600 hover:text-green-500">
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activities' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h2>
              <div className="flow-root">
                <ul className="-mb-8">
                  {activities.map((activity, activityIdx) => (
                    <li key={activityIdx}>
                      <div className="relative pb-8">
                        {activityIdx !== activities.length - 1 ? (
                          <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                              {activity.icon}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <div className="text-sm">
                                {activity.type === 'volunteer' && (
                                  <span className="font-medium text-gray-900">
                                    You volunteered for <span className="font-semibold text-green-600">{activity.event}</span>
                                  </span>
                                )}
                                {activity.type === 'like' && (
                                  <span className="font-medium text-gray-900">
                                    You liked <span className="font-semibold text-green-600">{activity.post}</span>
                                  </span>
                                )}
                                {activity.type === 'comment' && (
                                  <span className="font-medium text-gray-900">
                                    You commented on <span className="font-semibold text-green-600">{activity.post}</span>
                                  </span>
                                )}
                                {activity.type === 'post' && (
                                  <span className="font-medium text-gray-900">
                                    You posted <span className="font-semibold text-green-600">{activity.title}</span>
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-sm text-gray-500">{activity.date}</p>
                            </div>
                            {activity.type === 'comment' && (
                              <div className="mt-2 text-sm text-gray-700">
                                <p>&quot;{activity.comment}&quot;</p>
                              </div>
                            )}
                            {activity.type === 'post' && (
                              <div className="mt-2 text-sm text-gray-700">
                                <p>{activity.content}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Statistics</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {stat.icon}
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                      <div className="text-sm">
                        <a href="#" className="font-medium text-green-600 hover:text-green-500">
                          View all
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {isAddPostOpen && <CreatePostModal />}
    </div>
  );
}