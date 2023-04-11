// #region Imports
import { useQueries } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { hasPresentKey } from "ts-is-present";

import RoutesDisplay from "./RoutesDisplay";
import VehicleMarkerDisplay from "./VehicleMarkerDisplay";
import { useAvailableRoutes } from "../../../hooks/useRoutes";
import { getRoutePattern } from "../../../rts-api/rts";
import { Pattern, Route } from "../../../rts-api/types";
import { useVehicleLocations } from "../useVehicleLocations";
// #endregion

type Props = {
  selectedRoutes: number[];
};

export default function VehicleLocationsView({ selectedRoutes }: Props) {
  const { data: availableRoutes } = useAvailableRoutes();

  // Intersection of selectedRoutes and availableRoutes
  const availableSelectedRoutes = (availableRoutes ?? []).filter((e) =>
    selectedRoutes.includes(e.num)
  );

  // Query for patterns
  const routePatternQueries = useQueries({
    queries: availableSelectedRoutes.map(({ num, name, color }) => ({
      queryKey: ["routePattern", num],
      queryFn: () => getRoutePattern(num, name, color),
      // Patterns stay in cache for 24 hours
      staleTime: 1000 * 60 * 60 * 24,
      cacheTime: 1000 * 60 * 60 * 24,
    })),
  });
  // Filter for patterns where data is present (fetch successful)
  const routes = routePatternQueries
    .filter(hasPresentKey("data"))
    .map((e) => e.data);

  // #region routePatternQueries -> pidToPatternsMap -> patternsToRouteMap sync
  // Following chunk is a bit icky
  // We sync between `routePatternQueries` and `pidToPatternsMap` and patternsToRouteMap
  // Listen for changes in `routePatternQueries` and update maps accordingly so we don't need to keep redeclaring Map()
  // Potentionally just a micro-optimization but stable references are good too

  const pidToPatternsMap = useRef<Map<number, Pattern>>(
    new Map<number, Pattern>()
  );
  const patternsToRouteMap = useRef<Map<number, Route>>(
    new Map<number, Route>()
  );

  // useEffect not entirely necessary. Same logic will be run on every render anyways
  // because useQueries returns an unstable refernece
  // This is more of a signal to the user that this is to synchronize side-effects
  useEffect(() => {
    routes.map((route) => {
      Object.values(route.patterns).forEach((pattern) => {
        pidToPatternsMap.current.set(pattern.id, pattern);
        patternsToRouteMap.current.set(pattern.id, route);
      });
    });
  }, [routePatternQueries, routes]);
  // #endregion

  const vehicleLocations = useVehicleLocations(availableSelectedRoutes);
  const usedPathIDs = vehicleLocations.flatMap((e) =>
    (e.data ?? []).map((v) => v.pid)
  );

  return (
    <>
      {/* Draw patterns */}
      <RoutesDisplay routes={routes} usedPathIDs={usedPathIDs} />

      <VehicleMarkerDisplay
        availableSelectedRoutes={availableSelectedRoutes}
        pidToPatternsMap={pidToPatternsMap.current}
        patternsToRouteMap={patternsToRouteMap.current}
      />
    </>
  );
}
