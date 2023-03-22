import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Button,
} from "react-native";
import {
  VStack,
  Box,
  Container,
  NativeBaseProvider,
  HStack,
} from "native-base";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { RTS_GOOGLE_API_KEY } from "@env";
import { Dimensions } from "react-native";
import AllRoutesView from "./AllRoutesView";
import BusInformationView from "./BusInformationView";
import CustomBusIcon from "./CustomBusIcon";
import FavoritesView from "./FavoritesView";
import CustomRouteIcon from "./CustomRouteIcon";
import DetailedRouteView from "./DetailedRouteView";
import { FlatList } from "react-native";

type HomeViewProps = {
  origin: string;
  setOrigin: any;
  destination: string;
  setDestination: any;
};

const BusDirections = ({ directions }: { directions: any }) => {
  if (!directions) {
    return <Text>Loading directions...</Text>;
  }

  const renderItem = ({ item }: { item: any }) => {
    if (item.travel_mode === "TRANSIT") {
      return (
        <View style={styles.directionItem}>
          <Text style={styles.directionText}>
            Take Bus {item.transit_details.line.short_name}{" "}
            {item.transit_details.headsign}
          </Text>
          <Text style={styles.directionText}>
            Get off at {item.transit_details.arrival_stop.name}
          </Text>
          <Text style={styles.directionText}>
            {item.distance.text} ({item.duration.text})
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.directionItem}>
          <Text style={styles.directionText}>{item.html_instructions}</Text>
          <Text style={styles.directionText}>
            {item.distance.text} ({item.duration.text})
          </Text>
        </View>
      );
    }
  };

  return (
    <>
      <FlatList
        data={directions}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </>
  );
};

const HomeView = ({
  origin,
  setOrigin,
  destination,
  setDestination,
}: HomeViewProps) => {
  // states
  const [displayDirections, toggleDisplayDirections] = useState(false);
  const [directions, setDirections] = useState([]);
  const [homeViewVisible, setHomeViewVisible] = useState(true); // home view is initially true
  const [allRoutesViewVisible, setAllRoutesViewVisible] = useState(false);
  const [busInformationViewVisible, setBusInformationViewVisible] =
    useState(false);
  const [favoritesViewVisible, setFavoritesViewVisible] = useState(false);
  const [detailedRouteViewVisible, setDetailedRouteViewVisible] =
    useState(false);
  const [routeSelection, setRouteSelection] = useState("");

  const getDirections = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=transit&transit_mode=bus&key=${RTS_GOOGLE_API_KEY}`
      );
      const data = await response.json();
      setDirections(data?.routes[0]?.legs[0]?.steps);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBusInformationViewToggle = () => {
    setBusInformationViewVisible((prevState) => !prevState);
    setHomeViewVisible((prevState) => !prevState);
  };

  const handleAllRoutesViewToggle = () => {
    setAllRoutesViewVisible((prevState) => !prevState);
    setHomeViewVisible((prevState) => !prevState);
  };

  const handleFavoritesViewToggle = () => {
    setFavoritesViewVisible((prevState) => !prevState);
    setHomeViewVisible((prevState) => !prevState);
  };

  const handleDetailedRouteViewToggle = () => {
    setDetailedRouteViewVisible((prevState) => !prevState);
    setHomeViewVisible((prevState) => !prevState);
  };

  const handlDirectionsViewToggle = () => {
    getDirections();
    toggleDisplayDirections((prevState) => !prevState);
  };

  return (
    <View style={styles.container}>
      <NativeBaseProvider config={config}>
        {homeViewVisible && (
          <Container style={styles.container}>
            <Box borderX="1" borderRadius="md">
              <VStack space="2" alignItems="center">
                {/* 
                Google Places Autocomplete and Bus Information Button View
              */}
                <View style={styles.container}>
                  <HStack space="5" style={styles.container}>
                    <ScrollView horizontal={true}>
                      <VStack alignItems="flex-start">
                        <GooglePlacesAutocomplete
                          styles={{
                            description: {
                              color: "black",
                              fontSize: 15,
                            },
                            predefinedPlacesDescription: {
                              color: "#3caf50",
                            },
                          }}
                          query={{ key: RTS_GOOGLE_API_KEY }}
                          keepResultsAfterBlur={true}
                          enablePoweredByContainer={false}
                          disableScroll={true}
                          isRowScrollable={false}
                          fetchDetails={true}
                          minLength={2}
                          placeholder="Start Location"
                          listViewDisplayed="auto"
                          onPress={(data, details) => {
                            if (details) {
                              setOrigin(details.formatted_address);
                            }
                          }}
                        />
                        <GooglePlacesAutocomplete
                          styles={{
                            description: {
                              color: "black",
                              fontSize: 15,
                            },
                            predefinedPlacesDescription: {
                              color: "#3caf50",
                            },
                          }}
                          query={{ key: RTS_GOOGLE_API_KEY }}
                          keepResultsAfterBlur={true}
                          enablePoweredByContainer={false}
                          disableScroll={true}
                          isRowScrollable={false}
                          fetchDetails={true}
                          minLength={2}
                          placeholder="End Location"
                          listViewDisplayed="auto"
                          onPress={(data, details) => {
                            if (details) {
                              setDestination(details.formatted_address);
                            }
                          }}
                        />
                      </VStack>
                    </ScrollView>
                    <TouchableOpacity
                      onPress={handleBusInformationViewToggle}
                      style={{ alignSelf: "flex-start" }}
                    >
                      <Icon name="map-o" size={35} color="black" />
                    </TouchableOpacity>
                  </HStack>
                </View>

                <View style={styles.container}>
                  <Button
                    title={
                      displayDirections ? "Hide Directions" : "Show Directions"
                    }
                    onPress={handlDirectionsViewToggle}
                  />
                  {displayDirections && (
                    <ScrollView horizontal={true}>
                      <BusDirections directions={directions} />
                    </ScrollView>
                  )}
                </View>
                {/* 
                Favorites container header and more button
              */}
                <HStack width="90%" space="75%">
                  <Text
                    style={{
                      justifyContent: "flex-start",
                      alignItems: "flex-start",
                    }}
                  >
                    ✨ favorites
                  </Text>
                  <TouchableOpacity onPress={handleFavoritesViewToggle}>
                    <Text
                      style={{
                        justifyContent: "flex-end",
                        alignItems: "flex-end",
                        color: "grey",
                      }}
                    ></Text>
                  </TouchableOpacity>
                </HStack>

                {/* 
                Favorites information container
              */}
                <Box
                  width="90%"
                  justifyContent="center"
                  alignItems="center"
                  bg={{
                    linearGradient: {
                      colors: ["#bdc3c7", "#2c3e50"],
                      start: [0, 0],
                      end: [1, 0],
                    },
                  }}
                  p="12"
                  rounded="xl"
                  _text={{
                    fontSize: "md",
                    fontWeight: "medium",
                    color: "warmGray.50",
                    textAlign: "center",
                  }}
                >
                  <HStack space={2} alignItems="center">
                    <TouchableOpacity onPress={handleDetailedRouteViewToggle}>
                      <CustomBusIcon color="#A8A4CE" text="20" />
                    </TouchableOpacity>

                    <TouchableOpacity>
                      <CustomBusIcon color="#D3EBCD" text="1" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.roundButton1}>
                      <Icon
                        name="home"
                        size={50}
                        color="white"
                        style={{ alignItems: "center" }}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.roundButton1}
                      onPress={handleFavoritesViewToggle}
                    >
                      <Icon
                        name="plus"
                        size={30}
                        color="white"
                        style={{ alignItems: "center" }}
                      />
                    </TouchableOpacity>
                  </HStack>
                </Box>

                {/* 
                Routes near you header and all routes button
              */}
                <HStack width="90%" space="45%">
                  <Text
                    style={{
                      justifyContent: "flex-start",
                      alignItems: "flex-start",
                    }}
                  >
                    🚌 routes near you
                  </Text>
                  <TouchableOpacity onPress={handleAllRoutesViewToggle}>
                    <Text
                      style={{
                        justifyContent: "flex-end",
                        alignItems: "flex-end",
                        color: "grey",
                      }}
                    >
                      all routes
                    </Text>
                  </TouchableOpacity>
                </HStack>

                {/* 
                Routes Information Container
              */}
                <Box
                  width="90%"
                  justifyContent="center"
                  alignItems="center"
                  bg={{
                    linearGradient: {
                      colors: ["#bdc3c7", "#2c3e50"],
                      start: [0, 0],
                      end: [1, 0],
                    },
                  }}
                  p="12"
                  rounded="xl"
                  _text={{
                    fontSize: "md",
                    fontWeight: "medium",
                    color: "warmGray.50",
                    textAlign: "center",
                  }}
                >
                  <HStack space={2} alignItems="center">
                    <TouchableOpacity>
                      <CustomRouteIcon color="#539AA9" text="80" />
                    </TouchableOpacity>

                    <TouchableOpacity>
                      <CustomRouteIcon color="#A9C5CA" text="9" />
                    </TouchableOpacity>

                    <TouchableOpacity>
                      <CustomRouteIcon color="#D5C9CA" text="22" />
                    </TouchableOpacity>

                    <TouchableOpacity>
                      <CustomRouteIcon color="blue" text="30" />
                    </TouchableOpacity>
                  </HStack>
                </Box>
              </VStack>
            </Box>
          </Container>
        )}

        {allRoutesViewVisible && (
          <View>
            <TouchableOpacity onPress={handleAllRoutesViewToggle}>
              <Text
                style={{
                  color: "grey",
                  width: Dimensions.get("screen").width - 15,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                go back
              </Text>
            </TouchableOpacity>
            <AllRoutesView />
          </View>
        )}

        {favoritesViewVisible && (
          <View>
            <TouchableOpacity onPress={handleFavoritesViewToggle}>
              <Text
                style={{
                  color: "grey",
                  width: Dimensions.get("screen").width - 15,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                go back
              </Text>
            </TouchableOpacity>
            <FavoritesView />
          </View>
        )}

        {busInformationViewVisible && (
          <View>
            <TouchableOpacity onPress={handleBusInformationViewToggle}>
              <Text
                style={{
                  color: "grey",
                  width: Dimensions.get("screen").width - 15,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                go back
              </Text>
            </TouchableOpacity>
            <BusInformationView />
          </View>
        )}

        {detailedRouteViewVisible && (
          <View>
            <TouchableOpacity onPress={handleDetailedRouteViewToggle}>
              <Text
                style={{
                  color: "grey",
                  width: Dimensions.get("screen").width - 15,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                go back
              </Text>
            </TouchableOpacity>
            <DetailedRouteView route={routeSelection} />
          </View>
        )}
      </NativeBaseProvider>
    </View>
  );
};

export default HomeView;

const config = {
  dependencies: {
    "linear-gradient": LinearGradient,
  },
};

const styles = StyleSheet.create({
  directionsInput: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  subheading: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  container: {
    width: Dimensions.get("screen").width - 20,
    justifyContent: "center",
    alignItems: "center",
  },
  roundButton1: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: 70,
    padding: 10,
    borderRadius: 100,
    backgroundColor: "black",
    shadowColor: "black",
    shadowOpacity: 0.3,
    elevation: 2,
    shadowRadius: 15,
    shadowOffset: { width: 1, height: 5 },
  },
  directionItem: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
  },
  directionText: {
    fontSize: 16,
    marginBottom: 5,
  },
});
