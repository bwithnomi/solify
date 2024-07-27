import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    PublicKey,
} from "@solana/web3.js";

const contractAddress = process.env.NEXT_PUBLIC_ARTIST_PROGRAM_ID || "";

export class PDA {
    static async getOwnerPDA(pubkEY: PublicKey): Promise<PublicKey> {
        const [pda] = await PublicKey.findProgramAddress(
            [pubkEY.toBuffer(), Buffer.from("ownership")],
            new PublicKey(contractAddress)
        )
        return pda;
    }

    static async getArtistPDA(pubkEY: PublicKey): Promise<PublicKey> {
        const [pda] = await PublicKey.findProgramAddress(
            [pubkEY.toBuffer(), Buffer.from("artist")],
            new PublicKey(contractAddress)
        )
        return pda;
    }

    static async getSongListPDA(pubkEY: PublicKey,count: string): Promise<PublicKey> {
        const [pda] = await PublicKey.findProgramAddress(
            [pubkEY.toBuffer(), Buffer.from("songs_list"), Buffer.from(count)],
            new PublicKey(contractAddress)
        )
        return pda;
    }

    static async getSongInfoPDA(pubkEY: PublicKey): Promise<PublicKey> {
        const [pda] = await PublicKey.findProgramAddress(
            [pubkEY.toBuffer(), Buffer.from("info")],
            new PublicKey(contractAddress)
        )
        return pda;
    }

    static async getPlaylistLogsPDA(pubkEY: PublicKey): Promise<PublicKey> {
        const [pda] = await PublicKey.findProgramAddress(
            [pubkEY.toBuffer(), Buffer.from("playlist_record")],
            new PublicKey(contractAddress)
        )
        return pda;
    }

    static async getPlaylistPDA(pubkEY: PublicKey, name: string): Promise<PublicKey> {
        const [pda] = await PublicKey.findProgramAddress(
            [pubkEY.toBuffer(), Buffer.from(name)],
            new PublicKey(contractAddress)
        )
        return pda;
    }
}