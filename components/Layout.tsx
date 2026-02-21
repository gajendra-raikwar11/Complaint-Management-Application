
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.FC | React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onShowDocs: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onShowNotif: () => void;
  hasUnreadNotif: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  onLogout, 
  onShowDocs, 
  isDarkMode, 
  setIsDarkMode,
  onShowNotif,
  hasUnreadNotif
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return <>{children}</>;

  const navItems = [
    { label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
    )},
    { label: 'Analytics', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
    ), hidden: user.role !== UserRole.ADMIN },
    { label: 'Settings', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    )}
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col sticky top-0 h-screen z-40">
        <div className="p-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200 dark:shadow-none">
              E
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">EduResolve</h1>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Portal v2.0</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.filter(i => !i.hidden).map((item, idx) => (
            <button 
              key={idx}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${idx === 0 ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          
          <button 
            onClick={onShowDocs}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>MERN Docs</span>
          </button>
        </nav>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all font-bold text-xs flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 z-[60] transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Same content as desktop sidebar but with close button */}
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">E</div>
            <h1 className="font-black dark:text-white">EduResolve</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 text-2xl">&times;</button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.filter(i => !i.hidden).map((item, idx) => (
            <button 
              key={idx}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${idx === 0 ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          
          <button 
            onClick={() => { onShowDocs(); setIsMobileMenuOpen(false); }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-emerald-600 dark:text-emerald-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>MERN Docs</span>
          </button>
        </nav>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800">
          <button 
            onClick={onLogout}
            className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl font-bold text-xs flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <div className="hidden lg:block">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Session: {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsDarkMode()}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? '🌞' : '🌙'}
            </button>
            <button 
              onClick={onShowNotif}
              className="relative p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              {hasUnreadNotif && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-gray-900"></span>
              )}
            </button>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>
            <div className="hidden sm:flex items-center space-x-3 pl-1">
               <div className="text-right">
                 <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">{user.name}</p>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{user.role}</p>
               </div>
               <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-100 dark:shadow-none">
                 {user.name.charAt(0)}
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
