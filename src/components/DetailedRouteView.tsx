import React, {
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useState,
} from "react";
import { Text, Button } from "react-native";
import { StyleSheet, View } from "react-native";
import { Dimensions } from "react-native";
import { colors } from "../colors";
import { Container } from "native-base";

// pass in props of route/bus selected and display data from db
const DetailedRouteView = ({ route }: { route: string }) => {
  return (
    <View style={styles.container}>
      <Container>
        <Text>
          {route}
          {/* Display bus browser, be able to select more favorite busses or just display busses and be able to favorite */}
        </Text>
      </Container>
    </View>
  );
};

export default DetailedRouteView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
