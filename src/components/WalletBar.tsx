"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import { useEffect, useState } from "react";
import { Ownership } from "@/models/ownership";
import { toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import PinataService from "@/composables/pinata";
import { TArtistAccount } from "@/dtos/artist.dto";
import { PDA } from "@/composables/address";
import { Artist } from "@/composables/artist";

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .max(32, "Name can only be 32 characters long"),
  description: Yup.string()
    .required("Description is required")
    .max(256, "Name can only be 256 characters long"),
});
interface FormValues {
  name: string;
  description: string;
  image: any;
}

export default function WalletBar() {
  const pinataService = new PinataService();
  const initialValues: FormValues = { name: "", description: "", image: "" };
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const artistService = new Artist(connection);
  const [isMounted, setIsMounted] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  let [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<TArtistAccount | null>(null);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  const checkOwnership = async () => {
    if (!publicKey) {
      alert("Please connect your wallet!");
      return () => {};
    }

    const ownerAccount = await artistService.fetchOwner(publicKey, connection);

    if (ownerAccount?.is_initialized) {
      checkProfile();
    }
    if (ownerAccount?.verified) {
      setIsVerified(ownerAccount.verified);
    }
  };

  const checkProfile = async () => {
    if (!publicKey) {
      return false;
    }
    setUserProfile(await artistService.fetchArtist(publicKey, connection));
  };

  const getOwnershipToken = async (
    name: string,
    image: string,
    description: string
  ) => {
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
      const ownershipInstruction =
        await artistService.createOwnershipInstruction(publicKey);
      const artistInstruction = await artistService.addArtistInstruction(
        publicKey,
        name,
        image,
        description
      );
      const transaction = new web3.Transaction();
      transaction.add(ownershipInstruction);
      transaction.add(artistInstruction);
      let txid = await sendTransaction(transaction, connection);


      toast("🦄 Account created!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setTimeout(() => {
        checkOwnership();
      }, 5000);
    } catch (error) {

      toast("🦄 Error sending transaction", {
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

  useEffect(() => {
    setIsMounted(true);
    if (connected) {
      checkOwnership();
    }
  }, []);
  useEffect(() => {
    if (connected) {
      checkOwnership();
    }
  }, [connected]);

  if (!isMounted) {
    return <div className="text-white">Connecting...</div>; // or a loading spinner, etc.
  }
  return (
    <>
      <div className="">
        <div className="flex flex-row gap-2">
          <WalletMultiButton />
          {connected &&
            (!userProfile ? (
              <Button
                onClick={open}
                className="inline-flex items-center gap-2 rounded-md bg-white py-1.5 px-3 text-sm/6 font-semibold text-black shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-200 data-[open]:bg-gray-200 data-[focus]:outline-1 data-[focus]:outline-white"
              >
                Get Ownership Token
              </Button>
            ) : (
              isVerified && (
                <div className="">
                  <p className="text-white font-serif font-bold">
                    <span className="text-ellipsis overflow-hidden w-52 block">
                      {userProfile?.name}
                    </span>
                    &nbsp;
                    <span className="text-white bg-green-500 px-2 py-1 rounded-full text-xs font-sans font-bold">
                      {isVerified ? "Verified" : "Not Verified"}
                    </span>
                  </p>
                </div>
              )
            ))}
        </div>
      </div>
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
                User Profile
              </DialogTitle>
              {connected ? (
                <div className="">
                  <p className="mt-2 text-sm/6 text-white/50">
                    Create Artist Profile
                  </p>
                  <div className="">
                    <Formik
                      initialValues={initialValues}
                      validationSchema={validationSchema}
                      onSubmit={async (
                        values: FormValues,
                        { setSubmitting }
                      ) => {
                        let input = document.getElementById("image") as HTMLInputElement;
                        let files = input?.files;
                        if (!files) {
                          return false;
                        }

                        const fileType = files[0].type;
                        if (!fileType.startsWith('image/')) {
                          alert("Please select a valid image");
                          return;
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
                        await getOwnershipToken(
                          values.name,
                          cid,
                          values.description
                        );
                      }}
                    >
                      {({ isSubmitting }) => (
                        <Form>
                          <div className="my-1">
                            <label htmlFor="name" className="text-white block">
                              Name
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
                            <label
                              htmlFor="description"
                              className="text-white block"
                            >
                              Description
                            </label>
                            <Field
                              type="text"
                              name="description"
                              className="bg-neutral-400 rounded-sm outline-none px-2 block w-full h-8"
                            />
                            <ErrorMessage
                              name="description"
                              component="div"
                              className="text-red-600 text-xs"
                            />
                          </div>

                          <div className="my-1">
                            <label htmlFor="image" className="text-white block">
                              Image
                            </label>
                            <input type="file" id="image" />
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
    </>
  );
}
