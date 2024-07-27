"use client"

import { TArtistAccount } from '@/dtos/artist.dto';
import { TSong } from '@/dtos/song.dto';
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Song {
  id: number;
  title: string;
  artist: string;
}

interface SongPlayerContextType {
  currentSong: TSong | null;
  currentSongArtist: TArtistAccount | null;
  playSong: (song: TSong, artist: TArtistAccount | null) => void;
}

const SongPlayerContext = createContext<SongPlayerContextType | undefined>(undefined);

export const useSongPlayer = (): SongPlayerContextType => {
  const context = useContext(SongPlayerContext);
  if (!context) {
    throw new Error('useSongPlayer must be used within a SongPlayerProvider');
  }
  return context;
};

interface SongPlayerProviderProps {
  children: ReactNode;
}

export const SongPlayerProvider: React.FC<SongPlayerProviderProps> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<TSong | null>(null);
  const [currentSongArtist, setCurrentSongArtist] = useState<TArtistAccount | null>(null);

  const playSong = (song: TSong, artist: TArtistAccount | null) => {
    setCurrentSong(song);
    setCurrentSongArtist(artist);
  };

  return (
    <SongPlayerContext.Provider value={{ currentSong, currentSongArtist, playSong }}>
      {children}
    </SongPlayerContext.Provider>
  );
};
