import { useQuery } from "@tanstack/react-query";

import { getRoutes } from "../rts-api/getRoutes";

export function useAvailableRoutes() {
  const result = useQuery({
    queryKey: ["getRoutes"],
    queryFn: getRoutes,
  });

  return result;
}

export function useAvailableRoutesAsMap() {
  const result = useAvailableRoutes();

  if (result.data) {
    return new Map(result.data.map((route) => [route.num, route]));
  }

  return null;
}

export function useRoute(routeNumber: number) {
  const availableRoutes = useAvailableRoutesAsMap();

  return availableRoutes?.get(routeNumber);
}
