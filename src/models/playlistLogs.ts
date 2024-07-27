import { TPlaylistLogs } from '@/dtos/playlist.dto'
import * as borsh from '@project-serum/borsh'

export class PlaylistLogs {

    constructor() {
    }

    borshInstructionSchema = borsh.struct([
    ])

    static borshAccountSchema = borsh.struct([
        borsh.bool('is_initialized'),
        borsh.vec(borsh.str(), "list"),
        borsh.option(borsh.publicKey(), "next")
    ])

    serialize(name: string): Buffer {
        const buffer = Buffer.alloc(1000)
        this.borshInstructionSchema.encode({ ...this, variant: 4, name }, buffer)
        return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer))
    }

    static deserialize(buffer?: Buffer): TPlaylistLogs | null {
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