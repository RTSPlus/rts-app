import NetInfo from "@react-native-community/netinfo";
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
  focusManager,
  useQuery,
  useQueries,
} from "@tanstack/react-query";
import { PropsWithChildren, useEffect } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { getRoutePattern, getRoutes } from "../rts-api/rts";

const queryClient = new QueryClient();

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

export function ControllerReact(props: PropsWithChildren) {
  const { data } = useQuery({
    queryKey: ["getRoutes"],
    queryFn: getRoutes,
  });

  useEffect(() => {
    console.log(data);
    if (data) {
      console.log(data.map((route) => parseInt(route["rt"])));
    }
  }, [data]);

  const routePatternList = data ? data.map((rt) => parseInt(rt["rt"])) : [];

  const routePatternQueries = useQueries({
    queries: routePatternList.map((rt) => {
      return {
        queryKey: ["routePattern", rt],
        queryFn: () => getRoutePattern(rt),
      };
    }),
  });

  useEffect(() => {
    console.log(routePatternQueries);
  }, [routePatternQueries]);

  return <>{props.children}</>;
}

export function ControllerProvider(props: PropsWithChildren) {
  // React Query - Online status management
  // https://tanstack.com/query/latest/docs/react/react-native
  useEffect(() => {
    if (Platform.OS !== "web") {
      return NetInfo.addEventListener((state) => {
        onlineManager.setOnline(
          state.isConnected != null &&
            state.isConnected &&
            Boolean(state.isInternetReachable)
        );
      });
    }
  }, []);

  // React Query - Focus management
  // https://tanstack.com/query/latest/docs/react/react-native
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);

    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ControllerReact>{props.children}</ControllerReact>
    </QueryClientProvider>
  );
}
