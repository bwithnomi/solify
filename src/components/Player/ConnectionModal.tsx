'use client'

import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import React, { FC, useCallback } from "react";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import styled from 'styled-components';

export const SendSOLToRandomAddress: FC = () => {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction} = useWallet();

  const onClick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    // 890880 lamports as of 2022-09-01
    const lamports = await connection.getMinimumBalanceForRentExemption(0);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: Keypair.generate().publicKey,
        lamports,
      })
    );

    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    const signature = await sendTransaction(transaction, connection, {
      minContextSlot,
    });

    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    });
  }, [publicKey, sendTransaction, connection]);

  return (
    <div className="">
      <button className="text-white" onClick={onClick} disabled={!publicKey}>
        <h1>
          Wallet Public Key:{" "}
          {publicKey ? publicKey.toString() : "Not connect"}
        </h1>
      </button>
      <div className="flex flex-row">
        <CustomWalletButton className="text-sm"/>
        {connected && (<WalletDisconnectButton className="text-sm bg-red-400"/>)}
      </div>
    </div>
  );
};
const CustomWalletButton = styled(WalletMultiButton)`
  & button{
    background: red !important;
  }
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #45a049;
    }

    &:active {
        background-color: #3e8e41;
    }
`;
export default SendSOLToRandomAddress;
