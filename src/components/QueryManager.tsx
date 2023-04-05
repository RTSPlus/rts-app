import NetInfo from "@react-native-community/netinfo";
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
  focusManager,
} from "@tanstack/react-query";
import { PropsWithChildren, useEffect } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

import { useAvailableRoutes } from "../hooks/useRoutes";
import { getRoutePattern } from "../rts-api/rts";

export const queryClient = new QueryClient();

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

export function ControllerReact(props: PropsWithChildren) {
  const { data: availableRoutes } = useAvailableRoutes();

  useEffect(() => {
    (availableRoutes ?? []).forEach(({ num, name, color }) => {
      queryClient.prefetchQuery({
        queryKey: ["routePattern", num],
        queryFn: () => getRoutePattern(num, name, color),
      });
    });
  }, [availableRoutes]);

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
