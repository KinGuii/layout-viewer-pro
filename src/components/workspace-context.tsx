import { createContext, useContext } from 'react';
import type { ProfileData, ProfileLibrary } from '@/components/music-profile';
import type { PlayerTrack } from '@/components/mini-player';
import type { DJTrack } from '@/lib/dj-library';
import type { Engagement, MissionId } from '@/lib/profile-engagement';

export interface WorkspaceValue {
  profile: ProfileData;
  saveProfile: (next: ProfileData) => Promise<boolean>;
  library: ProfileLibrary;
  djTracks: DJTrack[];
  engagement: Engagement;
  setSymbol: (index: number) => void;
  award: (id: MissionId) => void;
  signedIn: boolean;
  openPlayer: (track: PlayerTrack) => void;
}

export const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('useWorkspace must be used inside MusicWorkspace');
  return value;
}
