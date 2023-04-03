import { forwardRef, Fragment, useImperativeHandle, useRef } from "react";
import { View, StyleSheet } from "react-native";

import RouteRow from "./RouteRow";
import { useAvailableRoutes } from "../../../api-controller/useAvailableRoutes";
import { colors } from "../../../colors";
import BaseModal, { BaseModalRef } from "../BaseModal";
import type { ModalControllerDispatchEvent } from "../ModalController";

export type MapOptionsModalPayload = object;

export type MapOptionsModalRef = {
  open: (payload: MapOptionsModalPayload) => void;
};

type Props = {
  modalControllerDispatch: (event: ModalControllerDispatchEvent) => void;
};

const MapOptionsModal = forwardRef<MapOptionsModalRef, Props>((props, ref) => {
  // #region Ref handling
  const baseModalRef = useRef<BaseModalRef>(null);
  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        baseModalRef.current?.open();
      },
    }),
    []
  );
  // #endregion

  const { data: availableRoutes } = useAvailableRoutes();

  return (
    <BaseModal
      titleText="Your Map"
      ref={baseModalRef}
      onClose={() =>
        props.modalControllerDispatch({
          event: "CLOSE_ROUTE",
        })
      }
    >
      <View style={styles.topDivider} />
      <View>
        {(availableRoutes ?? []).map((route, i) => (
          <Fragment key={i}>
            <RouteRow routeItem={route} />
            <View style={styles.itemDivider} />
          </Fragment>
        ))}
      </View>
    </BaseModal>
  );
});

// React native styles
const styles = StyleSheet.create({
  topDivider: {
    backgroundColor: colors.ios.light.gray["3"].toRgbString(),
    height: 1,
    marginTop: 12,
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.ios.light.gray["3"].toRgbString(),
    marginLeft: 16,
  },
});

export default MapOptionsModal;
