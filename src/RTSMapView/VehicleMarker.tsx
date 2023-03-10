import { forwardRef, useImperativeHandle, useRef } from "react";
import { MapMarkerProps, Marker } from "react-native-maps";
import Animated, {
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { projectPdistToPathPoint } from "../rts-api/rts";
import { PathPoint } from "../rts-api/types";

export type VehicleMarkerProps = { path: PathPoint[] } & Omit<
  MapMarkerProps,
  "coordinate"
>;

export type VehicleMarkerRef = {
  animatedPdist: (pdist: number, duration: number) => void;
  setInitialPdist: (pdist: number) => void;
};

const VehicleMarker = forwardRef<VehicleMarkerRef, VehicleMarkerProps>(
  (props, ref) => {
    const pdist = useSharedValue(0);

    const internalMarkerRef = useRef<typeof CustomAnimatedMarker>(null);

    useImperativeHandle(
      ref,
      () => ({
        setInitialPdist: (newPdist) => {
          pdist.value = newPdist;
          console.log(props.title, "setting initial pdist", newPdist);
        },
        animatedPdist: (newPdist, duration) => {
          pdist.value = withTiming(newPdist, { duration });
        },
      }),
      []
    );

    useAnimatedReaction(
      () => pdist.value,
      (newPdist) => {
        const newCoords = projectPdistToPathPoint(props.path, newPdist);

        internalMarkerRef.current?.setNativeProps({
          coordinate: {
            latitude: newCoords.lat,
            longitude: newCoords.lon,
          },
        });
      },
      [pdist.value]
    );

    return <CustomAnimatedMarker ref={internalMarkerRef} {...props} />;
  }
);
VehicleMarker.displayName = "VehicleMarker";

const CustomAnimatedMarker = Animated.createAnimatedComponent(Marker);

export { VehicleMarker as default };
