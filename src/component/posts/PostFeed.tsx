'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Heart, MessageCircle, Share2, Users, Calendar, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Post {
  id: string;
  title: string;
  description: string;
  location: string;
  domain: string;
  postType: 'vlog' | 'event';
  date?: string;
  time?: string;
  volunteerCount?: number;
  images: string[];
  author: {
    id: string;
    name: string;
    profileImage?: string;
    isOrganization: boolean;
    rating?: number;
  };
  likes: number;
  comments: number;
  createdAt: string;
  isLiked: boolean;
}

type BackendAuthor = {
  _id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
} | undefined;

type BackendLocation = {
  district?: string;
  state?: string;
  country?: string;
} | undefined;

interface BackendPost {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  location?: BackendLocation;
  locationText?: string;
  domain?: string;
  postType?: 'event' | 'vlog';
  date?: string;
  time?: string;
  volunteers?: unknown[];
  images?: string[];
  author?: BackendAuthor;
  likes?: unknown[];
  comments?: unknown[];
  createdAt?: string;
}

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'vlogs' | 'events'>('all');
  const [domainFilter, setDomainFilter] = useState<string>('');
  // Use backend via Next.js rewrite; fallback to mock data on error

  const socialDomains = [
    "Education and Literacy",
    "Health and Sanitation",
    "Environment and Sustainability",
    "Poverty Alleviation",
    "Human Rights and Equality",
    "Child and Youth Welfare",
    "Elderly and Disabled Care",
    "Rural Development",
    "Disaster Relief",
    "Digital Empowerment"
  ];

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('userToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const fetchFrom = async (url: string) => {
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`Failed: ${url}`);
        const data = await res.json();
        return Array.isArray(data) ? data : Array.isArray((data as { posts?: BackendPost[] })?.posts) ? (data as { posts?: BackendPost[] }).posts ?? [] : [];
      };

      let rawPosts: BackendPost[] = [];
      if (filter === 'events') {
        rawPosts = await fetchFrom('/api/post-events' + (domainFilter ? `?domain=${encodeURIComponent(domainFilter)}` : ''));
      } else if (filter === 'vlogs') {
        rawPosts = await fetchFrom('/api/post-vlogs' + (domainFilter ? `?domain=${encodeURIComponent(domainFilter)}` : ''));
      } else {
        const [events, vlogs] = await Promise.all([
          fetchFrom('/api/post-events' + (domainFilter ? `?domain=${encodeURIComponent(domainFilter)}` : '')),
          fetchFrom('/api/post-vlogs' + (domainFilter ? `?domain=${encodeURIComponent(domainFilter)}` : '')),
        ]);
        rawPosts = [...events, ...vlogs];
      }
      if (!rawPosts.length) {
        setPosts(mockPosts);
        setError('');
      } else {
        const mapped: Post[] = rawPosts.map((p: BackendPost) => {
          const authorObj = p.author as BackendAuthor | undefined;
          const authorId =
            typeof p.author === 'string'
              ? String(p.author)
              : String(authorObj?._id ?? '');
          const authorName =
            (authorObj?.name ??
            `${authorObj?.firstName ?? ''} ${authorObj?.lastName ?? ''}`.trim()) ||
            'Unknown';
          return {
            id: String(p._id ?? p.id ?? ''),
            title: String(p.title ?? ''),
            description: String(p.description ?? ''),
            location: p.locationText ?? (p.location ? `${p.location.district ?? ''}${p.location.state ? ', ' + p.location.state : ''}` : ''),
            domain: String(p.domain ?? ''),
            postType: p.date || p.time ? 'event' : 'vlog',
            date: p.date,
            time: p.time,
            volunteerCount: Array.isArray(p.volunteers) ? p.volunteers.length : undefined,
            images: Array.isArray(p.images) ? p.images : [],
            author: {
              id: authorId,
              name: authorName,
              isOrganization: false,
            },
            likes: Array.isArray(p.likes) ? p.likes.length : 0,
            comments: Array.isArray(p.comments) ? p.comments.length : 0,
            createdAt: String(p.createdAt ?? new Date().toISOString()),
            isLiked: false,
          };
        });
        setPosts(mapped);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setPosts(mockPosts);
      setError('');
    } finally {
      setLoading(false);
    }
  }, [filter, domainFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);


  const handleLike = async (postId: string) => {
    try {
      const token = sessionStorage.getItem('userToken');
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update the post in the state
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked
            };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  // Mock data for development
  const mockPosts: Post[] = useMemo(() => ([
    {
      id: '1',
      title: 'Beach Cleanup Drive in Mumbai',
      description: 'Join us for a beach cleanup drive at Juhu Beach. Let\'s make our beaches clean and safe for everyone.',
      location: 'Juhu Beach, Mumbai',
      domain: 'Environment and Sustainability',
      postType: 'event',
      date: '2023-08-15',
      time: '09:00',
      volunteerCount: 50,
      images: ['https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
      author: {
        id: '101',
        name: 'Clean Earth NGO',
        profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
        isOrganization: true,
        rating: 4.8
      },
      likes: 120,
      comments: 24,
      createdAt: '2023-07-28T10:30:00Z',
      isLiked: false
    },
    {
      id: '2',
      title: 'Education Crisis in Rural Maharashtra',
      description: 'Many children in rural Maharashtra lack access to quality education. Here\'s what we observed during our recent visit.',
      location: 'Pune District, Maharashtra',
      domain: 'Education and Literacy',
        postType: 'vlog',
      images: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1022&q=80'],
      author: {
        id: '102',
        name: 'Rahul Sharma',
        profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
        isOrganization: false
      },
      likes: 85,
      comments: 32,
      createdAt: '2023-07-25T14:20:00Z',
      isLiked: true
    },
    {
      id: '3',
      title: 'Free Health Checkup Camp',
      description: 'We are organizing a free health checkup camp for underprivileged communities. Services include general health, eye checkup, and dental care.',
      location: 'Dharavi, Mumbai',
      domain: 'Health and Sanitation',
      postType: 'event',
      date: '2023-08-20',
      time: '10:00',
      volunteerCount: 20,
      images: ['https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'],
      author: {
        id: '103',
        name: 'HealthFirst Foundation',
        profileImage: 'https://randomuser.me/api/portraits/women/3.jpg',
        isOrganization: true,
        rating: 4.9
      },
      likes: 210,
      comments: 45,
      createdAt: '2023-07-30T09:15:00Z',
      isLiked: false
    }
  ]), []);

  // Stop auto-setting mock posts; rely on fetchPosts with fallback

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchPosts}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setFilter('vlogs')}
            className={`px-4 py-2 rounded-md ${
              filter === 'vlogs' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Vlogs
          </button>
          <button
            onClick={() => setFilter('events')}
            className={`px-4 py-2 rounded-md ${
              filter === 'events' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Events
          </button>
        </div>
        
        <div className="w-full sm:w-auto">
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Domains</option>
            {socialDomains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-8">
        {posts.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No posts found. Try changing your filters or check back later.</p>
          </div>
        ) : (
          posts.map((post) => {
            const authorId = post.author?.id || undefined;
            const authorName = post.author?.name || 'Anonymous';
            return (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Post Header */}
                <div className="p-4 flex items-center space-x-3">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    {post.author.profileImage ? (
                      <Image 
                        src={post.author.profileImage} 
                        alt={authorName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">{(authorName || 'A').charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    {authorId ? (
                      <Link href={`/profile/${authorId}`} className="font-medium text-gray-900 hover:underline">
                        {authorName}
                      </Link>
                    ) : (
                      <span className="font-medium text-gray-900">{authorName}</span>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      {post.author.isOrganization && post.author.rating && (
                        <div className="ml-2 flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1">{post.author.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-100">
                    {post.postType === 'event' ? (
                      <Calendar className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Tag className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-xs font-medium capitalize">
                      {post.postType}
                    </span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-2">
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-gray-700 mb-3">{post.description}</p>
                  
                  {/* Post Metadata */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{post.location}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Tag className="h-4 w-4 mr-1" />
                      <span>{post.domain}</span>
                    </div>
                    
                    {post.postType === 'event' && (
                      <>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{post.date}</span>
                        </div>
                        
                        {post.volunteerCount && post.volunteerCount > 0 && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{post.volunteerCount} volunteers needed</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className="relative h-64 w-full">
                    <Image 
                      src={post.images[0]} 
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                {/* Post Actions */}
                <div className="px-4 py-3 border-t border-gray-100 flex justify-between">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1 ${post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                  >
                    <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes}</span>
                  </button>
                  
                  <Link href={`/post/${post.id}`} className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comments}</span>
                  </Link>
                  
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500">
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                  
                  {post.postType === 'event' && (
                    <button className="flex items-center space-x-1 text-white bg-green-500 px-3 py-1 rounded-md hover:bg-green-600">
                      <Users className="h-4 w-4" />
                      <span>Join</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}