import { useQueries } from "@tanstack/react-query";
import { useState } from "react";
import { ViewProps } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

import { useVehicleLocations } from "./useVehicleLocations";
import { useAvailableRoutes } from "../controller/useAvailableRoutes";
import { getRoutePattern } from "../rts-api/rts";
import { hasPresentKey } from "ts-is-present";
import React from "react";
import MapViewDirections from 'react-native-maps-directions';
import { RTS_GOOGLE_API_KEY } from '@env';

// test route
const origin = {latitude: 29.721175, longitude: -82.363335};
const destination = {latitude: 29.6481658, longitude: -82.3454982};

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
  const { data: availableRoutes } = useAvailableRoutes();

  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([5, 20]);

  // Intersection of selectedRoutes and availableRoutes
  const availableSelectedRoutes = (availableRoutes ?? []).filter((e) =>
    selectedRoutes.includes(e.num)
  );

  const patternQueries = useQueries({
    queries: availableSelectedRoutes.map(({ num, name, color }) => ({
      queryKey: ["routePattern", num],
      queryFn: () => getRoutePattern(num, name, color),
    })),
  });
  const routePatterns = patternQueries
    .filter(hasPresentKey("data"))
    .map((e) => e.data);

  const vehicleLocations = useVehicleLocations(availableSelectedRoutes);
  console.log(vehicleLocations);

  return (
    <MapView {...props} 
      initialRegion={initialRegion}
      showsUserLocation={true}
      followsUserLocation={true}
      >
        {/* <MapViewDirections
          origin={origin}
          destination={destination}
          apikey={RTS_GOOGLE_API_KEY}
          strokeWidth={3}
          strokeColor="hotpink"
          optimizeWaypoints={true}
        /> */}
      {routePatterns.map((rt) => (
        <Polyline
          key={rt.num}
          coordinates={Object.values(rt.path)[0].path.map((pt) => ({
            latitude: pt.lat,
            longitude: pt.lon,
          }))}
          strokeColor={rt.color}
          strokeColors={[rt.color]}
          strokeWidth={3}
        />
      ))}
      {vehicleLocations
        .flatMap((e) => e.data ?? [])
        .map((e) => (
          <Marker
            key={e.vid}
            coordinate={{
              latitude: e.lat,
              longitude: e.lon,
            }}
            title={e.vid.toString()}
            description={e.des}
          />
        ))}
    </MapView>
  );
}
