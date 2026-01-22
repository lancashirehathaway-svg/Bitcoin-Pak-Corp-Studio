
import React, { useState } from 'react';
import { X, Copy, Check, Lock, Link as LinkIcon } from 'lucide-react';

interface InviteModalProps {
  onClose: () => void;
  password?: string;
}

const InviteModal: React.FC<InviteModalProps> = ({ onClose, password }) => {
  const [copied, setCopied] = useState(false);
  const inviteUrl = `${window.location.origin}${window.location.pathname}#guest`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <LinkIcon size={20} className="text-indigo-500" />
            Invite a Guest
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Share this link</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={inviteUrl}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none"
              />
              <button 
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                  copied ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex items-start gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Lock size={18} className="text-indigo-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Password Required</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Your guest will need to enter the session password to join. 
                Share this along with the link:
              </p>
              <div className="mt-2 text-sm font-mono font-bold text-indigo-400 tracking-wider">
                {password || 'admin'}
              </div>
            </div>
          </div>

          <p className="text-[10px] text-zinc-500 text-center px-4 leading-normal">
            Guests join the "Backstage" area first. You can add them to the main stream when you're ready.
          </p>
        </div>

        <div className="px-6 py-4 bg-zinc-800/50 border-t border-zinc-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-zinc-100 text-zinc-950 rounded-lg font-bold text-sm hover:bg-white transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
