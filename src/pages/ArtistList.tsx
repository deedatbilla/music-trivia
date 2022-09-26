import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import ArtistCard from "../components/ArtistCard";
import { BASE_URL } from "../constants";
import { ArtistType } from "../interfaces";

function ArtistList() {
  const [artists, setArtists] = useState<ArtistType[]>([]);
  const fetchArtists = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/get-artists`);
      setArtists(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  return (
    <div className="flex flex-col p-4 mx-auto max-w-sm w-full">
      <p>All Artists/Bands</p>
      <div>
        {artists.map((item, idx) => (
          <ArtistCard data={item} key={idx} />
        ))}
      </div>
    </div>
  );
}

export default ArtistList;
