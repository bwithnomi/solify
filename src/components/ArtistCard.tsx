import { TArtistAccount } from "@/dtos/artist.dto";

interface ArtistProps {
  artist: TArtistAccount;
}
const artistImageStyle = {
  objectFit: "cover",
  borderRadius: "6px",
};
const ArtistCard = ({ artist }: ArtistProps) => {
  return (
    <div className="basis-1/2">
      <p className="text-white text-xl font-bold">Artist</p>
      <div className="mt-2 gap-2 justify-center bg-neutral-800  rounded-md px-4 py-4">
        <div className="rounded-full inline-block">
          <img
            src={artist?.image || "/images/record.png"}
            alt="artist"
            style={artistImageStyle}
            width="150"
            height="56"
            onError={() => {
              if (event?.currentTarget) {
                event.currentTarget.src = "/icons/profile.svg";
              }
            }}
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
