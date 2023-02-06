import { useQueries } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ViewProps } from "react-native";
import MapView, { Polyline } from "react-native-maps";

import { useAvailableRoutes } from "../controller/useAvailableRoutes";
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
  const routePatterns = patternQueries.filter((e) => e.data).map((e) => e.data);

  return (
    <MapView {...props} initialRegion={initialRegion}>
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
    </MapView>
  );
}
