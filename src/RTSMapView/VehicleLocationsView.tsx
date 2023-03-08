import { useQueries } from "@tanstack/react-query";
import { Marker, Polyline } from "react-native-maps";
import { hasPresentKey } from "ts-is-present";

import { useVehicleLocations } from "./useVehicleLocations";
import { useAvailableRoutes } from "../controller/useAvailableRoutes";
import { getRoutePattern } from "../rts-api/rts";

type Props = {
  selectedRoutes: number[];
};

export default function VehicleLocationsView({ selectedRoutes }: Props) {
  const { data: availableRoutes } = useAvailableRoutes();

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
    <>
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
    </>
  );
}
