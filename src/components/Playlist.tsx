"use client";

import { Transaction } from "@solana/web3.js";
import Image from "next/image";
import { toast } from "react-toastify";
import { TPlaylist } from "@/dtos/playlist.dto";
import { useSongPlayer } from "@/context/SongPlayerContext";
import { TSong } from "@/dtos/song.dto";
import { Playlist as PlaylistService } from "@/composables/playlist";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

interface playlistProps {
  currentPlaylist: TPlaylist;
}

// Array of Tailwind CSS background color classes
const bgClasses = [
  "from-red-500",
  "from-purple-500",
  "from-yellow-600",
  "from-purple-500",
  "from-lime-500",
  "from-cyan-500",
  "from-sky-500",
  "from-blue-500",
  "from-pink-500",
  "from-rose-500",
  "from-white",
];

const Playlist = (props: playlistProps) => {
  const { playSong } = useSongPlayer();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const deleteSong = async (song: TSong) => {
    try {
      if (!publicKey) {
        toast.error("Wallet not connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        return false;
      }
      const playlistService = new PlaylistService(connection);

      const transaction = new Transaction();

      const instruction = await playlistService.deleteSongFromPlaylist(
        song,
        props.currentPlaylist.name,
        publicKey
      );

      transaction.add(instruction);
      let txid = await sendTransaction(transaction, connection);

      toast("🦄 Song Removed", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });

      props.currentPlaylist.songs = props.currentPlaylist.songs.filter(
        (a) => a.songs.name != song.name
      );
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
    }
  };
  const bgClass = bgClasses[Math.floor(Math.random() * bgClasses.length)];
  return (
    <div
      className={`${bgClass} bg-gradient-to-b from-purple-600 to-black py-10 px-5 rounded-t-3xl h-full`}
    >
      <div className="">
        <div className="flex flex-row gap-3">
          <div
            className={`${bgClass} bg-gradient-to-b  to-black px-2 py-2 rounded-lg`}
          >
            <Image
              width="80"
              height="0"
              src={`/icons/headphones.svg`}
              alt="play"
            ></Image>
          </div>
          <div className="">
            <p className="text-white text-sm">Playlist</p>
            <p className="text-3xl font-bold text-yellow-400 font-mono capitalize">
              {props.currentPlaylist.name}
            </p>
            <p className="text-white text-sm">
              {props.currentPlaylist.songs.length}&nbsp;
              {props.currentPlaylist.songs.length > 1 ? "Songs" : "Song"}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <p className="text-white text-xl font-bold">Songs</p>
        <div className="mt-2">
          <table>
            <thead>
              <tr>
                <td className="text-yellow-500 px-3">#</td>
                <td className="text-yellow-500 px-3 w-56 font-serif">Title</td>
                <td className="text-yellow-500 px-3 w-56">Artist</td>
                <td className="text-yellow-500 px-3"></td>
                <td className="text-yellow-500 px-3"></td>
              </tr>
            </thead>
            <tbody>
              {props.currentPlaylist.songs.map((item, index) => (
                <tr key={index} className="rounded-md px-2">
                  <td className="text-white px-3 py-1">{index + 1}</td>
                  <td className="text-white px-3 py-1">{item.songs.name}</td>
                  <td className="text-white px-3 py-1">{item.artist.name}</td>
                  <td className="text-white px-3 py-1">
                    <button
                      className="bg-white text-black px-2 py-1 rounded-full text-xs"
                      onClick={() => playSong(item.songs, item.artist || null)}
                    >
                      <Image
                        width="10"
                        height="0"
                        src={`/icons/play-dark.svg`}
                        alt="play"
                      ></Image>
                    </button>
                  </td>
                  <td className="text-white px-3 py-1">
                    <button
                      className="bg-white text-black px-2 py-2 rounded-full text-xs"
                      onClick={() => deleteSong(item.songs)}
                    >
                      <Image
                        width="10"
                        height="20"
                        src={`/icons/delete.svg`}
                        alt="upload"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Playlist;
