"use client";

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
import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { SidebarLogo } from "./SpotifyLogo";
import { useEffect, useState } from "react";
import { Song } from "@/composables/song";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PDA } from "@/composables/address";
import { SongInfo as SongInfoModel } from "@/models/songInfo";
import { SongList as SongListModel } from "@/models/songList";
import { Song as SongModel } from "@/models/song";
import PinataService from "@/composables/pinata";
import { Playlist } from "@/composables/playlist";
import { TSong } from "@/dtos/song.dto";
import { usePlaylist } from "@/context/PlaylistContext";
import { toast } from "react-toastify";
import { TPlaylist } from "@/dtos/playlist.dto";
import { TArtistAccount } from "@/dtos/artist.dto";
import { Artist as ArtistService } from "@/composables/artist";

interface FormValues {
  name: string;
  song: string;
}

interface PlaylistFormValues {
  name: string;
}

const playlistValidationSchema = Yup.object({
  name: Yup.string()
    .required("Title is required")
    .max(32, "Name can only be 32 characters long"),
});

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Title is required")
    .max(64, "Name can only be 64 characters long"),
});

export default function Sidebar() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { currentPlaylist, setPlaylist, setAllPlaylist, allPlaylists } = usePlaylist();
  const { connection } = useConnection();
  const pinataService = new PinataService();
  const songService = new Song(connection);
  const artistService = new ArtistService(connection);
  const playlistService = new Playlist(connection);
  const initialValues: FormValues = { name: "", song: "" };
  const initialPlaylistValues: PlaylistFormValues = { name: "" };
  let [isOpen, setIsOpen] = useState(false);
  let [isOpenPlaylist, setIsPlaylist] = useState(false);
  let [artist, setArtist] = useState<TArtistAccount | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  function openPlaylistModal() {
    setIsPlaylist(true);
  }

  function closePlaylistModal() {
    setIsPlaylist(false);
  }

  const uploadNewSong = async (songToUpload: FormValues) => {
    const ownerPDA = await PDA.getOwnerPDA(publicKey);
    const songInfoPDA = await PDA.getSongInfoPDA(ownerPDA);
    let accountInfo = await connection.getAccountInfo(songInfoPDA);
    let data = SongInfoModel.deserialize(accountInfo?.data);
    const songService = new Song(connection);
    const transaction = new Transaction();

    if (!data || data.total % 20 == 0) {
      const songListInstruction = await songService.createSongListInstruction(
        publicKey
      );
      transaction.add(songListInstruction);
    }

    const instruction = await songService.createAdNewSongInstruction(
      publicKey,
      songToUpload.name,
      songToUpload.song
    );
    transaction.add(instruction);
    let txid = await sendTransaction(transaction, connection);

    toast("🦄 Song uploaded!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    setTimeout(() => {}, 1000);
    close();
  };

  const getAllPlaylists = async () => {
    let data = await playlistService.getAllPlaylists(publicKey);
    setAllPlaylist(data);
  };

  const createFirstPlaylist = async (name: string) => {
    try {
      const transaction = new Transaction();
      const instruction = await playlistService.createPlaylistInstruction(
        publicKey,
        name
      );
      transaction.add(instruction);
      let txid = await sendTransaction(transaction, connection);
      setAllPlaylist([...allPlaylists, name]);

      toast("🦄 Song uploaded!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
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

  const loadPlaylist = async (playlist_title: string) => {
    if (playlist_title != currentPlaylist?.name) {
      const ownerPda = await PDA.getOwnerPDA(publicKey);
      const playlistPDA = await PDA.getPlaylistPDA(ownerPda, playlist_title);
      const playlist = await playlistService.getPlaylistData(playlistPDA);
      setPlaylist(playlist);
    }
  };

  const deletePlaylist = async (playlist: string) => {
    try {
      const transaction = new Transaction();
      console.log(playlist);

      const instruction = await playlistService.deletePlaylistInstruction(
        publicKey,
        playlist
      );
      transaction.add(instruction);
      let txid = await sendTransaction(transaction, connection);
      const playlists = [...allPlaylists];
      setAllPlaylist(playlists.filter((a) => a != playlist));

      toast("🦄 Playlist Deleted", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
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
  useEffect(() => {
    setIsMounted(true);
    if (connected) {
      artistService.fetchArtist(publicKey, connection).then((data) => {
        setArtist(data);
      })
      getAllPlaylists();
    }
  }, [connected]);

  return (
    <>
      <Dialog
        open={isOpenPlaylist}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={closePlaylistModal}
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
                Create Playlist
              </DialogTitle>
              {connected ? (
                <div className="">
                  <p className="mt-2 text-sm/6 text-white/50">
                    Create new playlist
                  </p>
                  <div className="">
                    <Formik
                      initialValues={initialPlaylistValues}
                      validationSchema={playlistValidationSchema}
                      onSubmit={async (
                        values: PlaylistFormValues,
                        { setSubmitting }
                      ) => {
                        setSubmitting(true);
                        await createFirstPlaylist(values.name);
                        setSubmitting(false);
                      }}
                    >
                      {({ isSubmitting }) => (
                        <Form>
                          <div className="my-1">
                            <label htmlFor="name" className="text-white block">
                              Title
                            </label>
                            <Field
                              type="text"
                              name="name"
                              className="bg-neutral-400 rounded-sm outline-none px-2 block w-full h-8"
                            />
                            <ErrorMessage
                              name="name"
                              component="div"
                              className="text-red-600 text-xs"
                            />
                          </div>
                          <div className="mt-4">
                            <Button
                              className="inline-flex items-center gap-2 rounded-md bg-green-500 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:text-green-600 transition-all data-[hover]:bg-white data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
                              type="submit"
                              disabled={isSubmitting}
                            >
                              Submit
                            </Button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </div>
              ) : (
                <div className="">
                  <p className="mt-2 text-sm/6 text-white/50">
                    Create ownership token
                  </p>
                </div>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
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
                Song upload
              </DialogTitle>
              {artist ? (
                <div className="">
                  <p className="mt-2 text-sm/6 text-white/50">Add new song</p>
                  <div className="">
                    <Formik
                      initialValues={initialValues}
                      validationSchema={validationSchema}
                      onSubmit={async (
                        values: FormValues,
                        { setSubmitting }
                      ) => {
                        setSubmitting(true);
                        let input = document.getElementById("image");
                        let files = input?.files;
                        if (files[0].size > 12000000) {
                          alert("Max file size is 12mb");
                          return false;
                        }
                        // Create a new FormData object
                        var formData = new FormData();
                        formData.append("file", files[0]);

                        const cid = await pinataService
                          .uploadImage(formData)
                          .catch((err) => {
                            console.log(err);
                            throw Error("Pinata Error");
                          });
                        await uploadNewSong({ name: values.name, song: cid });
                        setSubmitting(false);
                      }}
                    >
                      {({ isSubmitting }) => (
                        <Form>
                          <div className="my-1">
                            <label htmlFor="name" className="text-white block">
                              Title
                            </label>
                            <Field
                              type="text"
                              name="name"
                              className="bg-neutral-400 rounded-sm outline-none px-2 block w-full h-8"
                            />
                            <ErrorMessage
                              name="name"
                              component="div"
                              className="text-red-600 text-xs"
                            />
                          </div>

                          <div className="my-1">
                            <label htmlFor="image" className="text-white block">
                              Audio
                            </label>
                            <input type="file" id="image" accept="audio/*" />
                            <ErrorMessage
                              name="image"
                              component="div"
                              className="text-red-600 text-xs"
                            />
                          </div>
                          <div className="mt-4">
                            <Button
                              className="inline-flex items-center gap-2 rounded-md bg-green-500 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:text-green-600 transition-all data-[hover]:bg-white data-[focus]:outline-1 data-[focus]:outline-white data-[open]:bg-gray-700"
                              type="submit"
                              disabled={isSubmitting}
                            >
                              Submit
                            </Button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </div>
              ) : (
                <div className="">
                  <p className="mt-2 text-sm/6 text-white/50">
                    Create ownership token
                  </p>
                </div>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
      <div className="grid grid-cols-1 grid-rows-4 overflow-hidden h-full max-h-full">
        <div className="card-1 p-4 bg-neutral-900 rounded-md col-span-1 row-span-1">
          <div className="">
            <SidebarLogo></SidebarLogo>
            <div
              className="flex flex-row items-center mt-5 gap-5 cursor-pointer"
              onClick={open}
            >
              <Image
                width="20"
                height="20"
                src={`/icons/upload.svg`}
                alt="upload"
              />
              <p className="text-white">Add a Song</p>
            </div>
          </div>
        </div>
        <div className="card-1 px-4 pt-4 pb-8 bg-neutral-900 rounded-md mt-2 col-span-1 row-span-3 overflow-scroll">
          <div className="">
            <div className="flex flex-row items-center gap-2">
              <Image
                width="20"
                height="20"
                src={`/icons/record.svg`}
                alt="library"
              />
              <p className="text-neutral-400 font-bold">Your Library</p>
              {allPlaylists.length > 0 && (
                <Image
                  width="20"
                  height="20"
                  src={`/icons/plus.svg`}
                  alt="upload"
                  className=" cursor-pointer"
                  onClick={openPlaylistModal}
                />
              )}
            </div>
            {allPlaylists.length > 0 ? (
              <div className="flex flex-col mt-5 gap-2">
                {allPlaylists.map((p, index) => (
                  <div
                    className="bg-neutral-700 rounded-md px-2 py-1 capitalize flex justify-between items-center"
                    key={index}
                  >
                    <span
                      className="text-white font-bold font-mono basis-auto block cursor-pointer text-ellipsis overflow-hidden max-w-52"
                      onClick={() => loadPlaylist(p)}
                    >
                      {p}
                    </span>
                    <Button onClick={() => deletePlaylist(p)} className="px-1">
                      <Image
                        width="10"
                        height="20"
                        src={`/icons/delete.svg`}
                        alt="upload"
                      />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="lib-card-1 p-4 bg-neutral-800 rounded-md mt-5">
                <p className="text-white font-bold">
                  Create you first playlist
                </p>
                <p className="text-white text-sm my-1">
                  It's easy, we'll help you
                </p>

                <Button
                  onClick={() => createFirstPlaylist("liked")}
                  className="rounded-full mt-4 font-bold bg-white py-1 px-4 text-sm text-black data-[active]:bg-sky-700"
                >
                  Create playlist
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
