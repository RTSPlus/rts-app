import React from "react";
import { Text, Button } from "react-native";
import { StyleSheet, View } from "react-native";
import { Container } from "native-base";

const AllRoutesView = () => {
  return (
    <View style={styles.container}>
      <Container>
        <Text>
          All Routes
          {/* Display routes browser to display different routes on the map and see the route schedules*/}
        </Text>
      </Container>
    </View>
  );
};

export default AllRoutesView;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
