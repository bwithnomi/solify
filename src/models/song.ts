import { TSong } from '@/dtos/song.dto'
import * as borsh from '@project-serum/borsh'

export class Song {

    constructor() {
    }

    borshInstructionSchema = borsh.struct([
        borsh.u8('variant'),
        borsh.str('name'),
        borsh.str('url'),
    ])

    static borshAccountSchema = borsh.struct([
        borsh.bool('is_initialized'),
        borsh.str('name'),
        borsh.str('url'),
    ])

    serialize(name: string, url: string): Buffer {
        const buffer = Buffer.alloc(1000)
        this.borshInstructionSchema.encode({ ...this, variant: 3, name, url }, buffer)
        return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer))
    }

    static deserialize(buffer?: Buffer): TSong | null {
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