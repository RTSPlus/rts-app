// #region Imports
import { useQueries } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Polyline } from "react-native-maps";
import { hasPresentKey } from "ts-is-present";

import VehicleMarker, { VehicleMarkerRef } from "./VehicleMarker";
import { useVehicleLocations } from "./useVehicleLocations";
import { useAvailableRoutes } from "../../api-controller/useRoutes";
import { getRoutePattern } from "../../rts-api/rts";
import { Pattern } from "../../rts-api/types";
import { feetToMeters } from "../../utils/utils";
// #endregion

type Props = {
  selectedRoutes: number[];
};

export default function VehicleLocationsView({ selectedRoutes }: Props) {
  const vehicleLocationLastUpdated = useRef<
    Map<number, { lastUpdatedAt: number; pdist: number }>
  >(new Map());
  const vehicleMarkerRefMap = useRef<Map<number, VehicleMarkerRef>>(new Map());

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

  // routePatternQueries` -> `pidToPatternsMap` sync
  // Following chunk is a bit icky
  // We sync between `routePatternQueries` and `pidToPatternsMap`
  // Listen for changes in `routePatternQueries`
  // and update `routePatternsMap` accordingly so we don't need to keep redeclaring Map()
  // Potentionally just a micro-optimization but stable references are good too

  // routePatternsMap should be stable and not be wiped on re-renders unless necessary
  // in the case that it is, change this to a ref
  const [pidToPatternsMap] = useState(new Map<number, Pattern>());

  // useEffect not entirely necessary. Same logic will be run on every render anyways
  // because useQueries returns an unstable refernece
  // This is more of a signal to the user that this is to synchronize side-effects
  useEffect(() => {
    routes.map((route) => {
      Object.values(route.patterns).forEach((pattern) => {
        if (!pidToPatternsMap.has(pattern.id)) {
          pidToPatternsMap.set(pattern.id, pattern);
        }
      });
    });
  }, [pidToPatternsMap, routePatternQueries, routes]);

  const vehicleLocations = useVehicleLocations(availableSelectedRoutes);
  const usedPathIDs = new Set(
    vehicleLocations.flatMap((e) => (e.data ?? []).map((v) => v.pid))
  );

  // Vehicle animation handling
  useEffect(() => {
    // Filter out queries that don't have data. Merge data with last updated time
    const vehicleLocationsData = vehicleLocations.flatMap((query) =>
      (query.data ?? []).map((e) => ({
        ...e,
        lastUpdatedAt: query.dataUpdatedAt,
      }))
    );

    // Vehicle animation handled here
    // Check if vehicle location has been updated
    vehicleLocationsData.forEach((vehicle) => {
      // check last updated map and add if not present
      const lastUpdatedMap = vehicleLocationLastUpdated.current;
      if (!lastUpdatedMap.has(vehicle.vid)) {
        lastUpdatedMap.set(vehicle.vid, {
          lastUpdatedAt: vehicle.lastUpdatedAt,
          pdist: vehicle.pdist,
        });
      }

      const vehicleLastUpdate = lastUpdatedMap.get(vehicle.vid);
      if (
        vehicleLastUpdate !== undefined &&
        vehicleLastUpdate.pdist !== vehicle.pdist
      ) {
        const path = pidToPatternsMap.get(vehicle.pid)?.path;
        if (path === undefined) {
          throw new Error(`Path for pid ${vehicle.pid} not found`);
        }

        // Animate marker
        vehicleMarkerRefMap.current
          .get(vehicle.vid)
          ?.animatedPdist(
            feetToMeters(vehicle.pdist),
            vehicle.lastUpdatedAt - vehicleLastUpdate.lastUpdatedAt
          );

        // update last updated time and values
        lastUpdatedMap.set(vehicle.vid, {
          lastUpdatedAt: vehicle.lastUpdatedAt,
          pdist: vehicle.pdist,
        });
      }
    });
  }, [pidToPatternsMap, vehicleLocations]);

  return (
    <>
      {/* Draw patterns */}
      {routes.flatMap((rt) =>
        Object.values(rt.patterns)
          .filter((path) => usedPathIDs.has(path.id))
          .map(({ path, id }) => (
            <Polyline
              key={id}
              coordinates={path.map((pt) => ({
                latitude: pt.lat,
                longitude: pt.lon,
              }))}
              strokeColor={rt.color}
              strokeColors={[rt.color]}
              strokeWidth={3}
            />
          ))
      )}

      {/* Draw vehicle locations */}
      {vehicleLocations
        .flatMap((e) => e.data ?? [])
        .filter((vehicle) => pidToPatternsMap.get(vehicle.pid)?.path)
        .map((vehicle) => (
          <VehicleMarker
            key={vehicle.vid}
            ref={(ref) => {
              if (
                ref !== null &&
                !vehicleMarkerRefMap.current.has(vehicle.vid)
              ) {
                vehicleMarkerRefMap.current.set(vehicle.vid, ref);
                ref.setInitialPdist(feetToMeters(vehicle.pdist));
              }
            }}
            title={vehicle.vid.toString()}
            description={vehicle.des}
            path={pidToPatternsMap.get(vehicle.pid)?.path ?? []}
          />
        ))}
    </>
  );
}
