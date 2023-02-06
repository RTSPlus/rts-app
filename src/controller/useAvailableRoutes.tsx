import { useQuery } from "@tanstack/react-query";

import { getRoutes } from "../rts-api/rts";

export function useAvailableRoutes() {
  const result = useQuery({
    queryKey: ["getRoutes"],
    queryFn: getRoutes,
  });

  return result;
}
