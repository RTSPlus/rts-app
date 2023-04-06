import {
  LocationObject,
  LocationOptions,
  LocationSubscription,
  requestForegroundPermissionsAsync,
  watchPositionAsync,
} from "expo-location";
import { useState, useEffect, useRef } from "react";

interface LocationState {
  location: LocationObject | null;
  error: Error | null;
}

const useLocation = (options: LocationOptions): LocationState => {
  const [state, setState] = useState<LocationState>({
    location: null,
    error: null,
  });
  const lastTimestamp = useRef<number | null>(null);

  useEffect(() => {
    let subscriber: LocationSubscription | undefined;

    (async (): Promise<void> => {
      try {
        const { granted } = await requestForegroundPermissionsAsync();
        if (!granted) {
          throw new Error("Location permission not granted");
        }

        subscriber = await watchPositionAsync(options, (location) => {
          if (location.timestamp !== lastTimestamp.current) {
            setState({ location, error: null });
            lastTimestamp.current = location.timestamp;
          }
        });
      } catch (error) {
        setState({ location: null, error: error as Error });
      }
    })();

    return () => {
      if (subscriber) subscriber.remove();
    };
  }, [options]);

  return state;
};

export default useLocation;
