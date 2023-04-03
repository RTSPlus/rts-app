import { RTS_GOOGLE_API_KEY } from "@env";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { atomWithMachine } from "jotai-xstate";
import { useEffect } from "react";
import { ViewProps } from "react-native";
import MapView from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { match } from "ts-pattern";
import { createMachine } from "xstate";

import VehicleLocationsView from "./VehicleLocationsView";
import { readViewingRoutes } from "./mapPreferences";

// test route
const origin = { latitude: 29.721175, longitude: -82.363335 };
const destination = { latitude: 29.6481658, longitude: -82.3454982 };

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

type Context = object;

type Events = {
  type: "SHOW_ROUTES";
  routes: number[];
};

export const RTSMapViewMachine = createMachine({
  tsTypes: {} as import("./RTSMapView.typegen").Typegen0,
  schema: {
    context: {} as Context,
    events: {} as Events,
  },
  id: "rtsMapViewMachine",
  initial: "empty",
  states: {
    empty: {
      on: {
        SHOW_ROUTES: "showingRoutes",
      },
    },
    showingRoutes: {},
    showingDirections: {},
  },
  predictableActionArguments: true,
});

export const RTSMapViewMachineAtom = atomWithMachine(RTSMapViewMachine);
export type RTSMapViewMachineStates =
  (typeof RTSMapViewMachine)["__TResolvedTypesMeta"]["resolved"]["matchesStates"];

export default function RTSMapView(props: ViewProps) {
  const { data: viewingRoutes } = useQuery({
    queryKey: ["viewingRoutes"],
    queryFn: readViewingRoutes,
  });
  const [mapViewState, mapViewSend] = useAtom(RTSMapViewMachineAtom);

  useEffect(() => {
    mapViewSend("SHOW_ROUTES");
  }, [mapViewSend]);

  return (
    <MapView
      {...props}
      initialRegion={initialRegion}
      showsUserLocation
      followsUserLocation
    >
      {match(mapViewState.value as RTSMapViewMachineStates)
        .with("empty", () => <></>)
        .with("showingRoutes", (state) => (
          <VehicleLocationsView
            selectedRoutes={Array.from(viewingRoutes ?? [])}
          />
        ))
        .with("showingDirections", () => (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={RTS_GOOGLE_API_KEY}
            strokeWidth={3}
            strokeColor="hotpink"
            optimizeWaypoints
          />
        ))
        .exhaustive()}
    </MapView>
  );
}
