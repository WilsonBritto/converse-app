import { RemoteAttachment } from "@xmtp/content-type-remote-attachment";
import {
  DecryptedLocalAttachment,
  EncryptedLocalAttachment,
  RemoteAttachmentContent,
} from "@xmtp/react-native-sdk";
import RNFS from "react-native-fs";

import { getImageSize, isImageMimetype } from "./media";
import { uploadFileToWeb3Storage } from "./web3.storage";

export type SerializedAttachmentContent = {
  filename: string;
  mimeType: string;
  data: string;
};

export type SerializedRemoteAttachmentContent = {
  nonce: string;
  salt: string;
  secret: string;
  url: string;
  contentDigest: string;
  scheme: string;
  contentLength: number;
  filename: string;
};

export const deserializeRemoteAttachmentContent = (
  serializedRemoteAttachment: string
): RemoteAttachment => {
  const parsedAttachment: SerializedRemoteAttachmentContent = JSON.parse(
    serializedRemoteAttachment
  );
  return {
    ...parsedAttachment,
    nonce: Buffer.from(parsedAttachment.nonce, "base64"),
    salt: Buffer.from(parsedAttachment.salt, "base64"),
    secret: Buffer.from(parsedAttachment.secret, "base64"),
  };
};

export const isAttachmentMessage = (contentType?: string) =>
  contentType
    ? contentType.startsWith("xmtp.org/attachment:") ||
      contentType.startsWith("xmtp.org/remoteStaticAttachment:")
    : false;

export const handleStaticAttachment = async (
  messageId: string,
  staticAttachment: SerializedAttachmentContent
) => {
  const messageFolder = `${RNFS.DocumentDirectoryPath}/messages/${messageId}`;
  // Create folder
  await RNFS.mkdir(messageFolder, {
    NSURLIsExcludedFromBackupKey: true,
  });
  const attachmentPath = `${messageFolder}/${staticAttachment.filename}`;
  // Let's cache the file and decoded information
  await RNFS.writeFile(attachmentPath, staticAttachment.data, "base64");
  return handleAttachment(
    messageId,
    staticAttachment.filename,
    staticAttachment.mimeType
  );
};

export const handleDecryptedRemoteAttachment = async (
  messageId: string,
  localAttachment: DecryptedLocalAttachment
) => {
  const messageFolder = `${RNFS.DocumentDirectoryPath}/messages/${messageId}`;
  // Create folder
  await RNFS.mkdir(messageFolder, {
    NSURLIsExcludedFromBackupKey: true,
  });
  const filename = localAttachment.fileUri.split("/").slice(-1)[0];
  const attachmentPath = `${messageFolder}/${filename}`;
  // Let's cache the file and decoded information
  await RNFS.moveFile(
    localAttachment.fileUri.replace("file:///", "/"),
    attachmentPath
  );
  return handleAttachment(messageId, filename, localAttachment.mimeType);
};

const handleAttachment = async (
  messageId: string,
  filename: string,
  mimeType?: string
) => {
  const messageFolder = `${RNFS.DocumentDirectoryPath}/messages/${messageId}`;
  const attachmentPath = `${messageFolder}/${filename}`;
  const attachmentJsonPath = `${messageFolder}/attachment.json`;
  const isImage = isImageMimetype(mimeType);
  const imageSize = isImage
    ? await getImageSize(`file://${attachmentPath}`)
    : undefined;
  await RNFS.writeFile(
    attachmentJsonPath,
    JSON.stringify({
      filename,
      mimeType,
      imageSize,
    }),
    "utf8"
  );

  return {
    mediaType: isImage
      ? "IMAGE"
      : ("UNSUPPORTED" as "IMAGE" | "UNSUPPORTED" | undefined),
    imageSize,
    contentLength: 0,
    mediaURL: attachmentPath,
    filename,
    mimeType: mimeType || "",
  };
};

export const getLocalAttachment = async (messageId: string) => {
  const messageFolder = `${RNFS.DocumentDirectoryPath}/messages/${messageId}`;
  const attachmentJsonPath = `${messageFolder}/attachment.json`;
  const attachmentExists = await RNFS.exists(attachmentJsonPath);
  if (attachmentExists) {
    try {
      const attachmentJsonContent = await RNFS.readFile(
        attachmentJsonPath,
        "utf8"
      );
      const messageAttachmentData = JSON.parse(attachmentJsonContent);
      const supportedMediaType = isImageMimetype(
        messageAttachmentData.mimeType
      );
      const attachmentPath = `${messageFolder}/${messageAttachmentData.filename}`;
      const fileExists = await RNFS.exists(attachmentPath);
      if (fileExists) {
        // If we have the file locally let's display
        // it or have a link
        return {
          mediaType: (supportedMediaType ? "IMAGE" : "UNSUPPORTED") as
            | "IMAGE"
            | "UNSUPPORTED"
            | undefined,
          mimeType: messageAttachmentData.mimeType,
          imageSize: messageAttachmentData.imageSize,
          mediaURL: attachmentPath,
          contentLength: 0,
          filename: messageAttachmentData.filename,
        };
      }
    } catch (e) {
      console.log(e);
    }
  }
};

export const uploadRemoteAttachment = async (
  attachment: EncryptedLocalAttachment
): Promise<RemoteAttachmentContent> => {
  const cid = await uploadFileToWeb3Storage(
    attachment.encryptedLocalFileUri.replace("file:///", "/"),
    "XMTPEncryptedContent",
    "application/octet-stream"
  );
  const url = `https://${cid}.ipfs.w3s.link`;
  return {
    scheme: "https://",
    url,
    ...attachment.metadata,
  };
};
