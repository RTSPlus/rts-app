// #region Imports
import { useQueries } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { hasPresentKey } from "ts-is-present";

import RoutesDisplay from "./RoutesDisplay";
import { useAvailableRoutes } from "../../../hooks/useRoutes";
import { getRoutePattern } from "../../../rts-api/rts";
import { Pattern, Route } from "../../../rts-api/types";
import { feetToMeters } from "../../../utils/utils";
import VehicleMarker, { VehicleMarkerRef } from "../VehicleMarker";
import { useVehicleLocations } from "../useVehicleLocations";
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

  // ------------------------------------------- TODO: abstract this out -------------------------------------------
  const vehicleLocations = useVehicleLocations(availableSelectedRoutes);
  const usedPathIDs = vehicleLocations.flatMap((e) =>
    (e.data ?? []).map((v) => v.pid)
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
        const path = pidToPatternsMap.current.get(vehicle.pid)?.path;
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
      <RoutesDisplay routes={routes} usedPathIDs={usedPathIDs} />

      {/* Draw vehicle locations */}
      {vehicleLocations
        .flatMap((e) => e.data ?? [])
        .filter((vehicle) => pidToPatternsMap.current.get(vehicle.pid)?.path)
        .map((vehicle) => (
          <VehicleMarker
            color={patternsToRouteMap.current.get(vehicle.pid)?.color ?? "#000"}
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
            path={pidToPatternsMap.current.get(vehicle.pid)?.path ?? []}
          />
        ))}
    </>
  );
}
