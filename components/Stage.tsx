
import React, { useEffect, useRef } from 'react';
import { StreamLayout, Participant } from '../types';
import { Bot, User, Shield } from 'lucide-react';

interface StageProps {
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  presentationUrl: string | null;
  presentationType: 'pdf' | 'image' | null;
  layout: StreamLayout;
  isBlurred: boolean;
  isAiActive: boolean;
  userName: string;
  participants: Participant[];
}

const Stage: React.FC<StageProps> = ({ 
  localStream, 
  screenStream, 
  presentationUrl, 
  presentationType, 
  layout,
  isBlurred,
  isAiActive,
  userName,
  participants
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const selfieSegmentationRef = useRef<any>(null);

  useEffect(() => {
    // @ts-ignore
    if (typeof SelfieSegmentation !== 'undefined') {
      // @ts-ignore
      const selfieSegmentation = new SelfieSegmentation({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });
      selfieSegmentation.setOptions({ modelSelection: 1 });
      selfieSegmentation.onResults((results: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (isBlurred) {
          ctx.filter = 'blur(10px)';
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
          ctx.filter = 'none';
          ctx.globalCompositeOperation = 'destination-in';
          ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'destination-over';
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'source-over';
        } else {
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
        }
        ctx.restore();
      });
      selfieSegmentationRef.current = selfieSegmentation;
    }
  }, [isBlurred]);

  useEffect(() => {
    let animationId: number;
    const render = async () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !videoRef.current) return;
      if (isBlurred && selfieSegmentationRef.current && videoRef.current.readyState >= 2) {
        await selfieSegmentationRef.current.send({ image: videoRef.current });
      } else {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      }
      animationId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, [isBlurred]);

  useEffect(() => {
    if (localStream && videoRef.current) videoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (screenStream && screenRef.current) screenRef.current.srcObject = screenStream;
  }, [screenStream]);

  const showSecondary = layout === StreamLayout.PRESENTATION || layout === StreamLayout.PICTURE_IN_PICTURE;
  
  // Active speakers/participants to show in main grid
  const onStageParticipants = participants.filter(p => p.id !== 'me' && !p.isAi);
  const totalGridItems = 1 + (isAiActive ? 1 : 0) + (onStageParticipants.length);

  let gridClasses = 'grid-cols-1';
  if (totalGridItems === 2) gridClasses = 'grid-cols-2';
  else if (totalGridItems > 2) gridClasses = 'grid-cols-2 grid-rows-2';

  return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl relative">
      <div className={`grid w-full h-full transition-all duration-500 gap-2 p-2 ${gridClasses}`}>
        
        {/* Local Camera Participant */}
        <div className={`relative w-full h-full overflow-hidden transition-all duration-500 ${layout === StreamLayout.PRESENTATION ? 'scale-[0.25] origin-bottom-right z-20 absolute bottom-4 right-4 aspect-video rounded-lg border-2 border-indigo-500 shadow-2xl' : 'rounded-lg'}`}>
          <canvas ref={canvasRef} className="w-full h-full object-cover rounded-lg" width={1280} height={720} />
          <video ref={videoRef} autoPlay playsInline muted className="hidden" />
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 flex items-center gap-2">
            <User size={12} className="text-zinc-400" />
            {userName} (You)
            <Shield size={10} className="text-indigo-400" />
          </div>
        </div>

        {/* Guest Participants (Simulated Grid) */}
        {onStageParticipants.map(guest => (
          <div key={guest.id} className="relative w-full h-full bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 flex items-center justify-center">
             <div className="text-zinc-700 flex flex-col items-center">
                <User size={64} className="opacity-10 mb-2" />
                <span className="text-xs font-bold tracking-widest opacity-20 uppercase">Waiting for feed...</span>
             </div>
             <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 flex items-center gap-2">
                <User size={12} className="text-zinc-400" />
                {guest.name}
                {guest.hasPrivileges && <Shield size={10} className="text-indigo-400" />}
             </div>
          </div>
        ))}

        {/* AI Participant Slot */}
        {isAiActive && (
          <div className="relative w-full h-full bg-indigo-950/20 rounded-lg overflow-hidden border border-indigo-500/30 flex items-center justify-center group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 animate-pulse" />
            <div className="z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-indigo-600/20 rounded-full flex items-center justify-center mb-4 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                <Bot size={48} className="text-indigo-400 animate-bounce" />
              </div>
              <div className="h-1 w-32 bg-indigo-900/50 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-400 w-full animate-[shimmer_2s_infinite] origin-left" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 bg-indigo-600/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 flex items-center gap-2">
              <Bot size={12} />
              Gemini AI Producer
            </div>
          </div>
        )}

        {/* Secondary Slot (Presentation / Screen) */}
        {(screenStream || presentationUrl) && showSecondary && (
          <div className={`bg-zinc-800 flex items-center justify-center overflow-hidden h-full w-full rounded-lg relative`}>
            {screenStream ? (
              <video ref={screenRef} autoPlay playsInline className="max-h-full max-w-full shadow-lg" />
            ) : presentationUrl && presentationType === 'pdf' ? (
              <embed src={presentationUrl} type="application/pdf" className="w-full h-full" />
            ) : presentationUrl && (
              <img src={presentationUrl} className="max-h-full max-w-full object-contain" alt="Presentation" />
            )}
            <div className="absolute top-4 left-4 bg-indigo-600 px-3 py-1 rounded text-xs font-bold shadow-lg border border-white/20">
              {screenStream ? 'Screen Share' : 'Presentation'}
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: scaleX(0.1); opacity: 0.3; }
          50% { transform: scaleX(1); opacity: 0.7; }
          100% { transform: scaleX(0.1); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default Stage;
