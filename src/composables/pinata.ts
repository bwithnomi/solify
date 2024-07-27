import axios from "axios";

interface ArtistMetadata {
    image: string;
    name: string;
    description: string;
}

class PinataService {
    JWT = "";
    URL = "";
    API_URL = "";
    constructor() {
        this.JWT = process.env.NEXT_PUBLIC_PINATA_API_JWT || "";
        this.URL = process.env.NEXT_PUBLIC_PINATA_BASE_URL || "";
        this.API_URL = process.env.NEXT_PUBLIC_PINATA_API_URL || "";
    }

    /**
     * @desc it returns metadata uri after uploading it to IPFS
     * @param {object} metadata_obj 
     * @returns {string}
     */
    async uploadMetadata({ image, name, description }: ArtistMetadata) {
        try {
            
            const metadata = {
                image,
                name,
                description,
            };
            // Uploading metadata file to ipfs
            const apiUrl = `${this.API_URL}/pinJSONToIPFS`;
            const headers = {
                accept: "application/json",
                authorization: `Bearer ${this.JWT}`,
                "content-type": "application/json",
            };
            const data = {
                pinataContent: metadata,
                pinataMetadata: {
                    name: `${name}.json`,
                },
            };
            let metadataURI = "";
            await axios
                .post(apiUrl, data, { headers })
                .then((response: any) => {
                    metadataURI = `${this.URL}/ipfs/${response?.data?.IpfsHash}`;
                })
                .catch((error) => {
                    throw new Error(error);
                });
            return metadataURI;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * @desc uploads image to IPFS and return its hash
     * @param {FormData} formData 
     * @returns {string}
     */
    async uploadImage(formData) {
        try {
            const apiUrl = `${this.API_URL}/pinFileToIPFS`;
            const ipfsData = await axios.post(apiUrl, formData, {
                maxBodyLength: "Infinity",
                headers: {
                    "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
                    authorization: `Bearer ${this.JWT}`,
                },
            });
            const IpfsHash = ipfsData.data.IpfsHash;
            return `${this.URL}/ipfs/${IpfsHash}`;
        } catch (error) {
            throw new Error(error);
        }
    }
}

export default PinataService;
