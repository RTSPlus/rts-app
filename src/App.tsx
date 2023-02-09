import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { registerRootComponent } from "expo";
import { BlurView } from "expo-blur";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useCallback, useRef, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
} from "react-native-safe-area-context";

import BusInformationView from "./Components/BusInformationView";
import RTSMapView from "./RTSMapView/RTSMapView";
import { colors } from "./colors";
import { ControllerProvider } from "./controller/Controller";

function App() {
  // hooks
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["15%", "50%", "90%"], []);

  // callbacks
  const handleSheetChange = useCallback((index) => {
    console.log("handleSheetChange", index);
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // Handle permission denied
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      console.log(location);
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <ControllerProvider>
        <View style={styles.container}>
          <RTSMapView style={styles.map} />
          <StatusBarBlurry />
          <BottomSheet
            ref={sheetRef}
            index={1}
            snapPoints={snapPoints}
            onChange={handleSheetChange}
            style={styles.container}
          >
            <BottomSheetScrollView
              horizontal = {true}
              contentContainerStyle={styles.contentContainer}
            >
              <BusInformationView />
            </BottomSheetScrollView>
          </BottomSheet>
        </View>
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
          <BlurView style={{ ...styles.statusBar, height: insets.top }} />
        )}
      </SafeAreaInsetsContext.Consumer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  contentContainer: {
    width:"95%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
});
