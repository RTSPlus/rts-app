import { useEffect, useState } from "react";
import { ViewProps } from "react-native";
import MapView, { Polyline } from "react-native-maps";

import { getRoutePattern } from "../rts-api/rts";

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
  const [coordinates, setCoordinates] = useState([
    {
      latitude: bounds.lat_max,
      longitude: bounds.lon_max,
    },
    {
      latitude: bounds.lat_min,
      longitude: bounds.lon_min,
    },
  ]);

  useEffect(() => {
    getRoutePattern(5).then((res) => {
      console.log(res.path[323]);
      setCoordinates(
        res.path[323].path.map((point) => ({
          latitude: point.lat,
          longitude: point.lon,
        }))
      );
    });
  }, []);

  return (
    <MapView {...props} initialRegion={initialRegion}>
      <Polyline
        coordinates={coordinates}
        strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
        strokeColors={["#7F0000", "blue"]}
        strokeWidth={3}
      />
    </MapView>
  );
}
