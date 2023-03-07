import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { registerRootComponent } from "expo";
import { BlurView } from "expo-blur";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import RTSMapView from "./RTSMapView/RTSMapView";
import { colors } from "./colors";
import { ControllerProvider } from "./controller/Controller";
import { Dimensions } from 'react-native';
import { NativeBaseProvider } from "native-base";
import HomeView from "./Components/HomeView";

function App() {

  // hooks
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["15%", "50%", "90%"], []);

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
                style={styles.container}>
                <BottomSheetScrollView
                  horizontal = {false}
                  contentContainerStyle={styles.contentContainer}>
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
    width: Dimensions.get('screen').width,
    alignItems: "center",
    justifyContent: "center",

  }
});
