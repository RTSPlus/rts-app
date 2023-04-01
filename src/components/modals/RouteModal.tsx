import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Text } from "react-native";

import BaseModal, { BaseModalRef } from "./BaseModal";
import type { ModalControllerDispatchEvent } from "./ModalController";

export type RouteModalOpenPayload = {
  routeNumber: number;
};

export type RouteModalRef = {
  open: (payload: RouteModalOpenPayload) => void;
};

type Props = {
  modalControllerDispatch: (event: ModalControllerDispatchEvent) => void;
};

const DestinationModal = forwardRef<RouteModalRef, Props>((props, ref) => {
  const baseModalRef = useRef<BaseModalRef>(null);
  const [routeNum, setRouteNum] = useState(0);

  useImperativeHandle(
    ref,
    () => ({
      open: (payload) => {
        baseModalRef.current?.open();
        setRouteNum(payload.routeNumber);
      },
    }),
    []
  );

  return (
    <BaseModal
      ref={baseModalRef}
      onClose={() =>
        props.modalControllerDispatch({
          event: "CLOSE_ROUTE",
        })
      }
    >
      <Text>{routeNum}</Text>
    </BaseModal>
  );
});

export default DestinationModal;
