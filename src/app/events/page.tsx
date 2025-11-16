"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/component/commonComp/navbar/Navbar";
import VolunteerRegistration from "@/component/events/VolunteerRegistration";
import { useRouter } from "next/navigation";

type EventItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  domain: string;
  image?: string;
  requiredVolunteers: number;
};

interface BackendEvent {
  _id?: string;
  id?: string | number;
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  locationText?: string;
  location?: { district?: string; state?: string; country?: string };
  domain?: string;
  images?: string[];
  image?: string;
  coverImage?: string;
  requiredVolunteers?: number;
  volunteerCount?: number;
}

const mockEvents: EventItem[] = [
  {
    id: "101",
    title: "Beach Cleanup Drive",
    description:
      "Join us to clean the shoreline and raise awareness about ocean pollution.",
    date: "Dec 12, 2025",
    time: "09:00 AM",
    location: "Juhu Beach, Mumbai",
    domain: "Environment",
    image:
      "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80",
    requiredVolunteers: 30,
  },
  {
    id: "102",
    title: "Tree Plantation Initiative",
    description:
      "Plant saplings across the city parks and contribute to greener neighborhoods.",
    date: "Dec 18, 2025",
    time: "08:30 AM",
    location: "City Park, Ahmedabad",
    domain: "Environment",
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
    requiredVolunteers: 50,
  },
  {
    id: "103",
    title: "Community Health Camp",
    description:
      "Free health check-ups and awareness on hygiene for local communities.",
    date: "Jan 05, 2026",
    time: "10:00 AM",
    location: "Sector 21, Gandhinagar",
    domain: "Healthcare",
    image:
      "https://images.unsplash.com/photo-1586773860415-74c84fba5b06?auto=format&fit=crop&w=1200&q=80",
    requiredVolunteers: 20,
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>(mockEvents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVolunteer, setShowVolunteer] = useState<{
    open: boolean;
    event?: EventItem;
  }>({ open: false });
  const router = useRouter();

  const enableApi = true;

  useEffect(() => {
    const fetchEvents = async () => {
      if (!enableApi) return; // Use mock when API not configured
      setLoading(true);
      try {
        const res = await fetch(`/api/post-events`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const posts = Array.isArray(data) ? data : Array.isArray(data?.posts) ? data.posts : [];
        if (!Array.isArray(posts) || posts.length === 0) {
          setEvents(mockEvents);
        } else {
          const mapped: EventItem[] = posts.map((p: BackendEvent) => ({
            id: String(p._id ?? p.id ?? Math.random()),
            title: String(p.title ?? "Untitled Event"),
            description: String(p.description ?? ""),
            date: String(p.date ?? ""),
            time: String(p.time ?? ""),
            location:
              p.locationText ??
              [p.location?.district, p.location?.state, p.location?.country]
                .filter(Boolean)
                .join(", ") ?? "",
            domain: String(p.domain ?? "General"),
            image: Array.isArray(p.images) ? p.images[0] : p.image ?? p.coverImage ?? undefined,
            requiredVolunteers: Number(p.requiredVolunteers ?? p.volunteerCount ?? 0),
          }));
          setEvents(mapped);
        }
        setError("");
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setEvents(mockEvents);
        setError("");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [enableApi]);

  useEffect(() => {
    const id = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
    if (!id) router.push('/login');
  }, [router]);

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Upcoming Events</h1>
          <p className="text-gray-600 mt-2">Discover community initiatives and join as a volunteer.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {event.image && (
                  <div className="h-40 w-full overflow-hidden">
                    {/* Using img to avoid remotePatterns issues */}
                    <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">{event.domain}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700 line-clamp-3">{event.description}</p>
                  <div className="mt-3 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Date:</span> {event.date} {event.time && `at ${event.time}`}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {event.location}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Link href={`/post/${event.id}`} className="text-green-600 hover:text-green-500 text-sm font-medium">
                      View Details
                    </Link>
                    <button
                      onClick={() => setShowVolunteer({ open: true, event })}
                      className="px-3 py-2 text-sm rounded-md bg-green-500 text-white hover:bg-green-600"
                    >
                      Volunteer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-6 text-sm text-red-600">{error}</div>
        )}
      </div>

      {showVolunteer.open && showVolunteer.event && (
        <VolunteerRegistration
          postId={showVolunteer.event.id}
          eventTitle={showVolunteer.event.title}
          eventDate={showVolunteer.event.date}
          eventTime={showVolunteer.event.time}
          eventLocation={showVolunteer.event.location}
          requiredVolunteers={showVolunteer.event.requiredVolunteers}
          onClose={() => setShowVolunteer({ open: false })}
        />
      )}
    </>
  );
}