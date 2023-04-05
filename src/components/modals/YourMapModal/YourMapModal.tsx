import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { View, StyleSheet } from "react-native";

import RouteRow from "./RouteRow";
import { useAvailableRoutes } from "../../../hooks/useRoutes";
import { colors } from "../../../colors";
import { readViewingRoutes } from "../../RTSMapView/mapPreferences";
import BaseModal, { BaseModalRef } from "../BaseModal";
import type { ModalControllerDispatchEvent } from "../ModalController";

export type YourMapModalPayload = object;

export type YourMapModalRef = {
  open: (payload: YourMapModalPayload) => void;
};

type Props = {
  modalControllerDispatch: (event: ModalControllerDispatchEvent) => void;
};

const YourMapModal = forwardRef<YourMapModalRef, Props>((props, ref) => {
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
  const { data: viewingRoutes } = useQuery({
    queryKey: ["viewingRoutes"],
    queryFn: readViewingRoutes,
  });

  return (
    <BaseModal
      titleText="Your Map"
      ref={baseModalRef}
      onClose={() =>
        props.modalControllerDispatch({
          event: "CLOSE_ROUTE",
        })
      }
      hideBodyOnClose
    >
      <View style={styles.topDivider} />
      <BottomSheetFlatList
        contentContainerStyle={{ paddingBottom: 24 }}
        data={availableRoutes}
        renderItem={({ item }) => (
          <RouteRow
            routeItem={item}
            isInViewingRoutes={viewingRoutes?.has(item.num) ?? false}
            modalControllerDispatch={props.modalControllerDispatch}
          />
        )}
        keyExtractor={(route) => route.num.toString()}
        ItemSeparatorComponent={() => <View style={styles.itemDivider} />}
      />
    </BaseModal>
  );
});

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

export default YourMapModal;
