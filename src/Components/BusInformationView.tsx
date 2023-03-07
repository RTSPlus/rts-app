import React, { useEffect, useCallback, useRef, useMemo, useState } from "react";
import { Text, Button, TouchableOpacity } from "react-native";
import { StyleSheet, View } from "react-native";
import { Dimensions } from 'react-native';
import { colors } from "../colors";
import { Container, HStack, VStack } from "native-base";
import { ScrollView } from "react-native-gesture-handler";

const BusInformationView = () => {

    return(
        <ScrollView>
        <View style={styles.container}>
        <Container style={styles.container}>
            <Text style={{alignItems:"center", justifyContent:"center", marginBottom:10}}>
                Toggle Map View
                {/* auto populate page with routes and busses currently on the map 
                and allow users to toggle their display */}
            </Text>
        </Container>
        </View>
        </ScrollView>
    );
}

export default BusInformationView;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
  });