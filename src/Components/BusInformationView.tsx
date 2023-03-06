import React, { useEffect, useCallback, useRef, useMemo, useState } from "react";
import { Text, Button, TouchableOpacity } from "react-native";
import { StyleSheet, View } from "react-native";
import { Dimensions } from 'react-native';
import { colors } from "../colors";
import { Container, HStack, VStack } from "native-base";
import CustomBusIcon from "./CustomBusIcon";
import { ScrollView } from "react-native-gesture-handler";

const busses = [ 
    // map color to number
    "1",
    "2",
    "3",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10"
  ];

const BusInformationView = () => {

    return(
        <ScrollView>
        <View style={styles.container}>
        <Container style={styles.container}>
            <Text style={{alignItems:"center", justifyContent:"center", marginBottom:10}}>
                Route Information
            {/* Browse route schedules, selecting will not make changes to the map */}
            </Text>

        <VStack space={5} alignItems="center">
            <HStack space={4} alignItems="center">
                  <TouchableOpacity>
                    <CustomBusIcon color='#A8A4CE' text="1" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#D3EBCD' text="2" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#506D84' text="3" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#B1BCE6' text="5" />
                  </TouchableOpacity>
            </HStack>

            <HStack space={4} alignItems="center">
                  <TouchableOpacity>
                    <CustomBusIcon color='#F8A4CE' text="6" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#506D84' text="7" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#AA132F' text="8" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#F7E2E2' text="9" />
                  </TouchableOpacity>
            </HStack>

            <HStack space={4} alignItems="center">
                  <TouchableOpacity>
                    <CustomBusIcon color='#34626C' text="10" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#CC7351' text="11" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#9BA17B' text="12" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#1A132F' text="13" />
                  </TouchableOpacity>
            </HStack>

            <HStack space={4} alignItems="center">
                  <TouchableOpacity>
                    <CustomBusIcon color='#A7D2CB' text="15" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#506D84' text="16" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#65647C' text="17" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#CFB997' text="20" />
                  </TouchableOpacity>
            </HStack>
            <HStack space={4} alignItems="center">
                  <TouchableOpacity>
                    <CustomBusIcon color='#4E6C50' text="21" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#D3EBCD' text="23" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#1A132F' text="25" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#FEFECC' text="26" />
                  </TouchableOpacity>
            </HStack>
                        <HStack space={4} alignItems="center">
                  <TouchableOpacity>
                    <CustomBusIcon color='#FF8364' text="28" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#A7D2CB' text="33" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#1A132F' text="34" />
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <CustomBusIcon color='#4E6C50' text="35" />
                  </TouchableOpacity>
            </HStack>

            </VStack>
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