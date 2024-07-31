import { useSongPlayer } from "@/context/SongPlayerContext";
import { TArtistAccount } from "@/dtos/artist.dto";
import { TSong, TSongWithList } from "@/dtos/song.dto";
import Image from "next/image";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { usePlaylist } from "@/context/PlaylistContext";
import { useState } from "react";
import { Playlist } from "@/composables/playlist";
import { toast } from "react-toastify";
import {
  PublicKey,
  Transaction
} from "@solana/web3.js";
import { TPlaylistSong } from "@/dtos/playlist.dto";

interface SongsList {
  songs: TSongWithList[];
  artist: TArtistAccount;
  artistKey: PublicKey | null;
  searchedWallet: string;
}

const SongList = ({ songs, artist, artistKey,searchedWallet }: SongsList) => {
  const { playSong,setListToPlaySong } = useSongPlayer();
  const { allPlaylists } = usePlaylist();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const playlistService = new Playlist(connection);
  let [isOpen, setIsOpen] = useState(false);
  let [itemToAdd, setItemToAdd] = useState<TSongWithList | null>(null);

  const addSongToPlaylist = async (playlist: string) => {
    try {
      if (itemToAdd && artistKey && publicKey) {
        
        const transaction = new Transaction();
        let instruction = await playlistService.addSongToPlaylist(
          itemToAdd,
          artistKey,
          playlist,
          publicKey,
          new PublicKey(searchedWallet)
        );
        transaction.add(instruction);
        let txid = await sendTransaction(transaction, connection);
        toast("Song Added", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        close()
      }
    } catch (error) {
        toast.error("Error sending transaction", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        console.error("Error sending transaction:", error);
    }
  };


  const playPlaylistSongs = (song: TSong, artist: TArtistAccount) => {
    playSong(song, artist);
    let listToPlay: TPlaylistSong[] = [];
    listToPlay = songs.map(a => {
      return {songs: {name: a.name, url: a.url}, artist}
    })
    setListToPlaySong(listToPlay);
  }
  function open(song: TSongWithList) {
    setItemToAdd(song);
    setIsOpen(true);
  }

  function close() {
    setItemToAdd(null);
    setIsOpen(false);
  }
  return songs.length ? (
    <div className="basis-1/2">
      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
        __demoMode
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              <DialogTitle
                as="h3"
                className="text-base/7 font-medium text-white"
              >
                Playlists
              </DialogTitle>
              <div className="">
                <p className="mt-2 text-sm/6 text-white/50">Select playlist</p>
                <div className="">
                  {allPlaylists.map((playlist, index) => (
                    <div
                      className="my-1 "
                      onClick={() => addSongToPlaylist(playlist)}
                      key={index}
                    >
                      <span className="text-white capitalize cursor-pointer hover:text-green-400">{playlist}</span>
                    </div>
                  ))}
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <div className="flex flex-col gap-2">
        <p className="text-white text-xl font-bold">Songs</p>
        {songs.map((item, index) => (
          <div
            className="flex flex-row items-center justify-between gap-3 max-h-full w-full max-w-lg hover:bg-neutral-600 p-2 rounded-md duration-100"
            key={`${item.name}-${index}`}
          >
            <div className="flex flex-row gap-2">
              <p className="text-white">{item.name}</p>
              <button
                className=" rounded-full text-xs"
                onClick={() => open(item)}
              >
                <Image
                  width="8"
                  height="0"
                  src={`/icons/plus.svg`}
                  alt="play"
                ></Image>
              </button>
            </div>

            <button
              className="bg-white text-black px-2 py-1 rounded-full text-xs"
              onClick={() => playPlaylistSongs(item, artist)}
            >
              <Image
                width="10"
                height="0"
                src={`/icons/play-dark.svg`}
                alt="play"
              ></Image>
            </button>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="basis-full mt-4">
      <p className="text-red-500 text-center">No songs found</p>
    </div>
  );
};

export default SongList;