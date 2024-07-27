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
import { PDA } from "./address";
import { SongInfo as SongInfoModel } from "@/models/songInfo";
import { Song as SongModel } from "@/models/song";
import { Playlist as PlaylistModel } from "@/models/playlist";
import { TSong, TSongList, TSongWithList } from "@/dtos/song.dto";
import { PlaylistLogs } from "@/models/playlistLogs";
import { TPlaylist } from "@/dtos/playlist.dto";
import { TArtistAccount } from "@/dtos/artist.dto";

export class Playlist {
    constructor(private connection: Connection) {
    }
    public async createPlaylistInstruction(pubKey: PublicKey, name: string): TransactionInstruction {
        const ownerPDA = await PDA.getOwnerPDA(pubKey);
        const playlistLogsPDA = await PDA.getPlaylistLogsPDA(ownerPDA);
        const playlistPDA = await PDA.getPlaylistPDA(ownerPDA, name);

        const playlist = new PlaylistModel();
        const buffer = playlist.serialize(name);

        const instruction = new TransactionInstruction({
            keys: [
                {
                    pubkey: new PublicKey(pubKey),
                    isSigner: true,
                    isWritable: false,
                },
                {
                    pubkey: ownerPDA,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: playlistLogsPDA,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: playlistPDA,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: SystemProgram.programId,
                    isSigner: false,
                    isWritable: false,
                },
            ],
            data: buffer,
            programId: new PublicKey(
                process.env.NEXT_PUBLIC_ARTIST_PROGRAM_ID
            ),
        });

        return instruction;
    }
    public async deletePlaylistInstruction(pubKey: PublicKey, name: string): TransactionInstruction {
        console.log(pubKey.toString(), name);

        const ownerPDA = await PDA.getOwnerPDA(pubKey);
        const playlistLogsPDA = await PDA.getPlaylistLogsPDA(ownerPDA);
        const playlistPDA = await PDA.getPlaylistPDA(ownerPDA, name);

        const playlist = new PlaylistModel();
        const buffer = playlist.deleteSerialize(name);

        const instruction = new TransactionInstruction({
            keys: [
                {
                    pubkey: new PublicKey(pubKey),
                    isSigner: true,
                    isWritable: false,
                },
                {
                    pubkey: ownerPDA,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: playlistLogsPDA,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: playlistPDA,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: SystemProgram.programId,
                    isSigner: false,
                    isWritable: false,
                },
            ],
            data: buffer,
            programId: new PublicKey(
                process.env.NEXT_PUBLIC_ARTIST_PROGRAM_ID
            ),
        });

        return instruction;
    }

    public async getAllPlaylists(pubKey: PublicKey): Promise<PublicKey[] | never[]> {
        try {
            const ownerPDA = await PDA.getOwnerPDA(pubKey);
            const logsPDA = await PDA.getPlaylistLogsPDA(ownerPDA);
            const accountRes = await this.connection.getAccountInfo(logsPDA);
            if (!accountRes) {
                return []
            }
            const accountData = PlaylistLogs.deserialize(accountRes.data)!;

            const allPlaylists = accountData?.list;
            return allPlaylists;
        } catch (error) {
            console.log(error);
            return [];
        }

    }

    public async getPlaylistData(pubKey: PublicKey): Promise<TPlaylist | null> {
        const account = await this.connection.getAccountInfo(pubKey);
        if (!account) {
            return null
        }
        const accountData = PlaylistModel.deserialize(account.data)!;
        return accountData;
    }

    public async addSongToPlaylist(song: TSongWithList, artist: PublicKey, playlist: string, pubKey: PublicKey, songOwner: PublicKey): Promise<TransactionInstruction> {
        const ownerPDA = await PDA.getOwnerPDA(pubKey);
        const songOwnerPDA = await PDA.getOwnerPDA(songOwner);
        const playlistPDA = await PDA.getPlaylistPDA(ownerPDA, playlist);
        const songListPDA = await PDA.getSongListPDA(songOwnerPDA, "0");
        
        const playlistModel = new PlaylistModel();
        const buffer = playlistModel.addSongSerialize(song.name, playlist);

        console.log(ownerPDA.toString(),playlistPDA.toString(),songListPDA.toString(),artist.toString());
        
        const instruction = new TransactionInstruction({
            keys: [
                {
                    pubkey: new PublicKey(pubKey),
                    isSigner: true,
                    isWritable: false,
                },
                {
                    pubkey: ownerPDA,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: playlistPDA,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: songListPDA,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: artist,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: SystemProgram.programId,
                    isSigner: false,
                    isWritable: false,
                },
            ],
            data: buffer,
            programId: new PublicKey(
                process.env.NEXT_PUBLIC_ARTIST_PROGRAM_ID
            ),
        });

        return instruction;
    }
}