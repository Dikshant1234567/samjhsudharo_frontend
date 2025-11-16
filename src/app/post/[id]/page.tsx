'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../component/commonComp/navbar/Navbar';
import VolunteerRegistration from '@/component/events/VolunteerRegistration';
import { Heart, MessageCircle, Share2, Users, Calendar, MapPin, Tag, Send, ArrowLeft } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    profileImage?: string;
  };
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  description: string;
  location: string;
  domain: string;
  postType: 'insight' | 'event';
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
  comments: Comment[];
  createdAt: string;
  isLiked: boolean;
}

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // const token = sessionStorage.getItem('userToken');
      // const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to fetch post details');
      // }
      
      // const data = await response.json();
      // setPost(data.post);

      // Mock data for development
      const mockPost: Post = {
        id: postId,
        title: 'Beach Cleanup Drive in Mumbai',
        description: 'Join us for a beach cleanup drive at Juhu Beach. Let\'s make our beaches clean and safe for everyone. We need volunteers to help collect plastic waste and educate visitors about the importance of keeping our beaches clean.\n\nWe will provide gloves, bags, and refreshments. Please wear comfortable clothes and bring a water bottle.',
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
        comments: [
          {
            id: '1',
            content: 'This is a great initiative! I\'ll be there with my friends.',
            author: {
              id: '201',
              name: 'Priya Sharma',
              profileImage: 'https://randomuser.me/api/portraits/women/1.jpg'
            },
            createdAt: '2023-07-29T10:30:00Z'
          },
          {
            id: '2',
            content: 'I participated in the last cleanup drive. It was a wonderful experience!',
            author: {
              id: '202',
              name: 'Raj Patel',
              profileImage: 'https://randomuser.me/api/portraits/men/2.jpg'
            },
            createdAt: '2023-07-30T14:20:00Z'
          },
          {
            id: '3',
            content: 'Will there be any transportation arranged from the city center?',
            author: {
              id: '203',
              name: 'Anita Desai',
              profileImage: 'https://randomuser.me/api/portraits/women/3.jpg'
            },
            createdAt: '2023-07-31T09:15:00Z'
          }
        ],
        createdAt: '2023-07-28T10:30:00Z',
        isLiked: false
      };
      
      setPost(mockPost);
    } catch (err) {
      console.error('Error fetching post details:', err);
      setError('Failed to load post details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    
    try {
      // In a real app, this would be an API call
      // const token = sessionStorage.getItem('userToken');
      // const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      
      // if (response.ok) {
      //   setPost({
      //     ...post,
      //     likes: post.isLiked ? post.likes - 1 : post.likes + 1,
      //     isLiked: !post.isLiked
      //   });
      // }

      // Mock implementation for development
      setPost({
        ...post,
        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        isLiked: !post.isLiked
      });
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newComment.trim() || submittingComment) return;
    
    setSubmittingComment(true);
    try {
      // In a real app, this would be an API call
      // const token = sessionStorage.getItem('userToken');
      // const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ content: newComment })
      // });
      
      // if (response.ok) {
      //   const data = await response.json();
      //   setPost({
      //     ...post,
      //     comments: [...post.comments, data.comment]
      //   });
      //   setNewComment('');
      // }

      // Mock implementation for development
      const newCommentObj: Comment = {
        id: `temp-${Date.now()}`,
        content: newComment,
        author: {
          id: 'current-user',
          name: 'Current User',
          profileImage: 'https://randomuser.me/api/portraits/men/4.jpg'
        },
        createdAt: new Date().toISOString()
      };
      
      setPost({
        ...post,
        comments: [...post.comments, newCommentObj]
      });
      setNewComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!post || post.postType !== 'event') return;
    
    // Open volunteer registration modal instead of direct join
    setShowVolunteerModal(true);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-red-500 mb-4">{error || 'Post not found'}</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Go Back
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-green-600 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Back</span>
        </button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Post Header */}
          <div className="p-4 flex items-center space-x-3 border-b border-gray-100">
            <div className="relative h-12 w-12 rounded-full overflow-hidden">
              {post.author.profileImage ? (
                <Image 
                  src={post.author.profileImage} 
                  alt={post.author.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">{post.author.name.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <Link href={`/profile/${post.author.id}`} className="font-medium text-gray-900 hover:underline">
                {post.author.name}
              </Link>
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
          <div className="p-4">
            <h1 className="text-2xl font-semibold mb-3">{post.title}</h1>
            <div className="whitespace-pre-line text-gray-700 mb-4">{post.description}</div>
            
            {/* Post Metadata */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{post.location}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                <Tag className="h-4 w-4 mr-1" />
                <span>{post.domain}</span>
              </div>
              
              {post.postType === 'event' && (
                <>
                  <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{post.date} at {post.time}</span>
                  </div>
                  
                  {post.volunteerCount && post.volunteerCount > 0 && (
                    <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
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
            <div className="relative h-96 w-full">
              <Image 
                src={post.images[0]} 
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          {/* Post Actions */}
          <div className="px-4 py-3 border-t border-b border-gray-100 flex justify-between">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-1 ${post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
              <MessageCircle className="h-5 w-5" />
              <span>{post.comments.length} comments</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500">
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </button>
            
            {post.postType === 'event' && (
              <button 
                onClick={handleJoinEvent}
                className="flex items-center space-x-1 text-white bg-green-500 px-4 py-1 rounded-md hover:bg-green-600"
              >
                <Users className="h-4 w-4" />
                <span>Join Event</span>
              </button>
            )}
          </div>
          
          {/* Comments Section */}
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            
            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex items-start space-x-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden">
                  <Image 
                    src="https://randomuser.me/api/portraits/men/4.jpg" 
                    alt="Your profile"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    rows={2}
                  />
                  <button 
                    type="submit"
                    disabled={!newComment.trim() || submittingComment}
                    className="absolute right-3 bottom-3 text-green-500 hover:text-green-600 disabled:text-gray-400"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </form>
            
            {/* Comments List */}
            <div className="space-y-4">
              {post.comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
              ) : (
                post.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden">
                      {comment.author.profileImage ? (
                        <Image 
                          src={comment.author.profileImage} 
                          alt={comment.author.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">{comment.author.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <Link href={`/profile/${comment.author.id}`} className="font-medium text-gray-900 hover:underline">
                            {comment.author.name}
                          </Link>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                      <div className="mt-1 ml-2 flex items-center space-x-3 text-sm text-gray-500">
                        <button className="hover:text-gray-700">Like</button>
                        <button className="hover:text-gray-700">Reply</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}