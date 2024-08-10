import {
  actionSheetColors,
  inversePrimaryColor,
  textPrimaryColor,
  backgroundColor,
  primaryColor,
} from "@styles/colors";
import { useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Image,
} from "react-native";

import { MessageToDisplay } from "./Message";
import {
  useCurrentAccount,
  useProfilesStore,
} from "../../../data/store/accountsStore";
import { isAttachmentMessage } from "../../../utils/attachment/helpers";
import { useConversationContext } from "../../../utils/conversation";
import { getPreferredName, getPreferredAvatar } from "../../../utils/profile";
import {
  getReactionContent,
  MessageReaction,
  addReactionToMessage,
  removeReactionFromMessage,
} from "../../../utils/reactions";
import { showActionSheetWithOptions } from "../../StateHandlers/ActionSheetStateHandler";

const MAX_REACTORS_TO_SHOW = 3;
const REACTOR_OFFSET = 10;

type Props = {
  message: MessageToDisplay;
  reactions: {
    [senderAddress: string]: MessageReaction[];
  };
};

type ReactionCount = {
  content: string;
  count: number;
  userReacted: boolean;
  reactors: string[];
  firstReactionTime: number;
};

export default function ChatMessageReactions({ message, reactions }: Props) {
  const { conversation } = useConversationContext(["conversation"]);
  const colorScheme = useColorScheme();
  const styles = useStyles();
  const userAddress = useCurrentAccount();
  const profiles = useProfilesStore((state) => state.profiles);

  const reactionsList = useMemo(() => {
    return Object.entries(reactions)
      .flatMap(([senderAddress, reactions]) =>
        reactions.map((reaction) => ({ ...reaction, senderAddress }))
      )
      .sort((r1, r2) => r1.sent - r2.sent);
  }, [reactions]);

  const reactionCounts = useMemo(() => {
    const counts: { [content: string]: ReactionCount } = {};

    Object.values(reactions).forEach((reactionArray) => {
      reactionArray.forEach((reaction) => {
        if (!counts[reaction.content]) {
          counts[reaction.content] = {
            content: reaction.content,
            count: 0,
            userReacted: false,
            reactors: [],
            firstReactionTime: reaction.sent,
          };
        }
        counts[reaction.content].count++;
        counts[reaction.content].reactors.push(reaction.senderAddress);
        if (
          reaction.senderAddress.toLowerCase() === userAddress?.toLowerCase()
        ) {
          counts[reaction.content].userReacted = true;
        }
        // Keep track of the earliest reaction time for this emoji
        counts[reaction.content].firstReactionTime = Math.min(
          counts[reaction.content].firstReactionTime,
          reaction.sent
        );
      });
    });

    // Convert to array and sort
    return Object.values(counts).sort((a, b) => {
      // Sort by the time of the first reaction (ascending)
      return a.firstReactionTime - b.firstReactionTime;
    });
  }, [reactions, userAddress]);

  const handleReactionPress = useCallback(
    (reaction: ReactionCount) => {
      if (!conversation || !userAddress) return;

      if (reaction.userReacted) {
        removeReactionFromMessage(conversation, message, reaction.content);
      } else {
        addReactionToMessage(conversation, message, reaction.content);
      }
    },
    [conversation, message, userAddress]
  );

  const showReactionsActionsSheet = useCallback(() => {
    const methods: any = {};
    reactionsList.forEach((r) => {
      const peerAddress = r.senderAddress;
      const fromMe = peerAddress.toLowerCase() === userAddress?.toLowerCase();
      const socials = profiles[peerAddress]?.socials;
      const peer = getPreferredName(socials, peerAddress);
      methods[
        `${getReactionContent(r)} ${fromMe ? "you - tap to remove" : peer}`
      ] = () => {
        if (!fromMe || !conversation) return;
        removeReactionFromMessage(conversation, message, r.content);
      };
    });
    methods["Back"] = () => {};
    const isAttachment = isAttachmentMessage(message.contentType);

    const options = Object.keys(methods);

    showActionSheetWithOptions(
      {
        options,
        title: isAttachment ? "📎 Media" : message.content,
        cancelButtonIndex: options.indexOf("Back"),
        ...actionSheetColors(colorScheme),
      },
      (selectedIndex?: number) => {
        if (selectedIndex === undefined) return;
        const method = (methods as any)[options[selectedIndex]];
        if (method) {
          method();
        }
      }
    );
  }, [
    reactionsList,
    message,
    colorScheme,
    userAddress,
    profiles,
    conversation,
  ]);
  if (reactionsList.length === 0) return null;

  return (
    <View style={styles.reactionsWrapper}>
      {reactionCounts.map((reaction) => {
        const reactorCount = reaction.reactors.length;
        return (
          <TouchableOpacity
            key={reaction.content}
            onPress={() => handleReactionPress(reaction)}
            onLongPress={showReactionsActionsSheet}
            style={[
              styles.reactionButton,
              reaction.userReacted
                ? styles.myReactionButton
                : styles.otherReactionButton,
            ]}
          >
            <Text style={styles.emoji}>{reaction.content}</Text>
            {reactorCount <= MAX_REACTORS_TO_SHOW ? (
              <View
                style={[
                  styles.reactorContainer,
                  { marginRight: (reactorCount - 1) * -REACTOR_OFFSET },
                ]}
              >
                {reaction.reactors
                  .slice(0, MAX_REACTORS_TO_SHOW)
                  .map((reactor, index) => (
                    <Image
                      key={reactor}
                      source={{
                        uri: getPreferredAvatar(profiles[reactor]?.socials),
                      }}
                      style={[
                        styles.profileImage,
                        {
                          left: index * -REACTOR_OFFSET,
                          zIndex: MAX_REACTORS_TO_SHOW - (index + 1),
                        },
                        reaction.userReacted
                          ? { borderColor: primaryColor(colorScheme) }
                          : {},
                      ]}
                    />
                  ))}
              </View>
            ) : (
              <View style={styles.reactorContainer}>
                <Text
                  style={[
                    styles.reactorCount,
                    reaction.userReacted
                      ? { color: inversePrimaryColor(colorScheme) }
                      : {},
                  ]}
                >
                  {reactorCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const useStyles = () => {
  const colorScheme = useColorScheme();
  return StyleSheet.create({
    reactionsWrapper: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: 10,
    },
    reactionButton: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 8,
      marginBottom: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 16,
    },
    myReactionButton: {
      backgroundColor: primaryColor(colorScheme),
    },
    otherReactionButton: {
      backgroundColor: backgroundColor(colorScheme),
    },
    emoji: {
      fontSize: 14,
      marginHorizontal: 2,
    },
    reactorContainer: {
      flexDirection: "row",
      alignItems: "center",
      height: 22,
    },
    profileImage: {
      width: 22,
      height: 22,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: inversePrimaryColor(colorScheme),
    },
    reactorCount: {
      fontSize: 12,
      marginHorizontal: 2,
      color: textPrimaryColor(colorScheme),
    },
  });
};
