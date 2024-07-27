import { TSongList, TSongInfo } from '@/dtos/song.dto'
import * as borsh from '@project-serum/borsh'

export class SongList {

    constructor() {
    }

    borshInstructionSchema = borsh.struct([
        borsh.u8('variant'),
    ])

    static borshAccountSchema = borsh.struct([
        borsh.bool('is_initialized'),
        borsh.vec(borsh.struct([
            borsh.str("name"),
            borsh.str("url"),
        ]), "songs"),
        borsh.publicKey('owner'),
        borsh.publicKey("next"),
    ])

    serialize(): Buffer {
        const buffer = Buffer.alloc(1000)
        this.borshInstructionSchema.encode({ ...this, variant: 2 }, buffer)
        return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer))
    }

    static deserialize(buffer?: Buffer): TSongList | null {
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