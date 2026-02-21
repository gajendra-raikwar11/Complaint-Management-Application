
import React, { useState } from 'react';
import { ComplaintCategory, Priority } from '../types';
import { geminiService } from '../services/geminiService';

interface ComplaintFormProps {
  onSubmit: (data: { title: string; category: ComplaintCategory; priority: Priority; description: string; attachmentUrl?: string }) => void;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>(ComplaintCategory.MAINTENANCE);
  const [priority, setPriority] = useState<Priority>(Priority.LOW);
  const [description, setDescription] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState<string | undefined>(undefined);
  const [isPredicting, setIsPredicting] = useState(false);

  const handlePredictPriority = async () => {
    if (description.length < 10) return;
    setIsPredicting(true);
    const suggested = await geminiService.predictPriority(description);
    setPriority(suggested);
    setIsPredicting(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    onSubmit({ title, category, priority, description, attachmentUrl });
    setTitle('');
    setDescription('');
    setAttachmentUrl(undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-8 space-y-6 border border-gray-100 dark:border-gray-800 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">New Ticket</h3>
        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-lg">Priority Support</span>
      </div>
      
      <div className="space-y-5 relative z-10">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Subject</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Briefly describe the issue"
            className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
              className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            >
              {Object.values(ComplaintCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Priority</label>
            <div className="relative">
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium appearance-none"
              >
                {Object.values(Priority).map(p => <option key={p} value={p}>{p} Priority</option>)}
              </select>
              <button 
                type="button"
                onClick={handlePredictPriority}
                className={`absolute right-4 top-1/2 -translate-y-1/2 text-lg hover:scale-110 active:scale-95 transition-all ${isPredicting ? 'animate-spin' : ''}`}
                title="AI Priority Suggestion"
              >
                ✨
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Detailed Description</label>
          <textarea 
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide as much detail as possible..."
            className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium leading-relaxed"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Attachment (Optional)</label>
          <div className="flex items-center space-x-4">
            <label className="flex-1 flex flex-col items-center justify-center px-4 py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span className="text-[10px] font-bold uppercase tracking-wider">Capture or Upload</span>
              <p className="text-[8px] text-gray-400 mt-1">Camera preferred on mobile</p>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
            </label>
            {attachmentUrl && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={attachmentUrl} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => setAttachmentUrl(undefined)}
                  className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-0.5 shadow-sm"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <button 
        type="submit"
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
      >
        <span>Submit Ticket</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      </button>
    </form>
  );
};

export default ComplaintForm;
