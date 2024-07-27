import { TransactionInstruction, PublicKey, SystemProgram, Connection } from '@solana/web3.js'
import * as borsh from '@project-serum/borsh'
import { PDA } from './address'
import { Artist as ArtistModel } from '@/models/artist'
import { Ownership as OwnershipModel } from '@/models/ownership'
import { TOwnerAccount } from '@/dtos/owner.dto'
import { TArtistAccount } from '@/dtos/artist.dto'

export class Artist {
    constructor(private connection: Connection) {
    }

    public async createOwnershipInstruction(pubKey: PublicKey): Promise<TransactionInstruction> {
        const ownerPDA = await PDA.getOwnerPDA(pubKey);
        const ownershipModel = new OwnershipModel();
        const buffer = ownershipModel.serialize();
        console.log(process.env.NEXT_PUBLIC_ARTIST_PROGRAM_ID, SystemProgram.programId);
        
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

    async addArtistInstruction(pubKey: PublicKey, name: string, image: string, description: string): Promise<TransactionInstruction> {
        const ownerPDA = await PDA.getOwnerPDA(pubKey);
        const artist_pda = await PDA.getArtistPDA(ownerPDA);

        const artistModel = new ArtistModel();
        const buffer = artistModel.serialize(name, description, image );

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
                    pubkey: artist_pda,
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

    async fetchArtist(pubKey: PublicKey, connection: Connection): Promise<TArtistAccount | null> {
        const ownerPda = await PDA.getOwnerPDA(pubKey);
        const artistPda = await PDA.getArtistPDA(ownerPda);
        const account = await connection.getAccountInfo(ownerPda);
        const ownerAccount = OwnershipModel.deserialize(account?.data);
    
        if (ownerAccount?.is_initialized) {
            const account = await connection.getAccountInfo(artistPda);
            const artistAccount = ArtistModel.deserialize(account.data);
            return artistAccount
        }
        return null;
    }

    async fetchOwner(pubKey: PublicKey, connection: Connection): Promise<TOwnerAccount | null> {
        const ownerPda = await PDA.getOwnerPDA(pubKey);
        const account = await connection.getAccountInfo(ownerPda);
        const ownerAccount = OwnershipModel.deserialize(account?.data);
        return ownerAccount;
    }
}