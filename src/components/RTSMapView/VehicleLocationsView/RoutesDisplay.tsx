import { Polyline } from "react-native-maps";

import { Route } from "../../../rts-api/types";

export default function RoutesDisplay(props: {
  routes: Route[];
  usedPathIDs: number[];
}) {
  return (
    <>
      {props.routes.flatMap((rt) =>
        Object.values(rt.patterns)
          .filter((path) => props.usedPathIDs.includes(path.id))
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
    </>
  );
}
