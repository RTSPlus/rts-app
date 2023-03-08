import { RTS_GOOGLE_API_KEY } from "@env";
import { ViewProps } from "react-native";
import MapView from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { match } from "ts-pattern";
import { create } from "zustand";

import VehicleLocationsView from "./VehicleLocationsView";

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

// RTS Map State
type RTSMapViewModes =
  | { mode: "EMPTY" }
  | { mode: "SHOWING_ROUTES"; routeNumbers: number[] }
  | {
      mode: "SHOWING_DIRECTIONS";
      origin: { lat: number; lon: number };
      destination: { lat: number; lon: number };
    };

type RTSMapViewStateStore = {
  mode: RTSMapViewModes;
  setMode: (mode: RTSMapViewModes) => void;
};

export const useMapStateStore = create<RTSMapViewStateStore>((set) => ({
  mode: { mode: "EMPTY" },
  setMode: (newState: RTSMapViewModes) => set(() => ({ mode: newState })),
}));

export default function RTSMapView(props: ViewProps) {
  const mapStore = useMapStateStore();

  return (
    <MapView
      {...props}
      initialRegion={initialRegion}
      showsUserLocation
      followsUserLocation
    >
      {match(mapStore.mode)
        .with({ mode: "EMPTY" }, () => <></>)
        .with({ mode: "SHOWING_ROUTES" }, (state) => (
          <VehicleLocationsView selectedRoutes={state.routeNumbers} />
        ))
        .with({ mode: "SHOWING_DIRECTIONS" }, () => (
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
