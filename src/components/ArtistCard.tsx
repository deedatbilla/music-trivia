import React from "react";
import { useHistory } from "react-router-dom";
import { ArtistType } from "../interfaces";
interface ArtistCardProps {
  data: ArtistType;
}
function ArtistCard({ data }: ArtistCardProps) {
  const history = useHistory();
  const { artistId, artistName, artworkUrl100 } = data;
  return (
    <div onClick={()=>history.push(`/trivia/${artistId}`)} className="flex items-center my-3 shadow-lg bg-white">
      <img src={artworkUrl100} />
      <p className="ml-3">{artistName}</p>
    </div>
  );
}

export default ArtistCard;
