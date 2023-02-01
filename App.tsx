import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import MapView from "react-native-maps";
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
} from "react-native-safe-area-context";

import { colors } from "./src/colors";

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <MapView style={styles.map} />
        {/* Todo: Refacto the blurry view out */}
        <SafeAreaInsetsContext.Consumer>
          {(insets) => (
            <BlurView style={{ ...styles.statusBar, height: insets.top }} />
          )}
        </SafeAreaInsetsContext.Consumer>
        <Text style={{ backgroundColor: "red" }}>
          Open up App.js to start working on your app!
        </Text>
      </View>
    </SafeAreaProvider>
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
});
