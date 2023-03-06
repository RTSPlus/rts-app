import React, { useEffect, useCallback, useRef, useMemo, useState } from "react";
import { Text, Button } from "react-native";
import { StyleSheet, View } from "react-native";
import { Dimensions } from 'react-native';
import { colors } from "../colors";
import { Container } from "native-base";

const FavoritesView = () => {
  return(
    <View style={styles.container}>
      <Container>
        <Text>
          Favorites
          {/* Display bus browser, be able to select more favorite busses or just display busses and be able to favorite */}
        </Text>


      </Container>
    </View>
  );
}

export default FavoritesView;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
  });