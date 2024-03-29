import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Text, StyleSheet, View } from "react-native";

import BaseModal, { BaseModalRef } from "./BaseModal";
import type { ModalControllerDispatchEvent } from "./ModalController";
import { useRoute } from "../../hooks/useRoutes";
import getVehiclesOnRoute from "../../rts-api/getVehiclesOnRoutes";
import { getRoutePattern } from "../../rts-api/rts";
import { RTSMapViewMachineAtom } from "../RTSMapView/RTSMapView";

export type RouteModalOpenPayload = {
  routeNumber: number;
};

export type RouteModalRef = {
  open: (payload: RouteModalOpenPayload) => void;
};

type Props = {
  modalControllerDispatch: (event: ModalControllerDispatchEvent) => void;
};

const RouteModal = forwardRef<RouteModalRef, Props>((props, ref) => {
  const baseModalRef = useRef<BaseModalRef>(null);

  const [routeNum, setRouteNum] = useState(0);
  const route = useRoute(routeNum);

  const mapViewSend = useSetAtom(RTSMapViewMachineAtom);

  const open = useCallback(
    (payload: RouteModalOpenPayload) => {
      baseModalRef.current?.open();
      mapViewSend({
        type: "SHOW_SINGLE_ROUTE",
        routeNum: payload.routeNumber,
      });
      setRouteNum(payload.routeNumber);
    },
    [mapViewSend]
  );

  const onClose = useCallback(() => {
    mapViewSend({ type: "BACK" });
    props.modalControllerDispatch({
      event: "CLOSE_ROUTE",
    });
  }, [mapViewSend, props]);

  useImperativeHandle(
    ref,
    () => ({
      open,
    }),
    [open]
  );

  const { data: vehicles } = useQuery({
    queryKey: ["vehicleLocation", routeNum],
    queryFn: () => getVehiclesOnRoute(routeNum),
  });

  const { data: patterns } = useQuery({
    queryKey: ["patterns", routeNum],
    queryFn: () =>
      getRoutePattern(routeNum, route?.name ?? "", route?.color ?? ""),
    enabled: route !== undefined,
  });

  // print patterns in a useeffect
  useEffect(() => {
    console.log(patterns);
  }, [patterns]);

  // print data in a useeffect
  useEffect(() => {
    console.log("Vehics", vehicles);
  }, [vehicles]);

  return (
    <BaseModal
      titleText={`Route ${routeNum}`}
      subtitleText={route?.name}
      ref={baseModalRef}
      onClose={onClose}
    >
      <View style={styles.container}>
        <Text style={{fontSize: 20}}> Busses currently running </Text>
        {vehicles?.map((vehicle) => (
          <View style={{padding: 20, margin: 20, backgroundColor: "lightblue", borderRadius: 25}}>
          <Text>
              <Text style={{fontWeight: "bold"}}>Direction:</Text>  <Text>{patterns?.patterns[vehicle.pid].direction}</Text>
          </Text>
          <Text>
              <Text style={{fontWeight: "bold"}}>Destination:</Text> <Text>{vehicle.des}</Text>
          </Text>
          <Text>
              <Text style={{fontWeight: "bold"}}>Passenger Load:</Text> <Text>{vehicle.psgld.toLowerCase().replace('_', ' ')}</Text>
          </Text>
          </View>
        ))}
        <View style={{ height: 15 }} />
        {/* <Text style={{ fontSize: 20 }}>Inbound</Text>
        <Text style={{ fontSize: 20 }}>Outbound</Text>
        <Text>Stops:</Text> */}
      </View>
    </BaseModal>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
  },
});

export default RouteModal;
