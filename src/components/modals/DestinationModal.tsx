
import { RTS_GOOGLE_API_KEY } from "@env";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";

import BaseModal, { BaseModalRef } from "./BaseModal";
import { colors } from "../../colors";
import useLocation from "../../hooks/useLocation";
import type { ModalControllerDispatchEvent } from "../modals/ModalController";
import { NullLiteral } from "typescript";
import getVehiclesOnRoute from "../../rts-api/getVehiclesOnRoutes";
import { getRoutePattern } from "../../rts-api/rts";
import {
  addViewingRoute,
  deleteViewingRoute,
} from "../RTSMapView/mapPreferences";




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


    const [startLat, setStartLat] = useState<number>(0);
    const [startLng, setStartLng] = useState<number>(0);
    const [endLat, setEndLat] = useState<number>(0);
    const [endLng, setEndLng] = useState<number>(0);
    const [short_name, setShortName] = useState<number>(0);

    useEffect(() => {

      addViewingRoute(short_name);
    }, [short_name])

    const { data: vehicles } = useQuery({
      queryKey: ["vehicleLocation", short_name],
      queryFn: () => getVehiclesOnRoute(short_name),
    });

    const { data: patterns } = useQuery({
      queryKey: ["patterns", short_name],
      queryFn: () =>
        getRoutePattern(short_name, "",  ""),
      enabled: short_name !== undefined,
    });


    const getClosestBus = (vehicles, currPdist, currPid) => {
      let psngld = vehicles[0]["psgld"];
      let pdist = vehicles[0]["pdist"];
      let buspid = vehicles[0]["pid"];

      for(let i = 0; i < vehicles.length; i ++) {
        if(currPid === vehicles[i]["pid"]) {
          if(vehicles[i]["pdist"] < currPdist && vehicles[i]["pdist"]  > pdist) {
            pdist = vehicles[i]["pdist"]
            buspid = vehicles[i]["pid"]
            psngld = vehicles[i]["psgld"]
          }
        }
        else if (buspid === vehicles[i]["pid"]) {
          if(pdist < vehicles[i]["pdist"]) {
            pdist = vehicles[i]["pdist"]
            buspid = vehicles[i]["pid"]
            psngld = vehicles[i]["psgld"]
          }
        }
      }

      return { psngld, pdist, buspid }
    }

    async function handleGetPredictions () {
      // mock data
      // lat lon of start stop
      // lat lon of end stop
      // get list of pattern ids on route
      // Get stops from endoint
      // Get psngld, pdist, hour of day
      const now = new Date();
      const currentHour = now.getHours();
      // patterns
      // vehicles.psngld
      // vehicles.pdist



      if(vehicles && patterns) {
        const pids = Object.keys(patterns["patterns"]);
        // for(let idx = 0; idx < pids.length; idx ++) {
        //   pids[idx] = parseInt(pids[idx])
        // }
        const origin = await getNearestStop(startLng, startLat, pids);
        const currPdist = origin["pdist"];
        const currPid = origin["pid"];
        const destination = await getNearestStop(endLng, endLat, pids);
        const { psngld, pdist, buspid }  = getClosestBus(vehicles, currPdist, currPid);
        console.log("DETES", psngld, pdist, buspid )
        if(buspid) {
          if(buspid === pids[0]) {
            await getTimeTil(pids[0],pids[1],pdist,origin[1]["stop_id"], psngld, currentHour.toString() );
          } else {

            await getTimeTil(pids[1],pids[0],pdist,origin[1]["stop_id"], psngld, currentHour.toString() );
          }

          if(origin[0] === pids[0]) {
            await getDuration(pids[0],pids[1], origin[1]["stop_id"], destination[1]["stop_id"], psngld, currentHour.toString())
          } else {
            await getDuration(pids[1],pids[0], origin[1]["stop_id"], destination[1]["stop_id"], psngld, currentHour.toString())
          }

        }
        // start_payload = {"pattern_id_one":'335', "pattern_id_two": '323', "pdist":2000, "start_id":'0200', "passenger_load":'HALF_EMPTY', "hour_of_day":'05'}

      }

      // const origin = await getNearestStop(startLat, startLng, 447);
      // const destination = await getNearestStop(endLat, endLng, 447);
      // getTimeTil("323", "335", 2000, origin, "HALF_EMPTY", 9);
      // getDuration("323", "335", origin, destination, "HALF_EMPTY", 9);
    }

    // Route id is from Google maps API.
    // User says where they are , where they want to go.
    // Google gives route suggestions.
    // The route id is the bus number

    async function getNearestStop(lon: number, lat: number, pids: string[]) {

      try {
        const res = await fetch("http://52.91.201.55/nearest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "lon": lon,
            "lat" : lat,
            "pid" : pids
          }),
        });

        const data = await res.json();
        return data;
      } catch (error) {
        console.log(error);
      }
    }

    async function getDuration(
      pattern_id_one: string,
      pattern_id_two: string,
      start_id: string,
      stop_id: string,
      passenger_load: string,
      hour_of_day: number
    ) {

      try {
        const res = await fetch("http://52.91.201.55/predict/stop", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "pattern_id_one": pattern_id_one,
            "pattern_id_two": pattern_id_two,
            "start_id": start_id,
            "stop_id": stop_id,
            "passenger_load": passenger_load,
            "hour_of_day": hour_of_day,
          }),
        });

        const data = await res.json();

        setDuration(Math.round(parseInt(data["bus_to_end"]) / 60).toString());
      } catch (error) {
        console.log(error);
      }
    }

    async function getTimeTil(
      pattern_id_one: string,
      pattern_id_two: string,
      pdist: number,
      start_id: string,
      passenger_load: string,
      hour_of_day: number
    ) {
      console.log( "HERE", {
        "pattern_id_one": pattern_id_one,
        "pattern_id_two": pattern_id_two,
        "start_id": start_id,
        "pdist": pdist,
        "passenger_load": passenger_load,
        "hour_of_day": hour_of_day
      })
      try {
        const res = await fetch("http://52.91.201.55/predict/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "pattern_id_one": pattern_id_one,
            "pattern_id_two": pattern_id_two,
            "start_id": start_id,
            "pdist": pdist,
            "passenger_load": passenger_load,
            "hour_of_day": hour_of_day
          }),
        });

        const data = await res.json();
        console.log(data);

        setTimeToArrival(
          Math.round(parseInt(data["bus_to_start"]) / 60).toString()
        );
      } catch (error) {
        console.log(error);
      }
    }

    function getDirections(
  origin: { lat: number; lng: number },
  destination: string
) {


  // Redpoint Gainesville
  // origin = { lat: 29.641270630561376, lng: -82.39523577496786 };
  // destination = "444 Newell Dr, Gainesville, FL 32611";


  return new Promise((res, rej) => {
    fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination}&mode=transit&transit_mode=bus&key=${RTS_GOOGLE_API_KEY}`
    )
      .then((response) => response.json())
      .then((data) => {
        // res(data);
        res(data?.routes[0]?.legs[0]?.steps);
        const steps = data?.routes[0]?.legs[0]?.steps;
        if (steps && steps.length > 0) {
          const startLocation = steps[0].start_location;

          const endLocation = steps[steps.length - 1].end_location;
          setStartLat(startLocation.lat);
          setStartLng(startLocation.lng);
          setEndLat(endLocation.lat);
          setEndLng(endLocation.lng);
          // deleteViewingRoute(short_name)

          for(let step of steps) {

            if(step["travel_mode"] === "TRANSIT") {
              if(short_name != parseInt(step.transit_details.line.short_name)) {
                deleteViewingRoute(short_name)
              }

              setShortName(parseInt(step.transit_details.line.short_name));
            }
          }
        }
      })
      .catch(rej);
  });
}

    const baseModalRef = useRef<BaseModalRef>(null);
    const [timeToArrival, setTimeToArrival] = useState<string | null>(null);
    const [duration, setDuration] = useState<string | null>(null);

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

        <Button onPress={handleGetPredictions} title="Get Prediction" />

        {timeToArrival && duration && (
          <>
            <Text style={styles.infoText}>
              Time to bus arrival:{" "}
              <Text style={styles.bold}>{timeToArrival} minutes</Text>
            </Text>
            <Text style={styles.infoText}>
              Trip Time: <Text style={styles.bold}>{duration} minutes</Text>
            </Text>
          </>
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
  infoText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
  },
});
