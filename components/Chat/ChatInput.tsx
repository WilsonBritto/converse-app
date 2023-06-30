import { MutableRefObject } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ColorSchemeName,
  useColorScheme,
  TouchableOpacity,
  Platform,
} from "react-native";

import SendButton from "../../assets/send-button.svg";
import {
  actionSecondaryColor,
  backgroundColor,
  chatInputBackgroundColor,
  itemSeparatorColor,
  tertiaryBackgroundColor,
  textPrimaryColor,
  textSecondaryColor,
} from "../../utils/colors";
import ChatAddAttachment from "./ChatAddAttachment";

type Props = {
  inputValue: string;
  setInputValue: (value: string) => void;
  inputRef: MutableRefObject<TextInput | undefined>;
  sendMessage: (content: string) => Promise<void>;
  inputAccessoryViewID?: string;
  editable?: boolean;
};

export default function ChatInput({
  inputValue,
  setInputValue,
  inputRef,
  sendMessage,
  inputAccessoryViewID,
  editable,
}: Props) {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme);

  return (
    <View style={styles.chatInputContainer}>
      <ChatAddAttachment sendMessage={sendMessage} inputRef={inputRef} />
      <TextInput
        editable={editable !== undefined ? editable : true}
        style={styles.chatInput}
        value={inputValue}
        onChangeText={setInputValue}
        multiline
        ref={(r) => {
          if (r) {
            inputRef.current = r as TextInput;
          }
        }}
        placeholder="Message"
        placeholderTextColor={
          Platform.OS === "android"
            ? textSecondaryColor(colorScheme)
            : actionSecondaryColor(colorScheme)
        }
        inputAccessoryViewID={inputAccessoryViewID}
      />
      <TouchableOpacity
        onPress={
          inputValue.length > 0 ? () => sendMessage(inputValue) : undefined
        }
        activeOpacity={inputValue.length > 0 ? 0.4 : 0.6}
        style={[
          styles.sendButtonContainer,
          { opacity: inputValue.length > 0 ? 1 : 0.6 },
        ]}
      >
        <SendButton width={36} height={36} style={[styles.sendButton]} />
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (colorScheme: ColorSchemeName) =>
  StyleSheet.create({
    chatInputContainer: {
      backgroundColor:
        Platform.OS === "android"
          ? backgroundColor(colorScheme)
          : tertiaryBackgroundColor(colorScheme),
      flexDirection: "row",
    },
    chatInput: {
      backgroundColor:
        Platform.OS === "android"
          ? chatInputBackgroundColor(colorScheme)
          : backgroundColor(colorScheme),
      maxHeight: 130,
      flexGrow: 1,
      flexShrink: 1,
      marginLeft: 12,
      marginVertical: 6,
      paddingTop: Platform.OS === "android" ? 4 : 7,
      paddingBottom: Platform.OS === "android" ? 4 : 7,
      paddingLeft: 12,
      paddingRight: 12,
      fontSize: Platform.OS === "android" ? 16 : 17,
      lineHeight: 22,
      borderRadius: 18,
      borderWidth: Platform.OS === "android" ? 0 : 0.5,
      borderColor: itemSeparatorColor(colorScheme),
      color: textPrimaryColor(colorScheme),
    },
    sendButtonContainer: {
      width: 60,
      alignItems: "center",
    },
    sendButton: {
      marginTop: "auto",
      marginBottom: 6,
    },
  });
