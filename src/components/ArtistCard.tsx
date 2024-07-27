import { TArtistAccount } from "@/dtos/artist.dto";
import { CSSProperties } from "react";

interface ArtistProps {
  artist: TArtistAccount;
}
const artistImageStyle: CSSProperties = {
  objectFit: "cover",
  borderRadius: "6px",
};
const ArtistCard = ({ artist }: ArtistProps) => {
  return (
    <div className="basis-1/2">
      <p className="text-white text-xl font-bold">Artist</p>
      <div className="mt-2 gap-2 justify-center bg-neutral-800  rounded-md px-4 py-4">
        <div className="rounded-full inline-block w-40 h-40 overflow-hidden object-cover">
          <img
            src={artist?.image || "/images/record.png"}
            alt="artist"
            style={artistImageStyle}
            width="160"
            height="56"
            onError={() => {
              const target = event?.currentTarget as HTMLImageElement;
              if (target) {
                target.src = "/icons/profile.svg";
              }
            }}
            className="object-cover"
          />
        </div>
        <div className="mt-4">
          <p className="text-yellow-500 text-3xl font-bold">{artist.name}</p>
          <p className="text-white text-sm">{artist.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ArtistCard;
