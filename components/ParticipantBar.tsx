
import React from 'react';
import { Mic, MicOff, MoreVertical, User, Bot, Zap, Shield, Check, X } from 'lucide-react';
import { Participant } from '../types';

interface ParticipantBarProps {
  participants: Participant[];
  isHost?: boolean;
  onApprove?: (id: string) => void;
  onDeny?: (id: string) => void;
}

const ParticipantCard: React.FC<{ 
  participant: Participant, 
  isHost?: boolean,
  onApprove?: (id: string) => void,
  onDeny?: (id: string) => void
}> = ({ participant, isHost, onApprove, onDeny }) => {
  return (
    <div className={`group relative w-56 h-full bg-zinc-800 rounded-lg overflow-hidden border transition-all duration-300 flex flex-col shrink-0 hover:scale-[1.02] ${participant.isSpeaking ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500' : 'border-zinc-700'}`}>
      <div className={`flex-1 bg-zinc-900 flex items-center justify-center relative overflow-hidden`}>
        {participant.isAi ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-600/10 rounded-full flex items-center justify-center mb-1 border border-indigo-500/20">
              <Bot size={24} className="text-indigo-400 animate-pulse" />
            </div>
          </div>
        ) : participant.videoEnabled ? (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
            <User size={32} className="text-zinc-600 opacity-20" />
          </div>
        ) : (
          <User size={32} className="text-zinc-600" />
        )}
        
        {(participant.hasPrivileges || participant.isHost) && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-indigo-600 rounded text-[8px] font-bold tracking-widest text-white uppercase flex items-center gap-1">
            <Shield size={8} /> {participant.isHost ? 'HOST' : 'PRODUCER'}
          </div>
        )}

        {/* Approval Overlay for Host */}
        {isHost && participant.isRequestingPrivileges && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-3 text-center">
            <Shield size={24} className="text-indigo-400 mb-2 animate-bounce" />
            <p className="text-[10px] font-bold mb-3 text-white leading-tight">Requests Privileges</p>
            <div className="flex gap-2 w-full">
              <button 
                onClick={() => onApprove?.(participant.id)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-1.5 rounded flex items-center justify-center"
              >
                <Check size={14} />
              </button>
              <button 
                onClick={() => onDeny?.(participant.id)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-1.5 rounded flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute top-2 right-2">
        <button className="p-1 hover:bg-black/20 rounded">
          <MoreVertical size={14} className="text-zinc-400" />
        </button>
      </div>

      <div className="p-2 flex items-center justify-between bg-zinc-900/90 backdrop-blur-sm border-t border-zinc-800">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <div className={`w-1.5 h-1.5 rounded-full ${participant.isHost ? 'bg-indigo-500' : (participant.isAi ? 'bg-purple-500' : 'bg-emerald-500')}`} />
          <span className="text-[11px] font-bold text-zinc-300 truncate">{participant.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {participant.isRequestingPrivileges && !isHost && (
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Requesting privileges..." />
          )}
          {participant.audioEnabled ? (
            <Mic size={12} className={participant.isSpeaking ? 'text-indigo-400' : 'text-emerald-500'} />
          ) : (
            <MicOff size={12} className="text-red-500" />
          )}
        </div>
      </div>
    </div>
  );
};

const ParticipantBar: React.FC<ParticipantBarProps> = ({ participants, isHost, onApprove, onDeny }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Studio Backstage ({participants.length})</span>
        </div>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 flex-1 scrollbar-hide">
        {participants.map((p) => (
          <ParticipantCard 
            key={p.id} 
            participant={p} 
            isHost={isHost} 
            onApprove={onApprove} 
            onDeny={onDeny} 
          />
        ))}
        
        {/* Mock Guest Slot */}
        {!isHost && (
          <div className="w-56 h-full rounded-lg border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600/30 shrink-0">
            <User size={24} className="mb-2" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Other Guests</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantBar;
