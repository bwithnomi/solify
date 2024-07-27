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
import { SongList } from "@/models/songList";
import { SongInfo as SongInfoModel } from "@/models/songInfo";
import { Song as SongModel } from "@/models/song";

const contractAddress = process.env.NEXT_PUBLIC_ARTIST_PROGRAM_ID || "";

export class Song {
    constructor(private connection: Connection) {
    }
    public async createSongListInstruction(pubKey: PublicKey): Promise<TransactionInstruction> {
        const ownerPDA = await PDA.getOwnerPDA(pubKey);
        const songInfoPDA = await PDA.getSongInfoPDA(ownerPDA);
        const account = await this.connection.getAccountInfo(songInfoPDA);
        let accountLength = 0;
        if (account?.data) {
            const accountData = SongInfoModel.deserialize(account.data);
            let totalSize = 0;
            if (accountData) {
                totalSize = accountData?.total / 20;
            }
            accountLength = Math.ceil(totalSize);
        }
        const songListPda = await PDA.getSongListPDA(ownerPDA, accountLength.toString());
        const songList = new SongList();
        const buffer = songList.serialize();
        
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
                    pubkey: songInfoPDA,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: songListPda,
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
                contractAddress
            ),
        });

        return instruction;
    }

    public async createAdNewSongInstruction(pubKey: PublicKey, name: string, url: string):Promise<TransactionInstruction> {
        const ownerPDA = await PDA.getOwnerPDA(pubKey);
        const songInfoPDA = await PDA.getSongInfoPDA(ownerPDA);
        const account = await this.connection.getAccountInfo(songInfoPDA);
        let accountLength = 0;
        if (account?.data) {
            console.log(account);
            
            const accountData = SongInfoModel.deserialize(account.data);
            let totalSize = 0;
            if (accountData) {
                totalSize = accountData?.total / 20;
            }
            accountLength = Math.floor(totalSize);
            
        }
        console.log(accountLength);
        const songListPda = await PDA.getSongListPDA(ownerPDA, accountLength.toString());
        console.log(songListPda.toString());
        
        const songList = new SongModel();
        const buffer = songList.serialize(name, url);
        
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
                    pubkey: songInfoPDA,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: songListPda,
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
                contractAddress
            ),
        });

        return instruction;

    }
}
