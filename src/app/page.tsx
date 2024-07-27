"use client";

import { CSSProperties } from "react";

import _ from "lodash";
import { Description, Field, Input, Label } from "@headlessui/react";
import clsx from "clsx";
import { useState, useCallback, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { PDA } from "@/composables/address";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SongInfo as SongInfoModel } from "@/models/songInfo";
import { SongList as SongListModel } from "@/models/songList";
import { TSongWithList } from "@/dtos/song.dto";
import { TArtistAccount } from "@/dtos/artist.dto";
import { Artist as ArtistModel } from "@/models/artist";
import { usePlaylist } from "@/context/PlaylistContext";
import WalletBar from "@/components/WalletBar";
import Playlist from "@/components/Playlist";
import ArtistCard from "@/components/ArtistCard";
import SongList from "@/components/ArtistSongsList";
import { Artist } from "@/composables/artist";

const artistImageStyle: CSSProperties = {
  objectFit: "cover",
  borderRadius: "6px",
};

const predefinedArtist = [
  "6ECzUiHVhJ84B3Hq3PmnoE7w8dXUYSmZknqDahqaALF2",
  "8zKKSM3yAwT8e1CzRrN7aWVhxKd8hncsGmW573grbpcT",
  "3nEWZzdhnVWw8Yj4ivJhWn98PB3jYMvJpC3bTTKpE9dN",
];

export default function Home() {
  const { currentPlaylist, setPlaylist } = usePlaylist();
  const [featuredArtists, setFeaturedArtists] = useState<
    TArtistAccount[] | never[]
  >([]);
  const [songs, setSongs] = useState<TSongWithList[]>([]);
  const [artist, setArtist] = useState<TArtistAccount>();
  const [artistKey, setArtistKey] = useState<PublicKey | null>(null);
  const [isHome, setHome] = useState(true);
  const [songsLoading, setSongsLoading] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState("");
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const artistService = new Artist(connection);

  const handleChange = (value: string) => {
    // setInputValue(value);
    debouncedChangeHandler(value);
  };

  const fetchFeaturedArtist = async () => {
    let tempArray: TArtistAccount[] = [];
    for (let index = 0; index < predefinedArtist.length; index++) {
      const element = predefinedArtist[index];
      let artist = await artistService.fetchArtist(
        new PublicKey(element),
        connection
      );
      console.log(artist);

      if (artist) {
        tempArray.push(artist);
      }
      
    }

    setFeaturedArtists(tempArray);
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

  useEffect(() => {
    fetchFeaturedArtist();
  }, []);

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
    if (!infoData?.start) {
      setSongs([]);
      setSongsLoading(false);
      setArtist(undefined);
      return false;
    }
    const accountList = await connection.getAccountInfo(infoData.start);
    if (!accountList) {
      setSongs([]);
      setSongsLoading(false);
      setArtist(undefined);
      return false;
    }

    let listData = SongListModel.deserialize(accountList.data);
    console.log(accountList);

    setSongsLoading(false);
    if (listData) {
      const temp: TSongWithList[] = listData.songs.map((t) => ({
        ...t,
        list: infoData?.start,
      }));

      setArtistKey(artistPDA);
      setSongs(temp);
    }

    const accountArtist = await connection.getAccountInfo(artistPDA);
    const artist = ArtistModel.deserialize(accountArtist?.data);
    setArtist(artist || undefined);
  };

  return (
    <main className="flex min-h-full flex-col py-0 px-4 overflow-y-scroll">
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
              Search by artist&apos;s wallet address
            </Description>
          </Field>
        </div>
      </div>
      {isHome ? (
        <div className="mt-10">
          <p className="text-white text-center font-bold bg-neutral-500 rounded-md py-2 ">
            Select from playlist or search an artist
          </p>
          <p className="text-white text-lg font-bold mt-5 mb-2">
            Featured Artist
          </p>

          <div className="flex flex-row gap-2">
            {featuredArtists.map((a, index) => (
              <div className="bg-neutral-700 px-4 py-4 rounded-md cursor-pointer" onClick={() => fetchSongs(predefinedArtist[index])} key={index}>
                <div className="rounded-full inline-block w-40 h-40 overflow-hidden object-cover">
                  <img
                    src={a?.image || "/images/record.png"}
                    alt="artist"
                    style={artistImageStyle}
                    width="160"
                    height="56"
                    onError={() => {
                      const target = event?.currentTarget as HTMLImageElement;
                      if (target) {
                        target.src = "/icons/profile.svg";
                      }
                    }}
                    className="object-cover"
                  />
                </div>
                <p className="text-white font-bold text-center">{a.name}</p>
              </div>
            ))}
          </div>
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