import { useQueries } from "@tanstack/react-query";

import { RouteData } from "../../rts-api/getRoutes";
import getVehiclesOnRoute from "../../rts-api/getVehiclesOnRoutes";

export function useVehicleLocations(routes: RouteData[]) {
  return useQueries({
    queries: routes.map((route) => ({
      queryKey: ["vehicleLocation", route.num],
      queryFn: () => getVehiclesOnRoute(route.num),
      refetchInterval: 1000 * 5,
    })),
  });
}
