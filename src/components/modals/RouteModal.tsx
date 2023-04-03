import { useSetAtom } from "jotai";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Text } from "react-native";

import BaseModal, { BaseModalRef } from "./BaseModal";
import type { ModalControllerDispatchEvent } from "./ModalController";
import { useRoute } from "../../api-controller/useRoutes";
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

  return (
    <BaseModal
      titleText={`Route ${routeNum}`}
      subtitleText={route?.name}
      ref={baseModalRef}
      onClose={onClose}
    >
      {/* <Text>yuh</Text> */}
    </BaseModal>
  );
});

export default RouteModal;
