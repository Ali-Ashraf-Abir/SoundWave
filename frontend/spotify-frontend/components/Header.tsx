'use client';

import React from 'react';
import { Search, User, Menu } from 'lucide-react';
import { ViewType } from '../types';
import Link from 'next/link';

interface HeaderProps {
  currentView: ViewType;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, searchQuery, setSearchQuery, onMenuClick }) => {
  return (
    <div className="sticky top-0 z-10 glass px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 rounded-full bg-elevated flex items-center justify-center text-secondary hover:text-primary transition-all"
        >
          <Menu size={24} />
        </button>

        <div className="hidden sm:flex gap-2">
          <button className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-secondary hover:text-primary transition-all">
            ←
          </button>
          <button className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-secondary hover:text-primary transition-all">
            →
          </button>
        </div>
      </div>

      {currentView === 'search' && (
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={20} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-elevated border-none focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
            />
          </div>
        </div>
      )}

      <Link href='/profile'>
        <button className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center hover:scale-105 transition-all flex-shrink-0">
          <User size={20} />
        </button></Link>
    </div>
  );
};

export default Header;