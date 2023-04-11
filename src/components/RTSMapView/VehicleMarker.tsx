import { forwardRef, useImperativeHandle, useRef } from "react";
import { View } from "react-native";
import { MapMarkerProps, Marker } from "react-native-maps";
import Animated, {
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Svg, Path, Circle } from "react-native-svg";

import { projectPdistToPathPoint } from "../../rts-api/rts";
import { PathPoint } from "../../rts-api/types";

export type VehicleMarkerProps = { path: PathPoint[]; color?: string } & Omit<
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
        },
        animatedPdist: (newPdist, duration) => {
          pdist.value = withTiming(newPdist, { duration });
        },
      }),
      [pdist]
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

    const fillColor = props.color ?? "#000";
    return (
      <CustomAnimatedMarker ref={internalMarkerRef} {...props}>
        <View>
          <Svg viewBox="0 0 342 1016" width={342 / 10} height={1016 / 10}>
            {/* Circle behind the bus */}
            <Circle cx={171} cy={200} r={160} fill="rgba(255, 255, 255, 0.6)" />
            {/* Pointy Thingy */}
            <Path
              fill={fillColor}
              stroke="#fff"
              strokeWidth={16}
              d="m341.6 169.4c0 175.4-170.6 338.4-170.6 338.4 0 0-170.6-163-170.6-338.4 0-93.4 76.4-169.2 170.6-169.2 94.2 0 170.6 75.8 170.6 169.2zm-33.8-2.9c0-75.5-61.3-136.8-136.8-136.8-75.5 0-136.8 61.3-136.8 136.8 0 75.5 61.3 136.8 136.8 136.8 75.5 0 136.8-61.3 136.8-136.8z"
            />
            {/* Left wheel */}
            <Path
              fill="#000"
              d="m109.8 252.5c0 7.3 5.9 13.3 13.2 13.3 7.4 0 13.3-6 13.3-13.3v-17h-26.5v17z"
            />
            {/* Right wheel */}
            <Path
              fill="#000"
              d="m206.4 252.5c0 7.3 5.9 13.3 13.2 13.3 7.5 0 13.5-6 13.5-13.3v-17h-26.8z"
            />
            {/* Vehicle body */}
            <Path
              fill="#000"
              d="m269.7 126.8c0 4.8-3.9 8.6-8.6 8.6h-11v100.1h-157.3v-143c0-9.4 7.6-17.1 17-17.1h123.2c9.4 0 17.1 7.7 17.1 17.1v25.6h11c4.7 0 8.6 3.9 8.6 8.7zm-129.3-29.5c0 3.6 2.9 6.5 6.5 6.5h48.8c3.6 0 6.5-2.9 6.5-6.5 0-3.6-2.9-6.5-6.5-6.5h-48.8c-3.6 0-6.5 2.9-6.5 6.5zm-8.6 115.1c0-4.9-3.9-8.7-8.8-8.7-4.8 0-8.7 3.8-8.7 8.7 0 4.8 3.9 8.7 8.7 8.7 4.9 0 8.8-3.9 8.8-8.7zm96.6 0c0-4.9-3.9-8.7-8.7-8.7-4.8 0-8.7 3.8-8.7 8.7 0 4.8 3.9 8.7 8.7 8.7 4.8 0 8.7-3.9 8.7-8.7zm8.3-94.3h-130.5v74.7h130.5z"
            />
            {/* Rear view mirrors */}
            <Path
              fill="#000"
              d="m72.3 126.8c0 4.8 3.8 8.6 8.6 8.6h11v-17.3h-11c-4.8 0-8.6 3.9-8.6 8.7z"
            />
            {/* Mirror Streaks */}
            <Path fill="#000" d="m181.4 130.1l3.1 3.1-39.5 39.5-3.1-3.1z" />
            <Path fill="#000" d="m192.6 154.3l-26.5 26.5-3.1-3.1 26.5-26.5z" />
          </Svg>
        </View>
      </CustomAnimatedMarker>
    );
  }
);
VehicleMarker.displayName = "VehicleMarker";

const CustomAnimatedMarker = Animated.createAnimatedComponent(Marker);

export { VehicleMarker as default };
