"use client";

import { TArtistAccount } from "@/dtos/artist.dto";
import { TPlaylist, TPlaylistSong } from "@/dtos/playlist.dto";
import { TSong } from "@/dtos/song.dto";
import React, { createContext, useState, useContext, ReactNode } from "react";

interface PlaylistContextType {
  currentPlaylist: TPlaylist | null;
  allPlaylists: string[] | never[];
  setPlaylist: (playlist: TPlaylist | null) => void;
  setAllPlaylist: (playlist: string[] | never[]) => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(
  undefined
);

export const usePlaylist = (): PlaylistContextType => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error("useSongPlayer must be used within a SongPlayerProvider");
  }
  return context;
};

interface PlaylistProviderProps {
  children: ReactNode;
}

export const PlaylistProvider: React.FC<PlaylistProviderProps> = ({
  children,
}) => {
  const [currentPlaylist, setCurrentPlaylist] = useState<TPlaylist | null>(
    null
  );
  const [allPlaylists, setAllPlaylists] = useState<string[] | never[]>([]);
  const [currentSongArtist, setCurrentSongArtist] =
    useState<TArtistAccount | null>(null);

  const setPlaylist = (playlist: TPlaylist | null) => {
    setCurrentPlaylist(playlist);
  };
  const setAllPlaylist = (playlist: string[] | never[]) => {
    setAllPlaylists(playlist);
  };

  return (
    <PlaylistContext.Provider value={{ currentPlaylist, setPlaylist, allPlaylists, setAllPlaylist }}>
      {children}
    </PlaylistContext.Provider>
  );
};
