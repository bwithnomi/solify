"use client";

import { TArtistAccount } from "@/dtos/artist.dto";
import { TPlaylistSong } from "@/dtos/playlist.dto";
import { TSong } from "@/dtos/song.dto";
import React, { createContext, useState, useContext, ReactNode } from "react";

interface Song {
  id: number;
  title: string;
  artist: string;
}

interface SongPlayerContextType {
  currentSong: TSong | null;
  currentSongArtist: TArtistAccount | null;
  listToPlay: TPlaylistSong[] | never[];
  playSong: (song: TSong, artist: TArtistAccount | null) => void;
  setListToPlaySong: (list: TPlaylistSong[] | never[]) => void;
}

const SongPlayerContext = createContext<SongPlayerContextType | undefined>(
  undefined
);

export const useSongPlayer = (): SongPlayerContextType => {
  const context = useContext(SongPlayerContext);
  if (!context) {
    throw new Error("useSongPlayer must be used within a SongPlayerProvider");
  }
  return context;
};

interface SongPlayerProviderProps {
  children: ReactNode;
}

export const SongPlayerProvider: React.FC<SongPlayerProviderProps> = ({
  children,
}) => {
  const [currentSong, setCurrentSong] = useState<TSong | null>(null);
  const [currentSongArtist, setCurrentSongArtist] =
    useState<TArtistAccount | null>(null);
  const [listToPlay, setListToPlay] = useState<TPlaylistSong[] | never[]>([]);

  const playSong = (song: TSong, artist: TArtistAccount | null) => {
    setCurrentSong(song);
    setCurrentSongArtist(artist);
  };

  const setListToPlaySong = (list: TPlaylistSong[] | never[]) => {
    setListToPlay(list);
  };
  return (
    <SongPlayerContext.Provider
      value={{
        currentSong,
        currentSongArtist,
        playSong,
        listToPlay,
        setListToPlaySong,
      }}
    >
      {children}
    </SongPlayerContext.Provider>
  );
};