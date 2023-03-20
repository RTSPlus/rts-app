import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useAtomValue } from "jotai";
import { StyleSheet, Text } from "react-native";
import { match } from "ts-pattern";

import HomeViewBody from "./HomeViewBody";
import { SheetMachineValueAtom } from "../MainBottomSheet/StateMachine";
import SearchViewBody from "../SearchView/SearchViewBody";

export default function HomeView2() {
  const sheetMachineValue = useAtomValue(SheetMachineValueAtom);

  const body = match(sheetMachineValue)
    .with("home", () => <HomeViewBody />)
    .with("search", "transitioning_to_search", () => <SearchViewBody />)
    .otherwise(() => <Text>Unknown</Text>);

  return (
    <BottomSheetView style={styles.container}>
      {/* Body */}
      {body}
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
