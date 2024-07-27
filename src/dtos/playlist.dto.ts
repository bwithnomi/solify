import {
    PublicKey,
} from "@solana/web3.js";
import { TArtistAccount } from "./artist.dto";
import { TSong } from "./song.dto";

export type TPlaylistLogs = {
    is_initialized: boolean;
    list: PublicKey[];
    owner: PublicKey;
}

export type TPlaylist = {
    is_initialized: boolean;
    songs: TPlaylistSong[];
    name: string;
}

export type TPlaylistSong = {
    songs: TSong,
    artist: TArtistAccount,
}
