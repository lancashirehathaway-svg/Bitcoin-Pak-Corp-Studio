
import React from 'react';
import { 
  Settings, Shield, Monitor, FileText, CircleDot, Radio, 
  Mic, MicOff, Video, VideoOff, Sparkles, Layout, Bot, Zap, 
  Lock, Clock, AlertCircle
} from 'lucide-react';
import { AppState, StreamLayout } from '../types';

interface SidebarProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  micActive: boolean;
  setMicActive: (v: boolean) => void;
  videoActive: boolean;
  setVideoActive: (v: boolean) => void;
  onToggleScreen: () => void;
  onToggleRecord: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleAi: () => void;
  onRequestPrivileges?: () => void;
  screenActive: boolean;
  isGuest?: boolean;
  hasPrivileges?: boolean;
  isRequesting?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  state, setState, micActive, setMicActive, videoActive, 
  setVideoActive, onToggleScreen, onToggleRecord, onFileUpload, onToggleAi, 
  onRequestPrivileges, screenActive, isGuest, hasPrivileges, isRequesting 
}) => {
  return (
    <aside className="w-80 border-l border-zinc-800 bg-zinc-900 flex flex-col shrink-0">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-zinc-400" />
          <h2 className="font-semibold text-zinc-100">{isGuest ? 'Guest Settings' : 'Studio Control'}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Personal Controls - Available to everyone */}
        <section>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Your Devices</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setMicActive(!micActive)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                micActive ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' : 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20'
              }`}
            >
              {micActive ? <Mic size={20} /> : <MicOff size={20} />}
              <span className="text-[10px] mt-1 font-bold">{micActive ? 'MUTE' : 'UNMUTE'}</span>
            </button>
            <button 
              onClick={() => setVideoActive(!videoActive)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                videoActive ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700' : 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20'
              }`}
            >
              {videoActive ? <Video size={20} /> : <VideoOff size={20} />}
              <span className="text-[10px] mt-1 font-bold">{videoActive ? 'STOP CAM' : 'START CAM'}</span>
            </button>
          </div>
          
          <button 
            onClick={() => setState(s => ({ ...s, isBlurred: !s.isBlurred }))}
            className={`w-full mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
              state.isBlurred ? 'bg-zinc-800 border-indigo-500 text-indigo-400' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <Sparkles size={18} />
            <span className="text-sm font-medium">Blur My Background</span>
            <div className={`ml-auto w-8 h-4 rounded-full relative transition-colors ${state.isBlurred ? 'bg-indigo-500' : 'bg-zinc-600'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${state.isBlurred ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </button>
        </section>

        {/* Administrative Tools (Restricted for Guests unless granted) */}
        <section>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center justify-between">
            Studio Privileges
            {isGuest && !hasPrivileges && (
              <span className="flex items-center gap-1 text-[10px] text-red-500 font-bold">
                <Lock size={10} /> RESTRICTED
              </span>
            )}
          </h3>
          <div className={`space-y-2 ${isGuest && !hasPrivileges ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
            <button 
              disabled={isGuest && !hasPrivileges}
              onClick={onToggleScreen}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                screenActive ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <Monitor size={18} />
              <span className="text-sm font-medium">{screenActive ? 'Stop Sharing' : 'Share Screen'}</span>
            </button>

            <label className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer">
              <FileText size={18} />
              <span className="text-sm font-medium">Upload PDF / Slide</span>
              <input type="file" className="hidden" accept=".pdf,image/*" onChange={onFileUpload} disabled={isGuest && !hasPrivileges} />
            </label>
          </div>

          {isGuest && !hasPrivileges && (
            <div className="mt-3 p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2 text-indigo-400">
                <AlertCircle size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Request Admin Access</span>
              </div>
              <button 
                onClick={onRequestPrivileges}
                disabled={isRequesting}
                className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                  isRequesting ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-default' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
                }`}
              >
                {isRequesting ? <Clock size={14} className="animate-spin" /> : <Shield size={14} />}
                {isRequesting ? 'Request Pending...' : 'Request to Co-Host'}
              </button>
            </div>
          )}
        </section>

        {/* AI & Host Only (Always hidden for Guests) */}
        {!isGuest && (
          <>
            <section>
              <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap size={14} /> AI Producer
              </h3>
              <button 
                onClick={onToggleAi}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg border transition-all ${
                  state.isAiActive ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-indigo-500/50'
                }`}
              >
                <Bot size={20} className={state.isAiActive ? 'animate-bounce' : ''} />
                <div className="text-left">
                  <span className="text-sm font-bold block">{state.isAiActive ? 'Release AI Co-Host' : 'Summon AI Producer'}</span>
                  <span className="text-[10px] opacity-70">Voice-enabled assistant</span>
                </div>
              </button>
            </section>

            <section className="pt-4 border-t border-zinc-800 space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Broadcast Admin</h3>
                <button 
                  onClick={onToggleRecord}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${
                    state.isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-zinc-100 hover:bg-white text-zinc-950'
                  }`}
                >
                  <CircleDot size={18} />
                  {state.isRecording ? 'STOP RECORDING' : 'RECORD PODCAST'}
                </button>
              </div>
              
              <div className="space-y-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Radio size={14} />
                  <span className="text-xs font-bold uppercase tracking-wide">Live Stream Setup</span>
                </div>
                <div className="space-y-2">
                  <input type="text" placeholder="RTMP Server URL" className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-[11px] text-zinc-300 focus:outline-none focus:border-indigo-500" />
                  <input type="password" placeholder="Stream Key" className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-[11px] text-zinc-300 focus:outline-none focus:border-indigo-500" />
                </div>
                <button className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-bold text-white transition-colors">GO LIVE</button>
              </div>
            </section>
          </>
        )}
      </div>
      
      {isGuest && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-medium leading-tight">
            <Lock size={12} className="shrink-0" />
            <span>Certain features are disabled by the studio host for security.</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
