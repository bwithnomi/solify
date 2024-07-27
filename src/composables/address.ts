import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    PublicKey,
} from "@solana/web3.js";

export class PDA {
    static async getOwnerPDA(pubkEY: PublicKey): PublicKey {
        const [pda] = await PublicKey.findProgramAddress(
            [pubkEY.toBuffer(), Buffer.from("ownership")],
            new PublicKey(process.env.NEXT_PUBLIC_ARTIST_PROGRAM_ID)
        )
        return pda;
    }

    static async getArtistPDA(pubkEY: PublicKey): PublicKey {
        const [pda] = await PublicKey.findProgramAddress(
            [pubkEY.toBuffer(), Buffer.from("artist")],
            new PublicKey(process.env.NEXT_PUBLIC_ARTIST_PROGRAM_ID)
        )
        return pda;
    }

    static async getSongListPDA(pubkEY: PublicKey,count: string): PublicKey {
        const [pda] = await PublicKey.findProgramAddress(
            [pubkEY.toBuffer(), Buffer.from("songs_list"), Buffer.from(count)],
            new PublicKey(process.env.NEXT_PUBLIC_ARTIST_PROGRAM_ID)
        )
        return pda;
    }

    static async getSongInfoPDA(pubkEY: PublicKey): PublicKey {
        const [pda] = await PublicKey.findProgramAddress(
            [pubkEY.toBuffer(), Buffer.from("info")],
            new PublicKey(process.env.NEXT_PUBLIC_ARTIST_PROGRAM_ID)
        )
        return pda;
    }

    static async getPlaylistLogsPDA(pubkEY: PublicKey): PublicKey {
        const [pda] = await PublicKey.findProgramAddress(
            [pubkEY.toBuffer(), Buffer.from("playlist_record")],
            new PublicKey(process.env.NEXT_PUBLIC_ARTIST_PROGRAM_ID)
        )
        return pda;
    }

    static async getPlaylistPDA(pubkEY: PublicKey, name: string): PublicKey {
        const [pda] = await PublicKey.findProgramAddress(
            [pubkEY.toBuffer(), Buffer.from(name)],
            new PublicKey(process.env.NEXT_PUBLIC_ARTIST_PROGRAM_ID)
        )
        return pda;
    }
}