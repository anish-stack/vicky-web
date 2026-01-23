"use client";

import { useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

// local API Keys
const GOOGLE_API_KEY = "AIzaSyDQq8pNzu9kgF7kDT4zxOUhH6DHwQ4DfNg"; // Replace with your API key

const containerStyle = {
  width: "100%",
  height: "500px",
};

// Center the map near Ahmedabad
const center = { lat: 23.0225, lng: 72.5714 };

const GoogleMapComponent = () => {
  const mapRef = useRef(null);
  const directionsService = useRef(null);
  const directionsRenderer = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    if (!isLoaded) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: 10,
    });

    directionsService.current = new window.google.maps.DirectionsService();
    directionsRenderer.current = new window.google.maps.DirectionsRenderer({
      map: map,
      polylineOptions: {
        strokeColor: "#FF0000",
        strokeWeight: 5,
      },
    });

    const route = {
      origin: { lat: 23.2231, lng: 72.6502 }, // Gandhinagar
      destination: { lat: 23.2991, lng: 72.3336 }, // Kadi
      waypoints: [
        { location: { lat: 23.0225, lng: 72.5714 }, stopover: true }, // Ahmedabad
      ],
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    directionsService.current.route(route, (response, status) => {
      if (status === "OK") {
        directionsRenderer.current.setDirections(response);
      } else {
        console.error("Error fetching directions:", status);
      }
    });
  }, [isLoaded]);

  return isLoaded ? <div ref={mapRef} style={containerStyle} /> : <p>Loading...</p>;
};

export default GoogleMapComponent;
