import React from "react";
import ReactGoogleAutocomplete from "react-google-autocomplete";
import axios from "axios";
import Map from "../Map";
import "./home.css";

export default function Home() {
  const [placeId, setPlaceId] = React.useState("");
  const [formData, setFormData] = React.useState({
    search: "",
    location: {},
    radius: "",
  });
  const [searchData, setSearchData] = React.useState({});
  const handlePlaceSelect = (place) => {
    setPlaceId(place.place_id);
  };

  React.useEffect(() => {
    if (placeId) {
      getLatLongFromPlaceId(placeId);
    }

    async function getLatLongFromPlaceId(placeId) {
      const result = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${
          import.meta.env.VITE_API_KEY
        }`
      );
      const [data] = result.data.results;
      const location = data.geometry.location;
      setFormData((prev) => ({
        ...prev,
        location,
      }));
    }
  }, [placeId]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    setSearchData(formData);
  };

  return (
    <>
      <div className="place-finder-container">
        <div onKeyUp={e => {
          if (e.code === 'Enter') {
            handleSubmit()
          }
        }} className="form-container">
          <LabelWithValue
            text="Hobby/Activities"
            value={
              <input
                onChange={handleInputChange}
                value={formData.search}
                type="text"
                name="search"
                placeholder="e.g cooking, resturant, bar"
              />
            }
          />

          <LabelWithValue
            text="Address"
            value={
              <ReactGoogleAutocomplete
                apiKey={import.meta.env.VITE_API_KEY}
                onPlaceSelected={handlePlaceSelect}
                placeholder="e.g beverly hills"
              />
            }
          />

          <LabelWithValue
            text="Area in miles"
            value={
              <input
                type="number"
                onChange={handleInputChange}
                value={formData.radius}
                name="radius"
                placeholder="e.g 1,2,3"
              />
            }
          />
          <button className="confirm-button" onClick={handleSubmit}>
            Go
          </button>
        </div>
        <div className="map-container">
          <Map data={searchData} />
        </div>
      </div>
     
    </>
  );
}

function LabelWithValue({ text, value }) {
  return (
    <div className="label-container">
      <div className="label-text">{text} :</div>
      <div className="label-value">{value}</div>
    </div>
  );
}
