import { TSongList, TSongInfo } from '@/dtos/song.dto'
import * as borsh from '@project-serum/borsh'

export class SongInfo {


    borshInstructionSchema = borsh.struct([
        borsh.u8('variant'),
    ])

    static borshAccountSchema = borsh.struct([
        borsh.bool('is_initialized'),
        borsh.u32('total'),
        borsh.publicKey('start'),
    ])

    serialize(): Buffer {
        const buffer = Buffer.alloc(1000)
        this.borshInstructionSchema.encode({ ...this, variant: 0 }, buffer)
        return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer))
    }

    static deserialize(buffer?: Buffer): TSongInfo | null {
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