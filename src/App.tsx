import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { registerRootComponent } from "expo";
import { BlurView } from "expo-blur";
import { useForegroundPermissions } from "expo-location";
import { StatusBar } from "expo-status-bar";
import { NativeBaseProvider } from "native-base";
import React, { PropsWithChildren } from "react";
import { LogBox, StyleSheet, View } from "react-native";
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
} from "react-native-safe-area-context";

import { colors } from "./colors";
import MainSheet from "./components/MainSheet/MainSheet";
import { ControllerProvider } from "./components/QueryManager";
import RTSMapView from "./components/RTSMapView/RTSMapView";
import ModalController from "./components/modals/ModalController";

LogBox.ignoreLogs([
  "setNativeProps is deprecated and will be removed in next major release",
]);

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
  // TODO: Handle permission denied
  useForegroundPermissions();

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
