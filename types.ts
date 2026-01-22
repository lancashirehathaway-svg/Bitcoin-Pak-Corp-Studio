
export enum StreamLayout {
  SOLO = 'SOLO',
  SPLIT = 'SPLIT',
  GALLERY = 'GALLERY',
  PICTURE_IN_PICTURE = 'PICTURE_IN_PICTURE',
  PRESENTATION = 'PRESENTATION'
}

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isAi?: boolean;
  videoStream?: MediaStream;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isSpeaking?: boolean;
  hasPrivileges?: boolean; // Can use studio tools
  isRequestingPrivileges?: boolean; // Waiting for host approval
}

export interface AppState {
  isRecording: boolean;
  isStreaming: boolean;
  isBlurred: boolean;
  isAiActive: boolean;
  currentLayout: StreamLayout;
  showInviteModal: boolean;
  presentationUrl: string | null;
  presentationType: 'pdf' | 'image' | null;
  guestPassword: string;
  aiTranscription: string;
}
