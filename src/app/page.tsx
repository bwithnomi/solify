"use client";

import _ from "lodash";
import { Description, Field, Input, Label } from "@headlessui/react";
import clsx from "clsx";
import { useState, useCallback, useEffect, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  PublicKey,
} from "@solana/web3.js";
import { PDA } from "@/composables/address";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SongInfo as SongInfoModel } from "@/models/songInfo";
import { SongList as SongListModel } from "@/models/songList";
import { TSong, TSongWithList } from "@/dtos/song.dto";
import { useSongPlayer } from "@/context/SongPlayerContext";
import { TArtistAccount } from "@/dtos/artist.dto";
import Image from "next/image";
import { Artist as ArtistModel } from "@/models/artist";
import { usePlaylist } from "@/context/PlaylistContext";
import WalletBar from "@/components/WalletBar";
import Playlist from "@/components/Playlist";
import ArtistCard from "@/components/ArtistCard";
import SongList from "@/components/ArtistSongsList";

export default function Home() {
  const { playSong } = useSongPlayer();
  const { currentPlaylist, setPlaylist } = usePlaylist();
  const [songs, setSongs] = useState<TSongWithList[]>([]);
  const [artist, setArtist] = useState<TArtistAccount>();
  const [artistKey, setArtistKey] = useState<PublicKey | null>();
  const [isHome, setHome] = useState(true);
  const [songsLoading, setSongsLoading] = useState(false);
  const { connected, publicKey, sendTransaction } = useWallet();
  const [debouncedValue, setDebouncedValue] = useState("");
  const { connection } = useConnection();
  const hasSongs = useMemo(() => {
    if (songs.length > 0) {
      return true;
    }
    return false;
  }, [songs]);

  const handleChange = (value: string) => {
    // setInputValue(value);
    debouncedChangeHandler(value);
  };

  // Debounce the input change handler
  const debouncedChangeHandler = useCallback(
    _.debounce((value) => {
      setDebouncedValue(value);
    }, 1000), // 300ms debounce delay
    []
  );

  useEffect(() => {
    // Cleanup function to cancel debounce if the component unmounts
    return () => {
      debouncedChangeHandler.cancel();
    };
  }, [debouncedChangeHandler]);

  useEffect(() => {
    if (debouncedValue == "") {
      setHome(true);
      setSongs([]);
      setArtist(undefined);
    } else {
      try {
        const wallet = new PublicKey(debouncedValue);
        if (!PublicKey.isOnCurve(wallet)) {
          alert("Invalid wallet address");
          setArtist(undefined);
          setSongs([]);
          setHome(true);
        } else {
          fetchSongs(debouncedValue);
        }
      } catch (error) {
        alert("Invalid wallet address");
        setArtist(undefined);
        setSongs([]);
        setHome(true);
      }
    }
  }, [debouncedValue]);

  useEffect(() => {
    if (currentPlaylist) {
      setHome(false);
    }
    console.log(currentPlaylist);
  }, [currentPlaylist]);

  const fetchSongs = async (pubkey: string) => {
    setHome(false);
    setPlaylist(null);
    setSongsLoading(true);
    const wallet = new PublicKey(pubkey);
    const ownerPDA = await PDA.getOwnerPDA(wallet);
    const artistPDA = await PDA.getArtistPDA(ownerPDA);
    console.log(artistPDA.toString());

    const songInfoPDA = await PDA.getSongInfoPDA(ownerPDA);
    const account = await connection.getAccountInfo(songInfoPDA);
    if (!account) {
      setSongs([]);
      setSongsLoading(false);
      setArtist(undefined);
      return false;
    }
    let infoData = SongInfoModel.deserialize(account.data);

    const accountList = await connection.getAccountInfo(infoData?.start);
    if (!accountList) {
      setSongs([]);
      setSongsLoading(false);
      setArtist(undefined);
      return false;
    }

    let listData = SongListModel.deserialize(accountList.data);

    setSongsLoading(false);
    if (listData) {
      const temp: TSongWithList[] = listData.songs.map((t) => ({
        ...t,
        list: accountList.data,
      }));
      setArtistKey(artistPDA);
      setSongs(temp);
    }

    const accountArtist = await connection.getAccountInfo(artistPDA);
    const artist = ArtistModel.deserialize(accountArtist?.data);
    setArtist(artist || undefined);
  };

  return (
    <main className="flex min-h-full flex-col py-0 px-4 overflow-scroll">
      <div className="flex flex-row gap-2">
        <div className="p-4 bg-neutral-700 rounded-md basis-1/2">
          <WalletBar />
        </div>
        <div className=" basis-1/2">
          <Field>
            <Label className="text-sm/6 font-medium text-white">
              Search here
            </Label>
            <Input
              placeholder="****4d9h"
              className={clsx(
                "mt-2 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white",
                "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
              )}
              onChange={(event) => handleChange(event.target.value)}
            />
            <Description className="text-sm/6 text-white/50">
              Search by artist's wallet address
            </Description>
          </Field>
        </div>
      </div>
      {isHome ? (
        <div className="mt-10 bg-neutral-500 rounded-md py-2">
          <p className="text-white text-center font-bold">
            Select from playlist or search and artist
          </p>
        </div>
      ) : currentPlaylist ? (
        <div className="mt-10">
          <Playlist currentPlaylist={currentPlaylist} />
        </div>
      ) : (
        <div className="flex flex-row mt-7 gap-4">
          {artist && <ArtistCard artist={artist} />}
          {songsLoading ? (
            <div className="text-white mt-4">Searching...</div>
          ) : (
            <SongList
              songs={songs}
              artist={artist}
              artistKey={artistKey}
              searchedWallet={debouncedValue}
            />
          )}
        </div>
      )}
    </main>
  );
}
