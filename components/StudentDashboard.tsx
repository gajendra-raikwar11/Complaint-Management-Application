
import React, { useState } from 'react';
import { Complaint, ComplaintStatus, User, ComplaintCategory, Priority } from '../types';
import ComplaintForm from './ComplaintForm';

interface StudentDashboardProps {
  complaints: Complaint[];
  onSubmitComplaint: (data: { title: string; category: ComplaintCategory; priority: Priority; description: string }) => void;
  user: User;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ complaints, onSubmitComplaint, user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'new' | 'history'>('overview');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const studentComplaints = complaints.filter(c => c.studentId === user.id);
  
  const stats = {
    total: studentComplaints.length,
    pending: studentComplaints.filter(c => c.status === ComplaintStatus.PENDING).length,
    resolved: studentComplaints.filter(c => c.status === ComplaintStatus.RESOLVED).length,
    inProgress: studentComplaints.filter(c => c.status === ComplaintStatus.IN_PROGRESS).length,
  };

  const getStatusStyle = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case ComplaintStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700 border-blue-200';
      case ComplaintStatus.RESOLVED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case ComplaintStatus.REJECTED: return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome back, {user.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your campus concerns and track resolutions.</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl self-start">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'new' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            New Ticket
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'history' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            History
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Filed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-1">Pending</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="text-blue-500 text-xs font-bold uppercase tracking-wider mb-1">In Progress</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="text-emerald-500 text-xs font-bold uppercase tracking-wider mb-1">Resolved</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.resolved}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Tickets</h3>
              <div className="space-y-4">
                {studentComplaints.slice(0, 5).map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => { setSelectedComplaint(c); setActiveTab('history'); }}
                    className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{c.title}</h4>
                        <div className="flex items-center space-x-2 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                          <span>{c.category}</span>
                          <span>•</span>
                          <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${getStatusStyle(c.status)}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{c.description}</p>
                  </div>
                ))}
                {studentComplaints.length === 0 && (
                  <div className="p-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                    <p className="text-gray-400 text-sm">No recent activity to show.</p>
                    <button 
                      onClick={() => setActiveTab('new')}
                      className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
                    >
                      File your first ticket
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions / Tips */}
            <div className="space-y-6">
              <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                <h4 className="font-bold text-lg mb-2">Need Help?</h4>
                <p className="text-indigo-100 text-sm mb-4">Our AI-powered system helps prioritize your concerns for faster resolution.</p>
                <button 
                  onClick={() => setActiveTab('new')}
                  className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors"
                >
                  Create New Ticket
                </button>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Resolution Tips</h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-indigo-500 mt-1">✔</span>
                    <span>Be specific with dates and locations.</span>
                  </li>
                  <li className="flex items-start space-x-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-indigo-500 mt-1">✔</span>
                    <span>Attach photos if applicable (coming soon).</span>
                  </li>
                  <li className="flex items-start space-x-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-indigo-500 mt-1">✔</span>
                    <span>Check for similar resolved issues.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'new' && (
        <div className="max-w-2xl mx-auto">
          <ComplaintForm onSubmit={(data) => { onSubmitComplaint(data); setActiveTab('overview'); }} />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ticket History</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {studentComplaints.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedComplaint(c)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedComplaint?.id === c.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-indigo-100'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate pr-2 text-sm">{c.title}</h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${getStatusStyle(c.status)}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
              {studentComplaints.length === 0 && (
                <p className="text-center text-gray-400 py-10">No history found.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedComplaint ? (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedComplaint.title}</h2>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{selectedComplaint.category}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Priority: {selectedComplaint.priority}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-4 py-1.5 rounded-full border ${getStatusStyle(selectedComplaint.status)}`}>
                    {selectedComplaint.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl mb-8 border border-gray-100 dark:border-gray-800">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mb-4">{selectedComplaint.description}</p>
                  {selectedComplaint.attachmentUrl && (
                    <div className="mt-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Attachment</p>
                      <img 
                        src={selectedComplaint.attachmentUrl} 
                        alt="Attachment" 
                        className="max-w-full h-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm" 
                      />
                    </div>
                  )}
                </div>

                {selectedComplaint.aiSummary && (
                  <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                    <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">AI Summary</h5>
                    <p className="text-sm text-indigo-900 dark:text-indigo-300 italic">"{selectedComplaint.aiSummary}"</p>
                  </div>
                )}

                <div className="space-y-6">
                  <h4 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Conversation</h4>
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedComplaint.comments.length === 0 && (
                      <p className="text-center text-gray-400 text-sm py-4">No responses yet. We'll notify you when an admin replies.</p>
                    )}
                    {selectedComplaint.comments.map(comment => (
                      <div key={comment.id} className={`flex ${comment.authorRole === 'ADMIN' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${comment.authorRole === 'ADMIN' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-200 rounded-tl-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tr-none'}`}>
                          <div className="flex justify-between items-center mb-1 gap-4">
                            <span className="text-[10px] font-bold uppercase opacity-60">{comment.authorName}</span>
                            <span className="text-[9px] opacity-40">{new Date(comment.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Select a ticket to view details</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto mt-2">Choose from your history on the left to see status updates and conversation logs.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
