
import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintStatus, UserRole, User, Sentiment, AnalyticsReport, ComplaintCategory } from '../types';
import { geminiService } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AdminDashboardProps {
  complaints: Complaint[];
  onUpdateStatus: (id: string, status: ComplaintStatus) => void;
  onAddComment: (id: string, content: string) => void;
  currentUser: User;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ complaints, onUpdateStatus, onAddComment, currentUser }) => {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const categoryData = Object.values(ComplaintCategory).map(cat => ({
    name: cat,
    count: complaints.filter(c => c.category === cat).length
  }));

  const statusData = Object.values(ComplaintStatus).map(status => ({
    name: status.replace('_', ' '),
    value: complaints.filter(c => c.status === status).length
  }));

  const getStatusStyle = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case ComplaintStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700 border-blue-200';
      case ComplaintStatus.RESOLVED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case ComplaintStatus.REJECTED: return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment?: Sentiment) => {
    switch (sentiment) {
      case Sentiment.URGENT: return '🚨';
      case Sentiment.FRUSTRATED: return '😠';
      case Sentiment.CONSTRUCTIVE: return '💡';
      default: return '😐';
    }
  };

  const handleSuggest = async (complaint: Complaint) => {
    setIsLoadingSuggestion(true);
    const text = await geminiService.suggestResponse(complaint);
    setSuggestion(text);
    setIsLoadingSuggestion(false);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    const result = await geminiService.generateAnalytics(complaints);
    setReport(result);
    setIsGeneratingReport(false);
  };

  const handleAddComment = () => {
    if (!commentText || !selectedComplaint) return;
    onAddComment(selectedComplaint.id, commentText);
    setCommentText('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Admin Control Center</h1>
          <p className="text-gray-500 dark:text-gray-400">Monitor campus pulse and resolve student concerns.</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl self-start">
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'list' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Inbox
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'analytics' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            AI Analytics
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Active Issues</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{complaints.filter(c => c.status !== ComplaintStatus.RESOLVED).length}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="text-rose-500 text-xs font-bold uppercase tracking-wider mb-1">Urgent Pulse</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{complaints.filter(c => c.sentiment === Sentiment.URGENT).length}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="text-blue-500 text-xs font-bold uppercase tracking-wider mb-1">Avg Resolution</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">2.4d</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="text-emerald-500 text-xs font-bold uppercase tracking-wider mb-1">Satisfaction</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">84%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Complaint List */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[700px]">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">Recent Complaints</h3>
                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg text-gray-500 font-bold uppercase tracking-widest">{complaints.length} Total</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {complaints.map(complaint => (
                  <div 
                    key={complaint.id} 
                    onClick={() => setSelectedComplaint(complaint)}
                    className={`p-5 border-b border-gray-50 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selectedComplaint?.id === complaint.id ? 'bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-l-indigo-500' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2 truncate">
                        <span title={complaint.sentiment}>{getSentimentIcon(complaint.sentiment)}</span>
                        <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">{complaint.title}</h4>
                      </div>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${getStatusStyle(complaint.status)}`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <span>{complaint.studentName}</span>
                      <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {complaints.length === 0 && (
                  <div className="p-12 text-center text-gray-400">
                    <p>Inbox is empty. 🎉</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detail View */}
            <div className="lg:col-span-2">
              {selectedComplaint ? (
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 animate-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedComplaint.title}</h2>
                        {selectedComplaint.sentiment === Sentiment.URGENT && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-bold rounded-full animate-pulse uppercase">Urgent</span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Ref: {selectedComplaint.id} • {selectedComplaint.category} • {selectedComplaint.priority} Priority</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select 
                        value={selectedComplaint.status}
                        onChange={(e) => onUpdateStatus(selectedComplaint.id, e.target.value as ComplaintStatus)}
                        className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        {Object.values(ComplaintStatus).map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 leading-relaxed shadow-inner">
                      <p className="whitespace-pre-wrap mb-4">{selectedComplaint.description}</p>
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
                      <div className="p-5 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                        <h5 className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest mb-2 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707zM16 18a1 1 0 100-2 1 1 0 000 2z"/></svg>
                          AI Executive Summary
                        </h5>
                        <p className="text-sm text-indigo-900 dark:text-indigo-300 italic font-medium">"{selectedComplaint.aiSummary}"</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">
                         Communication Log
                      </h4>
                      <div className="space-y-4">
                        {selectedComplaint.comments.map(c => (
                          <div key={c.id} className={`flex ${c.authorRole === UserRole.ADMIN ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl ${c.authorRole === UserRole.ADMIN ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-100' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'}`}>
                              <div className="flex justify-between items-center mb-1 gap-4">
                                <span className={`text-[10px] font-bold uppercase ${c.authorRole === UserRole.ADMIN ? 'text-indigo-100' : 'text-gray-400'}`}>{c.authorName}</span>
                                <span className={`text-[9px] ${c.authorRole === UserRole.ADMIN ? 'text-indigo-200' : 'text-gray-400'}`}>{new Date(c.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-sm">{c.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-6">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Compose Response</label>
                      <button 
                        onClick={() => handleSuggest(selectedComplaint)}
                        disabled={isLoadingSuggestion}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl transition-all"
                      >
                        {isLoadingSuggestion ? 'Analyzing...' : '✨ Suggest with AI'}
                      </button>
                    </div>
                    
                    {suggestion && (
                      <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 relative animate-in fade-in zoom-in-95 duration-200">
                        <p className="text-sm text-indigo-900 dark:text-indigo-300 italic">"{suggestion}"</p>
                        <div className="mt-3 flex space-x-2">
                          <button onClick={() => { setCommentText(suggestion); setSuggestion(''); }} className="text-[10px] font-bold px-3 py-1.5 bg-indigo-600 text-white rounded-lg shadow-sm">Use Suggestion</button>
                          <button onClick={() => setSuggestion('')} className="text-[10px] font-bold px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">Ignore</button>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <textarea 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 px-5 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
                        placeholder="Type your message here..."
                        rows={2}
                      />
                      <button 
                        onClick={handleAddComment}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100 dark:shadow-none self-end"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6 text-indigo-200 dark:text-indigo-800">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Select a Ticket</h3>
                  <p className="text-gray-400 text-sm max-w-xs mx-auto mt-2">Select a complaint from the list to view details and use AI tools for resolution.</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">College Sentiment Pulse</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">AI-driven analysis of recurring campus issues.</p>
            </div>
            <button 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center space-x-3 shadow-lg shadow-indigo-100 dark:shadow-none"
            >
              {isGeneratingReport ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  <span>Refresh AI Report</span>
                </>
              )}
            </button>
          </div>

          {report ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-800/30">
                  <h4 className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest mb-4">Trend Summary</h4>
                  <p className="text-xl text-indigo-900 dark:text-indigo-200 font-medium leading-relaxed italic">
                    "{report.trendSummary}"
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Category Distribution</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="name" fontSize={10} tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <YAxis fontSize={10} tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#f3f4f6' }}
                          />
                          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Status Breakdown</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Campus Sentiment</p>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">{report.sentimentScore}%</div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-4 overflow-hidden">
                      <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${report.sentimentScore}%` }}></div>
                    </div>
                  </div>
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-center flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Primary Action</p>
                    <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Hostel Maintenance Review</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">Key Insights</h4>
                <div className="space-y-4">
                  {report.keyInsights.map((insight, idx) => (
                    <div key={idx} className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
              <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-8 text-indigo-200 dark:text-indigo-800">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">No Report Generated</h3>
              <p className="text-gray-400 text-sm max-w-sm mb-8">Let Gemini analyze your current database of complaints to find hidden patterns and campus sentiment.</p>
              <button 
                onClick={handleGenerateReport}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none"
              >
                Run AI Diagnostics
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
