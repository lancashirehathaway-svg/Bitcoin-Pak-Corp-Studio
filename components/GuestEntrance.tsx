
import React, { useState } from 'react';
import { Lock, Radio, ArrowRight, User } from 'lucide-react';

interface GuestEntranceProps {
  onJoin: (name: string, password: string) => void;
}

const GuestEntrance: React.FC<GuestEntranceProps> = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
    onJoin(name, password);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="mb-12 text-center space-y-4">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-600/20">
          <Radio size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">ProStream Studio</h1>
        <p className="text-zinc-400 font-medium">You've been invited to join a broadcast.</p>
      </div>

      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
              <User size={12} />
              Display Name
            </label>
            <input 
              autoFocus
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-700 mb-2"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
              <Lock size={12} />
              Session Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-700"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 group transition-all"
          >
            Join Backstage
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="mt-8 text-[11px] text-zinc-500 text-center leading-relaxed">
          By joining, you agree to share your camera and microphone with the host for the duration of the broadcast.
        </p>
      </div>
      
      <div className="mt-auto pt-8">
        <div className="flex items-center gap-4 text-xs font-bold text-zinc-600 tracking-widest uppercase">
          <span>High Quality</span>
          <div className="w-1 h-1 rounded-full bg-zinc-800" />
          <span>Secure</span>
          <div className="w-1 h-1 rounded-full bg-zinc-800" />
          <span>Low Latency</span>
        </div>
      </div>
    </div>
  );
};

export default GuestEntrance;
