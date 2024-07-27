import { TArtistAccount } from '@/dtos/artist.dto'
import * as borsh from '@project-serum/borsh'

export class Artist {

    constructor() {
    }

    borshInstructionSchema = borsh.struct([
        borsh.u8('variant'),
        borsh.str('name'),
        borsh.str('image'),
        borsh.str('description'),
    ])

    static borshAccountSchema = borsh.struct([
        borsh.bool('is_initialized'),
        borsh.str('name'),
        borsh.str('image'),
        borsh.str('description'),
    ])

    serialize(name: string, description: string, image: string): Buffer {
        const buffer = Buffer.alloc(1000)
        this.borshInstructionSchema.encode({ variant: 1, name, image, description  }, buffer)
        return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer))
    }

    static deserialize(buffer?: Buffer): TArtistAccount | null {
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