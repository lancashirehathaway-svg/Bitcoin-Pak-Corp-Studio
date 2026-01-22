
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Video, Mic, MicOff, VideoOff, Monitor, Layout as LayoutIcon, 
  Settings, Users, Shield, Share2, FileText, CircleDot, Radio, 
  X, Copy, Check, Lock, Play, Square, Sparkles, Bot, MessageSquare
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Participant, StreamLayout, AppState } from './types';

// Components
import Sidebar from './components/Sidebar';
import Stage from './components/Stage';
import ParticipantBar from './components/ParticipantBar';
import InviteModal from './components/InviteModal';
import GuestEntrance from './components/GuestEntrance';
import HostEntrance from './components/HostEntrance';

// Audio Helpers
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const App: React.FC = () => {
  const [isGuest, setIsGuest] = useState(window.location.hash.includes('guest'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  
  const [state, setState] = useState<AppState>({
    isRecording: false,
    isStreaming: false,
    isBlurred: false,
    isAiActive: false,
    currentLayout: StreamLayout.SOLO,
    showInviteModal: false,
    presentationUrl: null,
    presentationType: null,
    guestPassword: 'admin',
    aiTranscription: '',
  });

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);

  // Refs for Recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // AI Session Refs
  const aiSessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Initialize Media
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });
        setLocalStream(stream);
        
        const me: Participant = {
          id: 'me',
          name: userName || (isGuest ? 'Guest' : 'Host'),
          isHost: !isGuest,
          videoStream: stream,
          audioEnabled: true,
          videoEnabled: true,
          hasPrivileges: !isGuest, // Host gets them, guests don't
        };

        setParticipants([me]);

        // Simulating a guest request if we are the host
        if (!isGuest) {
          setTimeout(() => {
            setParticipants(prev => [...prev, {
              id: 'guest-preview-1',
              name: 'Guest Alice',
              isHost: false,
              audioEnabled: true,
              videoEnabled: true,
              isRequestingPrivileges: true
            }]);
          }, 3000);
        }

      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    if (isAuthenticated) {
      initMedia();
    }

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, [isAuthenticated, isGuest, userName]);

  // AI Connection Logic
  const toggleAiGuest = useCallback(async () => {
    if (state.isAiActive) {
      aiSessionRef.current?.close();
      aiSessionRef.current = null;
      setParticipants(prev => prev.filter(p => !p.isAi));
      setState(s => ({ ...s, isAiActive: false, currentLayout: s.presentationUrl ? StreamLayout.PRESENTATION : StreamLayout.SOLO }));
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          if (!localStream) return;
          const source = inputAudioContextRef.current!.createMediaStreamSource(localStream);
          const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const pcmBlob = {
              data: encode(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };
            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
          };
          
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContextRef.current!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.outputTranscription) {
            setState(s => ({ ...s, aiTranscription: s.aiTranscription + message.serverContent!.outputTranscription!.text }));
          }

          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio && outputAudioContextRef.current) {
            const ctx = outputAudioContextRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.addEventListener('ended', () => sourcesRef.current.delete(source));
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
          }

          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onerror: (e) => console.error("AI Error:", e),
        onclose: () => console.log("AI Session Closed")
      },
      config: {
        // Fix typo: responseModalities property name
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        systemInstruction: "You are a professional co-host and producer in a live streaming studio. You are witty, helpful, and keep the energy high. Help the host with technical questions or engage in conversation.",
        outputAudioTranscription: {},
      }
    });

    aiSessionRef.current = await sessionPromise;
    setParticipants(prev => [...prev, {
      id: 'ai-guest',
      name: 'Gemini AI',
      isHost: false,
      isAi: true,
      audioEnabled: true,
      videoEnabled: true,
      hasPrivileges: true,
    }]);
    setState(s => ({ ...s, isAiActive: true, currentLayout: StreamLayout.GALLERY }));
  }, [state.isAiActive, localStream]);

  const toggleScreenShare = async () => {
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      setScreenStream(null);
      setState(prev => ({ ...prev, currentLayout: prev.isAiActive ? StreamLayout.GALLERY : StreamLayout.SOLO }));
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(stream);
        setState(prev => ({ ...prev, currentLayout: StreamLayout.PRESENTATION }));
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setState(prev => ({ ...prev, currentLayout: prev.isAiActive ? StreamLayout.GALLERY : StreamLayout.SOLO }));
        };
      } catch (err) {
        console.error("Screen share error:", err);
      }
    }
  };

  const toggleRecording = useCallback(() => {
    if (state.isRecording) {
      mediaRecorderRef.current?.stop();
      setState(prev => ({ ...prev, isRecording: false }));
    } else {
      if (!localStream) return;
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      const recorder = new MediaRecorder(localStream, options);
      recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prostream-recording-${new Date().toISOString()}.webm`;
        a.click();
        recordedChunksRef.current = [];
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setState(prev => ({ ...prev, isRecording: true }));
    }
  }, [state.isRecording, localStream]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setState(prev => ({ 
        ...prev, 
        presentationUrl: url, 
        presentationType: file.type.includes('pdf') ? 'pdf' : 'image',
        currentLayout: StreamLayout.PRESENTATION
      }));
    }
  };

  const handleRequestPrivileges = () => {
    setParticipants(prev => prev.map(p => p.id === 'me' ? { ...p, isRequestingPrivileges: true } : p));
  };

  const handleApprovePrivileges = (id: string) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, hasPrivileges: true, isRequestingPrivileges: false } : p));
  };

  const handleDenyPrivileges = (id: string) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, isRequestingPrivileges: false } : p));
  };

  if (!isAuthenticated) {
    if (isGuest) {
      return (
        <GuestEntrance 
          onJoin={(name, password) => {
            if (password === state.guestPassword) {
              setUserName(name);
              setIsAuthenticated(true);
            } else {
              alert("Incorrect Password");
            }
          }} 
        />
      );
    } else {
      return (
        <HostEntrance 
          onJoin={(name) => {
            setUserName(name);
            setIsAuthenticated(true);
          }} 
        />
      );
    }
  }

  const myParticipant = participants.find(p => p.id === 'me');
  const hasPrivileges = myParticipant?.hasPrivileges || myParticipant?.isHost;

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden text-zinc-100 font-sans">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-zinc-800 flex items-center px-6 justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold tracking-tight">ProStream Studio</h1>
              <span className="text-[10px] text-zinc-500 font-medium">Session ID: {state.guestPassword}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {state.isAiActive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-semibold border border-indigo-500/30">
                <Bot size={14} className="animate-pulse" />
                AI CO-HOST
              </div>
            )}
            {state.isRecording && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold animate-pulse border border-red-500/30">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                REC
              </div>
            )}
            {!isGuest && (
              <button onClick={() => setState(s => ({ ...s, showInviteModal: true }))} className="flex items-center gap-2 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-md text-sm font-medium">
                <Share2 size={16} /> Invite
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 relative overflow-hidden p-6 flex flex-col gap-4">
          <Stage 
            localStream={localStream}
            screenStream={screenStream}
            presentationUrl={state.presentationUrl}
            presentationType={state.presentationType}
            layout={state.currentLayout}
            isBlurred={state.isBlurred}
            isAiActive={state.isAiActive}
            userName={userName}
            participants={participants}
          />
          
          {state.aiTranscription && (
            <div className="h-16 bg-zinc-900/60 backdrop-blur-md rounded-xl border border-zinc-800 p-3 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="flex gap-3 items-start">
                <MessageSquare size={16} className="text-indigo-400 mt-1 shrink-0" />
                <p className="text-sm text-zinc-300 italic line-clamp-2">
                  <span className="font-bold text-indigo-400 not-italic mr-2">AI:</span>
                  {state.aiTranscription.slice(-150)}
                </p>
              </div>
            </div>
          )}
        </main>

        <footer className="h-44 border-t border-zinc-800 bg-zinc-900/80 p-4">
          <ParticipantBar 
            participants={participants} 
            isHost={!isGuest} 
            onApprove={handleApprovePrivileges} 
            onDeny={handleDenyPrivileges} 
          />
        </footer>
      </div>

      <Sidebar 
        state={state}
        setState={setState}
        micActive={micActive}
        setMicActive={setMicActive}
        videoActive={videoActive}
        setVideoActive={setVideoActive}
        onToggleScreen={toggleScreenShare}
        onToggleRecord={toggleRecording}
        onFileUpload={handleFileUpload}
        onToggleAi={toggleAiGuest}
        onRequestPrivileges={handleRequestPrivileges}
        screenActive={!!screenStream}
        isGuest={isGuest}
        hasPrivileges={hasPrivileges}
        isRequesting={myParticipant?.isRequestingPrivileges}
      />

      {state.showInviteModal && <InviteModal password={state.guestPassword} onClose={() => setState(s => ({ ...s, showInviteModal: false }))} />}
    </div>
  );
};

export default App;
