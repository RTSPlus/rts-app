import { useState } from "react";
import { ViewProps } from "react-native";
import MapView, { Polyline } from "react-native-maps";

// TODO testing only
const bounds = {
  lon_max: -82.24136916824027,
  lon_min: -82.446655,
  lat_max: 29.715481941424365,
  lat_min: 29.589633295601942,
};

const initialRegion = {
  latitude: (bounds.lat_max - bounds.lat_min) / 2 + bounds.lat_min,
  longitude: (bounds.lon_max - bounds.lon_min) / 2 + bounds.lon_min,
  latitudeDelta: bounds.lat_max - bounds.lat_min,
  longitudeDelta: bounds.lat_max - bounds.lat_min,
};

export default function RTSMapView(props: ViewProps) {
  const [coordinates] = useState([
    {
      latitude: bounds.lat_max,
      longitude: bounds.lon_max,
    },
    {
      latitude: bounds.lat_min,
      longitude: bounds.lon_min,
    },
  ]);

  return (
    <MapView {...props} initialRegion={initialRegion}>
      <Polyline
        coordinates={coordinates}
        strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
        strokeColors={["#7F0000"]}
        strokeWidth={6}
      />
    </MapView>
  );
}
