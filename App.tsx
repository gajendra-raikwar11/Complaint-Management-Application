
import React, { useState, useEffect } from 'react';
import { User, UserRole, Complaint, ComplaintStatus, ComplaintCategory, Priority, Comment, Sentiment, Notification, NotificationType } from './types';
import { storageService } from './services/storageService';
import { apiService } from './services/apiService';
import { geminiService } from './services/geminiService';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoginView, setIsLoginView] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'verify' | 'reset'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  
  // Auth Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUser = storageService.getCurrentUser();
    const savedComplaints = storageService.getComplaints();
    if (savedUser) {
      setUser(savedUser);
      setIsLoginView(false);
    }
    setComplaints(savedComplaints);
    
    const savedDarkMode = localStorage.getItem('eduresolve_dark_mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (savedDarkMode === 'true' || (!savedDarkMode && prefersDark.matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('eduresolve_dark_mode')) {
        toggleDarkMode(e.matches);
      }
    };

    prefersDark.addEventListener('change', handleSystemThemeChange);
    return () => prefersDark.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const toggleDarkMode = (val?: boolean) => {
    setIsDarkMode(prev => {
      const next = val !== undefined ? val : !prev;
      localStorage.setItem('eduresolve_dark_mode', String(next));
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleRoleSwitch = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    setSuccessMsg('');
    if (role === UserRole.ADMIN) {
      setAuthMode('login');
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        const result = await apiService.login(email, password, selectedRole);
        if (result.success && result.user) {
          storageService.setCurrentUser(result.user);
          setUser(result.user);
          setIsLoginView(false);
        } else {
          setError(result.message);
        }
      } else if (authMode === 'register') {
        const newUser: User = { id: `${selectedRole}_${Date.now()}`, name, email, password, role: selectedRole, department };
        const result = await apiService.register(newUser);
        if (result.success && result.user) {
          storageService.setCurrentUser(result.user);
          setUser(result.user);
          setIsLoginView(false);
        } else {
          setError(result.message);
        }
      } else if (authMode === 'forgot') {
        const result = await apiService.requestReset(email);
        if (result.success) {
          setAuthMode('verify');
          setSuccessMsg(result.message);
        } else {
          setError(result.message);
        }
      } else if (authMode === 'verify') {
        const result = await apiService.verifyResetLink(email);
        if (result.success) setAuthMode('reset');
      } else if (authMode === 'reset') {
        const result = await apiService.resetPassword(email, newPassword);
        if (result.success) {
          setAuthMode('login');
          setSuccessMsg("Security updated. Please login.");
        }
      }
    } catch (err) {
      setError("MERN Connection Refused. Check .env configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    storageService.setCurrentUser(null);
    setUser(null);
    setIsLoginView(true);
    setEmail('');
    setPassword('');
  };

  const handleSubmitComplaint = async (data: { title: string; category: ComplaintCategory; priority: Priority; description: string; attachmentUrl?: string }) => {
    if (!user) return;
    const newComplaint: Complaint = {
      id: `comp_${Date.now()}`,
      studentId: user.id,
      studentName: user.name,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: ComplaintStatus.PENDING,
      attachmentUrl: data.attachmentUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
    };

    storageService.addComplaint(newComplaint);
    setComplaints(storageService.getComplaints());

    try {
      const [summary, sentiment] = await Promise.all([
        geminiService.summarizeComplaint(newComplaint),
        geminiService.analyzeSentiment(newComplaint)
      ]);
      const enriched = storageService.getComplaints().map(c => 
        c.id === newComplaint.id ? { ...c, aiSummary: summary, sentiment } : c
      );
      storageService.saveComplaints(enriched);
      setComplaints(enriched);
    } catch (err) { console.error(err); }
  };

  const addNotification = (notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleUpdateStatus = (id: string, status: ComplaintStatus) => {
    const all = storageService.getComplaints();
    const complaint = all.find(c => c.id === id);
    if (!complaint) return;

    const updated = all.map(c => c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c);
    storageService.saveComplaints(updated);
    setComplaints(updated);

    addNotification({
      userId: complaint.studentId,
      type: NotificationType.STATUS_CHANGE,
      title: 'Status Updated',
      message: `Your ticket "${complaint.title}" is now ${status.replace('_', ' ')}.`
    });
  };

  const handleAddComment = (id: string, content: string) => {
    if (!user) return;
    const complaint = storageService.getComplaints().find(c => c.id === id);
    if (!complaint) return;

    const newComment: Comment = { id: `comm_${Date.now()}`, authorName: user.name, authorRole: user.role, content, timestamp: new Date().toISOString() };
    const updated = storageService.getComplaints().map(c => c.id === id ? { ...c, comments: [...c.comments, newComment], updatedAt: new Date().toISOString() } : c);
    storageService.saveComplaints(updated);
    setComplaints(updated);

    const recipientId = user.role === UserRole.ADMIN ? complaint.studentId : 'admin_all';
    addNotification({
      userId: recipientId,
      type: NotificationType.NEW_COMMENT,
      title: 'New Response',
      message: `${user.name} responded to "${complaint.title}".`
    });
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-500">
        {isLoginView ? (
          <div className="min-h-screen flex items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-950/20">
            <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-[3rem] p-10 max-w-md w-full border border-indigo-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-8">
                 <button onClick={() => toggleDarkMode()} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl">
                   {isDarkMode ? '🌞' : '🌙'}
                 </button>
                 <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">v2.0 Modern Stack</span>
              </div>
              
              <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">EduResolve</h1>
                <p className="text-gray-400 dark:text-gray-500 text-sm">Next-Gen Complaint Infrastructure</p>
              </div>

              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl mb-8 relative">
                <div className={`absolute top-1 bottom-1 w-[48%] bg-white dark:bg-gray-700 rounded-xl shadow transition-all duration-300 ${selectedRole === UserRole.ADMIN ? 'translate-x-[104%]' : 'translate-x-0'}`} />
                <button onClick={() => handleRoleSwitch(UserRole.STUDENT)} className={`relative z-10 flex-1 py-3 text-xs font-bold transition-colors ${selectedRole === UserRole.STUDENT ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>Student</button>
                <button onClick={() => handleRoleSwitch(UserRole.ADMIN)} className={`relative z-10 flex-1 py-3 text-xs font-bold transition-colors ${selectedRole === UserRole.ADMIN ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>Admin</button>
              </div>

              <form onSubmit={handleAuthAction} className="space-y-4">
                {(authMode === 'login' || authMode === 'register') && (
                  <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl mb-4">
                    <button type="button" onClick={() => setAuthMode('login')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'login' ? 'text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-400'}`}>Sign In</button>
                    {selectedRole === UserRole.STUDENT && <button type="button" onClick={() => setAuthMode('register')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'register' ? 'text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-400'}`}>Register</button>}
                  </div>
                )}

                {authMode === 'verify' && (
                  <div className="text-center py-6 animate-pulse">
                    <div className="text-5xl mb-4">📧</div>
                    <h3 className="text-xl font-bold dark:text-white">Check Your Inbox</h3>
                    <p className="text-sm text-gray-500 mb-6">A verification link was sent to your Gmail.</p>
                    <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black">Simulate Verification</button>
                  </div>
                )}

                {authMode === 'register' && (
                  <div className="space-y-4">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Full Name" required />
                  </div>
                )}

                {(authMode === 'login' || authMode === 'register' || authMode === 'forgot') && (
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="College Email" required />
                )}

                {(authMode === 'login' || authMode === 'register') && (
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Password" required />
                )}

                {authMode === 'reset' && (
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="New Secure Password" required />
                )}

                {error && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-2xl border border-rose-100 dark:border-rose-800/30 animate-shake">
                    {error}
                  </div>
                )}
                {successMsg && <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl">{successMsg}</div>}

                {authMode !== 'verify' && (
                  <button type="submit" disabled={isLoading} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black transition-all shadow-xl shadow-indigo-500/30 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50">
                    {isLoading && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                    <span>{authMode === 'login' ? 'Authenticate' : authMode === 'register' ? 'Create Account' : 'Proceed'}</span>
                  </button>
                )}
                
                {authMode === 'login' && (
                  <button type="button" onClick={() => setAuthMode('forgot')} className="w-full text-center text-xs text-indigo-500 font-bold hover:underline">Forgot access key?</button>
                )}

                {authMode === 'login' && selectedRole === UserRole.ADMIN && (
                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest mb-3">Project Evaluator Hint</p>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Admin Email:</span>
                        <code className="text-indigo-500 font-bold">admin1@college.edu</code>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Password:</span>
                        <code className="text-indigo-500 font-bold">admin123</code>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        ) : (
          <Layout 
            user={user} 
            onLogout={handleLogout} 
            onShowDocs={() => setShowDocs(true)}
            isDarkMode={isDarkMode}
            setIsDarkMode={toggleDarkMode}
            onShowNotif={() => setShowNotifPanel(true)}
            hasUnreadNotif={notifications.some(n => !n.read)}
          >
            {/* Notification Slideout */}
            <div className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-900 shadow-2xl z-[100] transform transition-transform duration-500 border-l border-indigo-100 dark:border-gray-800 ${showNotifPanel ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-black text-gray-900 dark:text-white">Alert Hub</h3>
                <button onClick={() => setShowNotifPanel(false)} className="text-gray-400 text-2xl transition-colors hover:text-rose-500">&times;</button>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto max-h-[80vh]">
                {notifications.length === 0 && <p className="text-center text-gray-400 py-10">No new alerts.</p>}
                {notifications.map(n => (
                  <div key={n.id} className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                    <div className="flex justify-between text-[9px] font-black text-indigo-400 uppercase mb-1">
                      <span>{n.title}</span>
                      <span>{new Date(n.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {user?.role === UserRole.STUDENT ? (
              <StudentDashboard 
                complaints={complaints}
                onSubmitComplaint={handleSubmitComplaint}
                user={user}
              />
            ) : (
              <AdminDashboard 
                complaints={complaints} 
                onUpdateStatus={handleUpdateStatus}
                onAddComment={handleAddComment}
                currentUser={user!}
              />
            )}
          </Layout>
        )}
      </div>
    </div>
  );
};

export default App;
