import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";

import BaseModal, { BaseModalRef } from "./BaseModal";
import type { ModalControllerDispatchEvent } from "../modals/ModalController";
import { RTS_GOOGLE_API_KEY } from "@env";
import { set } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

const queryClient = new QueryClient();
import * as Location from "expo-location";
import { colors } from "../../colors";

export type DestinationModalOpenPayload = {
  title: string;
  address: string;
};

export type DestinationModalRef = {
  open: (payload: DestinationModalOpenPayload) => void;
};

type Props = {
  modalControllerDispatch: (event: ModalControllerDispatchEvent) => void;
};

const BusDirections = ({
  directions,
  destinationInfo,
}: {
  directions: any;
  destinationInfo: any;
}) => {
  const renderItem = ({ item }: { item: any }) => {
    if (item.travel_mode === "TRANSIT") {
      return (
        <View style={styles.directionItem}>
          <View style={styles.directionHeader}>
            <MaterialCommunityIcons
              name="bus"
              size={24}
              color="#4285F4"
              style={styles.directionIcon}
            />
            <Text style={styles.directionHeaderText}>
              Bus {item.transit_details.line.short_name}{" "}
              {item.transit_details.headsign}
            </Text>
          </View>
          <Text style={styles.directionSubText}>
            Board at {item.transit_details.departure_stop.name}
          </Text>
          <Text style={styles.directionSubText}>
            Get off at {item.transit_details.arrival_stop.name}
          </Text>
          <Text style={styles.directionSubText}>
            {item.distance.text} ({item.duration.text})
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.directionItem}>
          <View style={styles.directionHeader}>
            <MaterialCommunityIcons
              name="walk"
              size={24}
              color="#34A853"
              style={styles.directionIcon}
            />
            <Text style={styles.directionHeaderText}>
              {item.html_instructions}
            </Text>
          </View>
          <Text style={styles.directionSubText}>
            {item.distance.text} ({item.duration.text})
          </Text>
        </View>
      );
    }
  };

  const renderHeader = () => (
    <View style={styles.directionItem}>
      <View style={styles.directionHeader}>
        <MaterialIcons
          name="my-location"
          size={24}
          color="#1A73E8"
          style={styles.directionIcon}
        />
        <Text style={styles.directionHeaderText}>Your Location</Text>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.directionItem}>
      <View style={styles.directionHeader}>
        <MaterialIcons
          name="place"
          size={24}
          color="#DB4437"
          style={styles.directionIcon}
        />
        <Text style={styles.directionHeaderText}>
          {destinationInfo.address}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <FlatList
        data={directions}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
      />
    </>
  );
};

const DestinationModal = forwardRef<DestinationModalRef, Props>(
  (props, ref) => {
    const [destinationAddress, setDestinationAddress] = useState("");
    const [originAddress, setOriginAddress] = useState("");
    const baseModalRef = useRef<BaseModalRef>(null);
    const [destinationInfo, setDestionationInfo] = useState({
      title: "",
      address: "",
    });

    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Location permission not granted");
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setOriginAddress(
          `${location.coords.latitude},${location.coords.longitude}`
        );
        return location;
      } catch (error) {
        console.error(error);
        return null;
      }
    };

    const getDirections = async (origin: any, destination: any) => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=transit&transit_mode=bus&key=${RTS_GOOGLE_API_KEY}`
        );
        const data = await response.json();
        return data?.routes[0]?.legs[0]?.steps;
      } catch (error) {
        console.error(error);
        return [];
      }
    };
    const useDirectionsQuery = (origin: any, destination: any) => {
      return useQuery(
        ["directions", origin, destination],
        () => getDirections(origin, destination),
        {
          enabled: !!origin && !!destination,
        }
      );
    };
    const routeDirectionsQuery = useDirectionsQuery(
      originAddress,
      destinationAddress
    );

    useImperativeHandle(
      ref,
      () => ({
        open: async (payload) => {
          baseModalRef.current?.open();
          setDestionationInfo({
            title: payload.title,
            address: payload.address,
          });
        },
      }),
      []
    );

    useEffect(() => {
      getCurrentLocation();
      setDestinationAddress(destinationInfo.address);
      if (routeDirectionsQuery.isSuccess) {
        console.log("Directions fetched successfully", routeDirectionsQuery.data);
      } else if (routeDirectionsQuery.isError) {
        console.error("Error fetching directions", routeDirectionsQuery.error);
      }
    }, [destinationInfo.address, routeDirectionsQuery.isSuccess, routeDirectionsQuery.isError, routeDirectionsQuery.error]);
    

    return (
      <QueryClientProvider client={queryClient}>
        <BaseModal
          ref={baseModalRef}
          onClose={() =>
            props.modalControllerDispatch({
              event: "CLOSE_DESTINATION",
            })
          }
        >
          {routeDirectionsQuery.isLoading && <Text>Loading directions...</Text>}
          {routeDirectionsQuery.isSuccess && (
            <View>
            <BusDirections
              directions={routeDirectionsQuery.data}
              destinationInfo={destinationInfo}
            />
            </View>
          )}
        </BaseModal>
      </QueryClientProvider>
    );
  }
);

export default DestinationModal;

const styles = StyleSheet.create({
  directionItem: {
    borderBottomWidth: 1,
    borderColor: colors.ios.light.gray["4"].toRgbString(),
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  directionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  directionIcon: {
    marginRight: 5,
  },
  directionHeaderText: {
    width:'95%',
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 5,
  },
  directionSubText: {
    fontSize: 14,
    marginLeft: 29,
    marginBottom: 2,
  },
});
