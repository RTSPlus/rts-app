import { RTS_GOOGLE_API_KEY } from "@env";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";

import BaseModal, { BaseModalRef } from "./BaseModal";
import { colors } from "../../colors";
import useLocation from "../../hooks/useLocation";
import type { ModalControllerDispatchEvent } from "../modals/ModalController";

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

function getDirections(
  origin: { lat: number; lng: number },
  destination: string
) {
  console.log(origin, destination);

  return new Promise((res, rej) => {
    fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination}&mode=transit&transit_mode=bus&key=${RTS_GOOGLE_API_KEY}`
    )
      .then((response) => response.json())
      .then((data) => {
        // res(data);
        res(data?.routes[0]?.legs[0]?.steps);
      })
      .catch(rej);
  });
}

const DestinationModal = forwardRef<DestinationModalRef, Props>(
  (props, ref) => {
    const baseModalRef = useRef<BaseModalRef>(null);

    const { location } = useLocation({});
    const [destinationInfo, setDestionationInfo] = useState<{
      title: string;
      address: string;
    } | null>(null);

    const { data: directions, isLoading } = useQuery({
      queryKey: ["directions", location, destinationInfo],
      queryFn: () =>
        getDirections(
          { lat: location!.coords.latitude, lng: location!.coords.longitude },
          destinationInfo!.address
        ),
      enabled: location !== null && destinationInfo !== null,
    });

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

    return (
      <BaseModal
        ref={baseModalRef}
        onClose={() =>
          props.modalControllerDispatch({
            event: "CLOSE_DESTINATION",
          })
        }
      >
        {isLoading && <Text>Loading directions...</Text>}
        {directions && (
          <View>
            <BusDirections
              directions={directions}
              destinationInfo={destinationInfo}
            />
          </View>
        )}
      </BaseModal>
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
    width: "100%",
  },
  directionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  directionIcon: {
    marginRight: 5,
  },
  directionHeaderText: {
    width: "95%",
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
