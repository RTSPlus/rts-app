import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { registerRootComponent } from "expo";
import { BlurView } from "expo-blur";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { NativeBaseProvider } from "native-base";
import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { LogBox, StyleSheet, View } from "react-native";
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
} from "react-native-safe-area-context";

import HomeView from "./Components/HomeView";
import RTSMapView, { useMapStateStore } from "./RTSMapView/RTSMapView";
import { colors } from "./colors";
import { ControllerProvider } from "./controller/Controller";

LogBox.ignoreLogs([
  "setNativeProps is deprecated and will be removed in next major release",
]);

function App() {
  // hooks
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["15%", "50%", "90%"];

  const setMapState = useMapStateStore((state) => state.setMode);

  // Location permissions effect
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // Handle permission denied
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      // console.log(location);
    })();
  }, []);

  // Set RTSMapView to non-empty on mount
  useEffect(() => {
    setMapState({ mode: "SHOWING_ROUTES", routeNumbers: [5, 20] });
  }, []);

  // Spring animation config

  const bottomSheetAnimationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  const backdropComponent = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={2}
        disappearsOnIndex={1}
        opacity={0.2}
        pressBehavior={() => {}}
      />
    ),
    []
  );

  return (
    <SafeAreaProvider>
      <ControllerProvider>
        <NativeBaseProvider>
          <View style={styles.container}>
            <RTSMapView style={styles.map} />
            <StatusBarBlurry />
            <BottomSheet
              ref={sheetRef}
              index={1}
              snapPoints={snapPoints}
              style={styles.bottomSheetContainer}
              handleIndicatorStyle={{
                backgroundColor: colors.ios.light.gray["2"].toRgbString(),
              }}
              animationConfigs={bottomSheetAnimationConfigs}
              backdropComponent={backdropComponent}
              enablePanDownToClose={false}
            >
              <BottomSheetScrollView
                horizontal={false}
                contentContainerStyle={styles.bottomSheetContent}
              >
                <HomeView />
              </BottomSheetScrollView>
            </BottomSheet>
          </View>
        </NativeBaseProvider>
      </ControllerProvider>
    </SafeAreaProvider>
  );
}
registerRootComponent(App);

function StatusBarBlurry() {
  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaInsetsContext.Consumer>
        {(insets) => (
          <BlurView style={{ ...styles.statusBar, height: insets?.top ?? 0 }} />
        )}
      </SafeAreaInsetsContext.Consumer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    borderBottomWidth: 0.5,
    borderBottomColor: colors.ios.light.gray["1"]
      .clone()
      .setAlpha(0.5)
      .toRgbString(),
  },
  map: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  bottomSheetContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  bottomSheetContent: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
