import { useQuery } from "@tanstack/react-query";

import { getRoutes } from "../rts-api/getRoutes";

export function useAvailableRoutes() {
  const result = useQuery({
    queryKey: ["getRoutes"],
    queryFn: getRoutes,
  });

  return result;
}
