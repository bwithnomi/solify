import { TPlaylist } from '@/dtos/playlist.dto'
import * as borsh from '@project-serum/borsh'
import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    PublicKey,
} from "@solana/web3.js";

export class Playlist {

    borshInstructionSchema = borsh.struct([
        borsh.u8('variant'),
        borsh.str('name'),
    ])

    borshAddSongInstructionSchema = borsh.struct([
        borsh.u8('variant'),
        borsh.str('name'),
        borsh.str('playlist'),
    ])

    static borshPlaylistSongSchema = borsh.struct([
        borsh.struct([
            borsh.str("name"),
            borsh.str("url")
        ], "songs"),
        borsh.struct([
            borsh.bool('is_initialized'),
            borsh.str('name'),
            borsh.str('image'),
            borsh.str('description'),
        ], "artist"),
    ]);
    static borshAccountSchema = borsh.struct([
        borsh.bool('is_initialized'),
        borsh.vec(Playlist.borshPlaylistSongSchema, "songs"),
        borsh.str('name'),
        borsh.option(borsh.publicKey(), "next")
    ])

    serialize(name: string): Buffer {
        const buffer = Buffer.alloc(1000)
        this.borshInstructionSchema.encode({ ...this, variant: 4, name }, buffer)
        return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer))
    }

    addSongSerialize(name: string, playlist: string): Buffer {
        const buffer = Buffer.alloc(1000)
        this.borshAddSongInstructionSchema.encode({ ...this, variant: 6, name, playlist }, buffer)
        return buffer.slice(0, this.borshAddSongInstructionSchema.getSpan(buffer))
    }

    deleteSongSerialize(name: string, playlist: string): Buffer {
        const buffer = Buffer.alloc(1000)
        this.borshAddSongInstructionSchema.encode({ ...this, variant: 7, name, playlist }, buffer)
        return buffer.slice(0, this.borshAddSongInstructionSchema.getSpan(buffer))
    }

    deleteSerialize(name: string): Buffer {
        const buffer = Buffer.alloc(1000)
        this.borshInstructionSchema.encode({ ...this, variant: 5, name }, buffer)
        return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer))
    }

    static deserialize(buffer?: Buffer): TPlaylist | null {
        if (!buffer) {
            return null
        }
        try {
            return this.borshAccountSchema.decode(buffer);
        } catch (e) {
            console.log('Deserialization error:', e)
            console.log(buffer)
            return null
        }
    }
}

