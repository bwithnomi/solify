import {
    PublicKey,
} from "@solana/web3.js";

export type TSongInfo = {
    is_initialized: boolean;
    total: number;
    start: PublicKey;
}

export type TSong = {
    name: string;
    url: string;
}

export type TSongWithList = TSong & {
    list: PublicKey
}

export type TSongList = {
    is_initialized: boolean;
    songs: TSong[];
    owner: PublicKey;
    next: PublicKey;
}