import React from "react";
import GoogleMapReact from "google-map-react";
import "./map.css";

const defaultProps = {
  center: {
    lat: 36.114647,
    lng: -115.172813,
  },
  zoom: 10,
};

// map circle
let circle = null;

function Map({ data }) {
  const [myMap, setMap] = React.useState(null);
  const [markers, setMarkers] = React.useState([]);

  // Re-center map when resizing the window
  const bindResizeListener = (map, maps, bounds) => {
    maps.event.addDomListenerOnce(map, "idle", () => {
      maps.event.addDomListener(window, "resize", () => {
        map.fitBounds(bounds);
      });
    });
  };

  const apiIsLoaded = (map, maps) => {
    setMap({ map, maps });
  };

  React.useEffect(() => {
    if (!data.radius || !data.location.lat || !data.search) return;

    const bounds = new myMap.maps.LatLngBounds();

    const radiusInmeeter = data.radius * 1609; // converts to meeters ( 1 mile = 1609 meeter)
    const request = {
      location: { lat: data.location.lat, lng: data.location.lng },
      radius: radiusInmeeter,
      type: [data.search],
    };

    const service = new google.maps.places.PlacesService(myMap.map);

    // reset markers
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    // find nearby places in the address within given radius
    service.nearbySearch(request, function (results, status) {
      const allMarkers = [];
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        // reset circle
        if (circle) circle.setMap(null);
        // create new circle
        circle = new google.maps.Circle({
          center: request.location,
          radius: radiusInmeeter,
          fillOpacity: 0.35,
          fillColor: "#FF0000",
          map: myMap.map,
        });
        // create markers
        for (const place of results) {
          const marker = createMarker(place);
          allMarkers.push(marker);
        }
        setMarkers(allMarkers);
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        myMap.map.setCenter({ lat, lng });

        let foundMarkers = 0;
        // show markers within the given radius
        for (const marker of allMarkers) {
          const latlng = {
            lat: marker.getPosition().lat(),
            lng: marker.getPosition().lng(),
          };
          // check to see if marker is within the radius
          // only show markers inside the given radius
          const distance = myMap.maps.geometry.spherical.computeDistanceBetween(
            latlng,
            request.location
          );
          if (distance < radiusInmeeter) {
            marker.setMap(myMap.map);
            bounds.extend(latlng);
          }
        }

        if (foundMarkers > 0) {
          myMap.map.fitBounds(bounds);
        } else {
          myMap.map.fitBounds(circle.getBounds());
        }
      }
    });

    bindResizeListener(myMap.map, myMap.maps, bounds);
  }, [data]);

  function createMarker(place) {
    if (!place.geometry || !place.geometry.location) return;

    const marker = new google.maps.Marker({
      position: place.geometry.location,
      title: place.name,
    });

    google.maps.event.addListener(marker, "click", () => {
      infowindow.setContent(place.name || "");
      infowindow.open(myMap.map);
    });
    return marker;
  }

  return (
    <div className="map-wrapper">
      <GoogleMapReact
        bootstrapURLKeys={{
          key: import.meta.env.VITE_API_KEY,
          language: "eng",
          libraries: ["places", "geometry"],
        }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map, maps }) => apiIsLoaded(map, maps)}
      ></GoogleMapReact>
    </div>
  );
}

export default React.memo(Map);
