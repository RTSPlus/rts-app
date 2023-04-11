import { useEffect, useRef } from "react";

import { RouteData } from "../../../rts-api/getRoutes";
import { Pattern, Route } from "../../../rts-api/types";
import { feetToMeters } from "../../../utils/utils";
import VehicleMarker, { VehicleMarkerRef } from "../VehicleMarker";
import { useVehicleLocations } from "../useVehicleLocations";

type Props = {
  pidToPatternsMap: Map<number, Pattern>;
  patternsToRouteMap: Map<number, Route>;
  availableSelectedRoutes: RouteData[];
};

export default function VehicleMarkerDisplay(props: Props) {
  const vehicleLocationLastUpdated = useRef<
    Map<number, { lastUpdatedAt: number; pdist: number }>
  >(new Map());
  const vehicleMarkerRefMap = useRef<Map<number, VehicleMarkerRef>>(new Map());

  const vehicleLocations = useVehicleLocations(props.availableSelectedRoutes);

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
        const path = props.pidToPatternsMap.get(vehicle.pid)?.path;
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
  }, [props.pidToPatternsMap, vehicleLocations]);

  return (
    <>
      {/* Draw vehicle locations */}
      {vehicleLocations
        .flatMap((e) => e.data ?? [])
        .filter((vehicle) => props.pidToPatternsMap.get(vehicle.pid)?.path)
        .map((vehicle) => (
          <VehicleMarker
            color={props.patternsToRouteMap.get(vehicle.pid)?.color ?? "#000"}
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
            path={props.pidToPatternsMap.get(vehicle.pid)?.path ?? []}
          />
        ))}
    </>
  );
}
