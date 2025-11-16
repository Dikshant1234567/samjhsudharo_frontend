"use client"

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Menu, UserRound, X } from "lucide-react";
import { motion } from "framer-motion";
import AddPostModal from "./addPost";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleAddPostModal, setAddPostType } from "@/lib/slices/modalSlice";
import NotificationBell from "./NotificationBell";
import NotificationDrawer from "../../../component/notifications/NotificationDrawer";
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  
  const dispatch = useAppDispatch();
  const { } = useAppSelector((state) => state.modal);

  const toggleMenu = () => setIsOpen(!isOpen);
  const handleToggleAddPostModal = () => dispatch(toggleAddPostModal());
  const handleSelectPostType = (type: 'vlog' | 'event') => {
    dispatch(setAddPostType(type));
    setShowPostMenu(false);
    handleToggleAddPostModal();
    
  };
  React.useEffect(() => {
    const id = typeof window !== 'undefined' ? sessionStorage.getItem('userId') : null;
    setIsLoggedIn(!!id);
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <nav className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo / Brand */}
          <div className="text-2xl font-bold text-white flex items-center">
            <Link href="/" className="flex items-center">
              SamajSudharo
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 relative">
            <Link href="/" className="text-white hover:text-green-100 font-medium transition-colors">
              Home
            </Link>
            <Link href="/events" className={`text-white ${isLoggedIn ? 'hover:text-green-100' : 'opacity-70'} font-medium transition-colors`}
              onClick={(e) => {
                if (!isLoggedIn) { e.preventDefault(); router.push('/login'); }
              }}
            >
              Events
            </Link>
            <Link href="/vlogs" className={`text-white ${isLoggedIn ? 'hover:text-green-100' : 'opacity-70'} font-medium transition-colors`}
              onClick={(e) => {
                if (!isLoggedIn) { e.preventDefault(); router.push('/login'); }
              }}
            >
              Vlogs
            </Link>
            <div className="relative">
              <button
                className={`bg-white text-green-700 px-4 py-2 rounded-full ${isLoggedIn ? 'hover:bg-green-50' : 'opacity-70'} transition-colors font-medium`}
                onClick={() => {
                  if (!isLoggedIn) { router.push('/login'); return; }
                  setShowPostMenu((v) => !v);
                }}
              >
                + Post Activity
              </button>
              {showPostMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-50"
                    onClick={() => handleSelectPostType('vlog')}
                  >
                    Post Vlog
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-t border-gray-200"
                    onClick={() => handleSelectPostType('event')}
                  >
                    Post Event
                  </button>
                </div>
              )}
            </div>
            <Bell 
              className="text-white hover:text-green-100" 
              size={24} 
              aria-hidden
            />
            <Link href="/profile" aria-label="Go to profile">
              <UserRound 
                className={`cursor-pointer text-white ${isLoggedIn ? 'hover:text-green-100' : 'opacity-70'} transition-colors`}
                size={24}
              />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-white">
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            className="md:hidden bg-green-50 shadow-md flex flex-col space-y-3 px-6 py-4"
          >
            <Link
              href="/"
              className="text-green-700 hover:text-green-800 font-medium transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/events"
              className={`text-green-700 ${isLoggedIn ? 'hover:text-green-800' : 'opacity-60'} font-medium transition-colors duration-200`}
              onClick={(e) => {
                setIsOpen(false);
                if (!isLoggedIn) { e.preventDefault(); router.push('/login'); }
              }}
            >
              Events
            </Link>
            <Link
              href="/vlogs"
              className={`text-green-700 ${isLoggedIn ? 'hover:text-green-800' : 'opacity-60'} font-medium transition-colors duration-200`}
              onClick={(e) => {
                setIsOpen(false);
                if (!isLoggedIn) { e.preventDefault(); router.push('/login'); }
              }}
            >
              Vlogs
            </Link>
            <Link
              href="/profile"
              className={`text-green-700 ${isLoggedIn ? 'hover:text-green-800' : 'opacity-60'} font-medium transition-colors duration-200`}
              onClick={(e) => {
                setIsOpen(false);
                if (!isLoggedIn) { e.preventDefault(); router.push('/login'); }
              }}
            >
              Profile
            </Link>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors text-left"
              onClick={() => {
                setIsOpen(false);
                if (!isLoggedIn) { router.push('/login'); return; }
                setShowPostMenu(true);
              }}
            >
              + Post Activity
            </button>
          </motion.div>
        )}
      </nav>
      
      {/* Modals */}
      <AddPostModal />
    </motion.div>
  );
};

export default Navbar;
