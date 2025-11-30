'use client';
import React from 'react';
import { Search, User } from 'lucide-react';
import { ViewType } from '../types';
import Link from 'next/link';

interface HeaderProps {
    currentView: ViewType;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, searchQuery, setSearchQuery }) => {
    return (
        <div className="sticky top-0 z-10 glass px-8 py-4 flex items-center justify-between">
            <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-secondary hover:text-primary transition-all">
                    ←
                </button>
                <button className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-secondary hover:text-primary transition-all">
                    →
                </button>
            </div>

            {currentView === 'search' && (
                <div className="flex-1 max-w-md mx-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={20} />
                        <input
                            type="text"
                            placeholder="What do you want to listen to?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-full bg-elevated border-none focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>
            )}

            <Link href='/profile'>
                <button className="w-10 h-10 rounded-full bg-elevated flex items-center justify-center hover:scale-105 transition-all">
                    <User size={20} />
                </button></Link>
        </div>
    );
};

export default Header;