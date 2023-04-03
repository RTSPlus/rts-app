import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { registerRootComponent } from "expo";
import { BlurView } from "expo-blur";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useSetAtom } from "jotai";
import { NativeBaseProvider } from "native-base";
import React, { useEffect, PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
} from "react-native-safe-area-context";

import { ControllerProvider } from "./api-controller/Controller";
import { colors } from "./colors";
import MainSheet from "./components/MainSheet/MainSheet";
import RTSMapView from "./components/RTSMapView/RTSMapView";
import ModalController from "./components/modals/ModalController";

const Providers = (props: PropsWithChildren) => {
  return (
    <SafeAreaProvider>
      <ControllerProvider>
        <BottomSheetModalProvider>
          <NativeBaseProvider>{props.children}</NativeBaseProvider>
        </BottomSheetModalProvider>
      </ControllerProvider>
    </SafeAreaProvider>
  );
};

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

function App() {
  // Location permissions effect
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // Handle permission denied
      }

      // const location = await Location.getCurrentPositionAsync({});
      // console.log(location);
    })();
  }, []);

  return (
    <Providers>
      <View style={styles.container}>
        <RTSMapView style={styles.map} />
        <StatusBarBlurry />
        <MainSheet />
        <ModalController />
      </View>
    </Providers>
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
});

registerRootComponent(App);
