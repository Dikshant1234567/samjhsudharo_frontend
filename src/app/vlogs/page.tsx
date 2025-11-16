"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/component/commonComp/navbar/Navbar";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Vlog = {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId?: string; // added for profile linking
  createdAt: string; // ISO
  category: string;
};

const CATEGORIES = [
  "All",
  "Personal Stories",
  "Event Experiences",
  "Tips & Guides",
  "Inspiration",
  "Education",
  "Healthcare",
  "Environment",
  "Community",
];

const initialVlogs: Vlog[] = [
  {
    id: "v1",
    title: "Why I Joined the Beach Cleanup",
    content:
      "Today I spent my morning at Juhu Beach for a cleanup drive. It was eye-opening to see how much plastic accumulates in just a small stretch. Meeting fellow volunteers reminded me that small actions can add up to big change.",
    author: "John Doe",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    category: "Event Experiences",
  },
  {
    id: "v2",
    title: "Planting Trees with Friends",
    content:
      "We planted 20 saplings in our neighborhood park. The kids were excited to name each one! Hoping to see them grow strong over the next few months.",
    author: "Jane Smith",
    createdAt: new Date().toISOString(),
    category: "Personal Stories",
  },
  {
    id: "v3",
    title: "How to Start a Neighborhood Cleanup",
    content:
      "Practical steps: pick a date, get local permissions if needed, gather supplies (gloves, bags), spread the word, and set clear zones for volunteers.",
    author: "Amit Patel",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    category: "Tips & Guides",
  },
];

export default function VlogsPage() {
  const [vlogs, setVlogs] = useState<Vlog[]>(initialVlogs);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [composeCategory, setComposeCategory] = useState<string>("Personal Stories");
  const enableApi = !!process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  useEffect(() => {
    const fetchVlogs = async () => {
      try {
        const res = await fetch(`/api/post-vlogs`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const posts = Array.isArray(data) ? data : Array.isArray(data?.posts) ? data.posts : [];
        const mapped: Vlog[] = posts.map((p: Record<string, any>) => {
          const authorObj = p.author;
          const authorId =
            typeof authorObj === "string"
              ? String(authorObj)
              : String(authorObj?._id ?? "");
          const authorName =
            typeof authorObj === "string"
              ? "Unknown"
              : (authorObj?.name ??
                 (`${authorObj?.firstName ?? ""} ${authorObj?.lastName ?? ""}`.trim() || "Unknown"));
          return {
            id: String(p._id ?? p.id ?? Math.random()),
            title: p.title ?? "Untitled",
            content: p.description ?? p.content ?? "",
            author: authorName ?? (typeof window !== "undefined" ? sessionStorage.getItem("userName") || "Anonymous" : "Anonymous"),
            authorId: authorId || undefined, // added
            createdAt: p.createdAt ?? new Date().toISOString(),
            category: p.domain ?? "Personal Stories",
          };
        });
        if (mapped.length > 0) setVlogs(mapped);
        setError("");
      } catch (err) {
        console.error("Failed to fetch vlogs:", err);
        setError("");
      }
    };
    fetchVlogs();
  }, [enableApi]);

  useEffect(() => {
    const id = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
    if (!id) router.push('/login');
  }, [router]);

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please add a title and some content.");
      return;
    }
    setPosting(true);
    try {
      const authorName = (typeof window !== "undefined" ? sessionStorage.getItem("userName") : null) || "Anonymous";
      const authorId = typeof window !== "undefined" ? sessionStorage.getItem("userId") ?? undefined : undefined;
      const newVlog: Vlog = {
        id: "v-" + Math.random().toString(36).slice(2, 9),
        title: title.trim(),
        content: content.trim(),
        author: authorName,
        authorId, // added
        createdAt: new Date().toISOString(),
        category: composeCategory,
      };

      if (enableApi) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const token = typeof window !== "undefined" ? sessionStorage.getItem("userToken") : null;
        try {
          const res = await fetch(`${baseUrl}/api/posts`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              title: newVlog.title,
              description: newVlog.content,
              type: "insight", // align with existing content types
              domain: newVlog.category,
            }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } catch (err) {
          console.warn("API post failed, storing locally:", err);
        }
      }

      setVlogs((prev) => [newVlog, ...prev]);
      setTitle("");
      setContent("");
      toast.success("Your vlog has been posted.");
      setError("");
    } catch (err) {
      console.error("Post vlog error:", err);
      toast.error("Could not post your vlog. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleEnhanceWithAI = async () => {
    if (!title.trim() && !content.trim()) {
      toast.error("Add a title or some content first.");
      return;
    }
    setEnhancing(true);
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, tone: "friendly" }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      const data = await res.json();
      setTitle(String(data.title ?? title));
      setContent(String(data.content ?? content));
      setAiSummary(String(data.summary ?? ''));
      if (data.note) { toast.success(String(data.note)); } // surface fallback reason
      toast.success("Enhanced with AI.");
    } catch (err) {
      console.error("AI enhance error:", err);
      toast.error("Could not enhance with AI. Please try again.");
    } finally {
      setEnhancing(false);
    }
  };
  const [enhancing, setEnhancing] = useState(false);   // added
  const [aiSummary, setAiSummary] = useState<string>(""); // added

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vlogs</h1>
          <p className="text-gray-600 mt-2">Share your thoughts and experiences; browse by type.</p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
            
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                selectedCategory === cat
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Compose box */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-8">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={composeCategory}
              onChange={(e) => setComposeCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full border border-gray-200 rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What’s on your mind? Share your experience..."
            rows={5}
            className="w-full border border-gray-200 rounded-md px-3 py-2 mb-3 resize-y focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="flex items-center justify-between">
            <button
              onClick={handleEnhanceWithAI}
              disabled={enhancing}
              className="px-4 py-2 rounded-md border text-sm bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {enhancing ? "Enhancing..." : "Enhance with AI"}
            </button>
            <button
              onClick={handlePost}
              disabled={posting}
              className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 disabled:opacity-60"
            >
              {posting ? "Posting..." : "Post Vlog"}
            </button>
          </div>

          {aiSummary && (
            <div className="mt-3 text-sm">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                AI Summary
              </span>
              <p className="mt-2 text-gray-700">{aiSummary}</p>
            </div>
          )}
        </div>

        {/* Vlog list */}
        <div className="space-y-4">
          {(selectedCategory === "All" ? vlogs : vlogs.filter((v) => v.category === selectedCategory)).map((vlog) => (
            <article key={vlog.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-900">{vlog.title}</h2>
              <p className="mt-1 text-sm text-gray-500">
                By {vlog.authorId ? (
                  <Link href={`/profile/${vlog.authorId}`} className="text-green-600 hover:text-green-700 font-medium">
                    {vlog.author}
                  </Link>
                ) : (
                  <span className="font-medium">{vlog.author}</span>
                )}{" "}
                • {formatDateStable(vlog.createdAt)} • {vlog.category}
              </p>
              <p className="mt-3 text-gray-700 whitespace-pre-line">{vlog.content}</p>
            </article>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </>
  );
}


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