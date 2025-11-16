"use client"

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setAddPostModalOpen, setAddPostType } from "@/lib/slices/modalSlice";
import { useRouter } from "next/navigation";

const AddPostModal: React.FC = () => {
  const socialWelfareDomains = [
    "Education and Literacy",
    "Health and Sanitation",
    "Environment and Sustainability",
    "Poverty Alleviation and Livelihood",
    "Human Rights and Equality",
    "Child and Youth Welfare",
    "Elderly and Disabled Care",
    "Rural and Community Development",
    "Disaster Relief and Emergency Aid",
    "Technology and Digital Empowerment",
  ];
const CATEGORIES = [  
  "Personal Stories",
  "Event Experiences",
  "Tips & Guides",
  "Inspiration",
  "Education",
  "Healthcare",
  "Environment",
  "Community",
];
  const [vlogCategory, setVlogCategory] = React.useState('');

  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.modal.isAddPostModalOpen);
  const addPostType = useAppSelector((state) => state.modal.addPostType);
  
  const onClose = () => {
    dispatch(setAddPostModalOpen(false));
    dispatch(setAddPostType(null));
  };
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
    const userType = typeof window !== 'undefined' ? sessionStorage.getItem('userType') : null;
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('userToken') : null;

    if (!userId || !userType) {
      router.push('/login');
      return;
    }
    const authorModel = userType === 'individual' ? 'individual_user' : 'ngo';

    try {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData(form);

      const endpoint = addPostType === 'event' ? '/api/post-events' : '/api/post-vlogs';
      let body: Record<string, unknown> = {};

      if (addPostType === 'vlog') {
        const description = String(formData.get('vlog_area') || '').trim();
        const domain = String(formData.get('vlogCategory') || 'Personal Stories');
        const title = description ? description.slice(0, 60) : 'Untitled Vlog';
        body = {
          title,
          description,
          author: userId,
          authorModel,
          domain,
          images: [],
        };
      } else if (addPostType === 'event') {
        const domain = String(formData.get('eventDomain') || '');
        const description = String(formData.get('eventDescription') || '').trim();
        const reason = String(formData.get('eventReason') || '').trim();
        const title = String(formData.get('eventTitle') || '') || (description ? description.slice(0, 60) : 'Untitled Event');
        const date = String(formData.get('eventDate') || '');
        const time = String(formData.get('eventTime') || '');
        const requiredVolunteers = Number(formData.get('eventMinVolunteers') || 0);

        body = {
          title,
          description: reason ? `${description}\n\nReason: ${reason}` : description,
          author: userId,
          authorModel,
          domain,
          date,
          time,
          requiredVolunteers,
          images: [],
          status: 'active',
          priority: 'medium',
        };
      } else {
        alert('Please select a post type.');
        return;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to create ${addPostType}`);
      }

      // Close modal and reflect changes
      onClose();
      router.push('/profile');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Failed to post activity');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-transparent backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-[1px] border-black"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">{addPostType === 'event' ? 'Post Event' : addPostType === 'vlog' ? 'Post vlog' : 'Post Activity'}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {addPostType === 'vlog' && (
                  <>
                    <div>
                      <label htmlFor="vlogImage" className="block text-sm font-medium text-gray-700 mb-2">
                        Image
                      </label>
                      <input
                        type="file"
                        id="vlogImage"
                        name="vlogImage"
                        accept="image/*"
                        className="w-full"
                      />
                    </div>
                  <div>
                    <select name="vlogCategory" id="vlogCategory">
                      <option value="">Select Category</option>
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                    <div>
                      <label htmlFor="vlog_area" className="block text-sm font-medium text-gray-700 mb-2">
                        Write your thoughts
                      </label>
                      <textarea
                        id="vlog_area"
                        name="vlog_area"
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        placeholder="Share your vlog..."
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Post vlog
                      </button>
                    </div>
                  </>
                )}

                {addPostType === 'event' && (
                  <>
                    <div>
                      <label htmlFor="eventTitle" className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        id="eventTitle"
                        name="eventTitle"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Event title"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="eventDomain" className="block text-sm font-medium text-gray-700 mb-2">
                        Type of domain
                      </label>
                      <select
                        id="eventDomain"
                        name="eventDomain"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select a domain
                        </option>
                        {socialWelfareDomains.map((domain) => (
                          <option key={domain} value={domain}>
                            {domain}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        id="eventDescription"
                        name="eventDescription"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        placeholder="Describe the event..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          id="eventDate"
                          name="eventDate"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700 mb-2">
                          Time
                        </label>
                        <input
                          type="time"
                          id="eventTime"
                          name="eventTime"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="eventMinVolunteers" className="block text-sm font-medium text-gray-700 mb-2">
                        Min number of volunteers required
                      </label>
                      <input
                        type="number"
                        id="eventMinVolunteers"
                        name="eventMinVolunteers"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter minimum volunteers required"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="eventReason" className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for the event
                      </label>
                      <textarea
                        id="eventReason"
                        name="eventReason"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        placeholder="Why is this event needed?"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="eventImage" className="block text-sm font-medium text-gray-700 mb-2">
                        Image
                      </label>
                      <input
                        type="file"
                        id="eventImage"
                        name="eventImage"
                        accept="image/*"
                        className="w-full"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Post Event
                      </button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddPostModal;
