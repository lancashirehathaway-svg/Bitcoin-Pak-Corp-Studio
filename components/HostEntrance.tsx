
import React, { useState } from 'react';
import { Radio, ArrowRight, User, ShieldCheck } from 'lucide-react';

interface HostEntranceProps {
  onJoin: (name: string) => void;
}

const HostEntrance: React.FC<HostEntranceProps> = ({ onJoin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
    onJoin(name);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="mb-12 text-center space-y-4">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-600/20">
          <Radio size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">ProStream Studio</h1>
        <p className="text-zinc-400 font-medium">Configure your studio profile.</p>
      </div>

      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
              <User size={12} />
              Host Display Name
            </label>
            <input 
              autoFocus
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-700"
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/20">
            <ShieldCheck size={20} className="text-indigo-500" />
            <span className="text-xs text-zinc-400">You are entering as the <span className="text-indigo-400 font-bold">Studio Host</span> with full administrative privileges.</span>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 group transition-all"
          >
            Enter Studio
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
      
      <div className="mt-auto pt-8">
        <div className="flex items-center gap-4 text-xs font-bold text-zinc-600 tracking-widest uppercase">
          <span>Pro Engine</span>
          <div className="w-1 h-1 rounded-full bg-zinc-800" />
          <span>No Time Limits</span>
          <div className="w-1 h-1 rounded-full bg-zinc-800" />
          <span>Local Recording</span>
        </div>
      </div>
    </div>
  );
};

export default HostEntrance;
