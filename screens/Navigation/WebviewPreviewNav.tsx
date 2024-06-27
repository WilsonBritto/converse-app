import {
  listItemSeparatorColor,
  navigationSecondaryBackgroundColor,
} from "@styles/colors";
import { Platform, useColorScheme } from "react-native";

import WebviewPreview from "../WebviewPreview";
import { NativeStack, navigationAnimation } from "./Navigation";

export type WebviewPreviewNavParams = {
  uri: string;
};

export const WebviewPreviewScreenConfig = {
  path: "/webviewPreview",
  parse: {
    uri: decodeURIComponent,
  },
  stringify: {
    uri: encodeURIComponent,
  },
};

export default function WebviewPreviewNav() {
  const colorScheme = useColorScheme();
  return (
    <NativeStack.Screen
      name="WebviewPreview"
      component={WebviewPreview}
      options={{
        headerTitle: "File preview",
        presentation: "modal",
        headerStyle: {
          backgroundColor: navigationSecondaryBackgroundColor(colorScheme),
          borderBottomColor:
            Platform.OS === "web"
              ? listItemSeparatorColor(colorScheme)
              : undefined,
        } as any,
        animation: navigationAnimation,
      }}
    />
  );
}
