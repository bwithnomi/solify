"use client";

import SongInfo from "./Player/SongInfo";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import ConnectionModal from "@/components/Player/ConnectionModal";
import { useEffect } from "react";

export default function Footer() {
  const { connected } = useWallet();
  useEffect(() => {}, [connected]);
  return (
    <footer className="py-2 h-full">
      {connected ? (
        <SongInfo></SongInfo>
      ) : (
        <div className="flex flex-row justify-center items-center h-full">
          <p className="text-green-500 font-bold">
            Please connect to a Wallet first!
          </p>
        </div>
      )}
    </footer>
  );
}
