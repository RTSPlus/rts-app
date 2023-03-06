import React, { useEffect, useCallback, useRef, useMemo, useState } from "react";
import { Text, Button } from "react-native";
import { StyleSheet, View } from "react-native";
import { Dimensions } from 'react-native';
import { colors } from "../colors";
import { Container } from "native-base";

const AllRoutesView = () => {
  return(
    <View style={styles.container}>
      <Container>
        <Text>
          All Routes
          {/* Display routes browser to display selected routes on the map*/}
        </Text>
      </Container>
    </View>
  );
}

export default AllRoutesView;

const styles = StyleSheet.create({
    container: {
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
      // width:Dimensions.get('screen').width,
    },
  });