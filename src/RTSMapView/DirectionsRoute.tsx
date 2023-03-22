import MapViewDirections from "react-native-maps-directions";
import { RTS_GOOGLE_API_KEY } from "@env";
import React from "react";
type DirectionsRouteProps = {
  origin: string;
  destination: string;
};

const DirectionsRoute = React.memo(
  ({ origin, destination }: DirectionsRouteProps) => {
    console.log("rerendered!!");
    return (
      <MapViewDirections
        origin={origin}
        destination={destination}
        apikey={RTS_GOOGLE_API_KEY}
        strokeWidth={3}
        strokeColor="hotpink"
        optimizeWaypoints={true}
        mode="TRANSIT"
      />
    );
  }
);
export { DirectionsRoute };
