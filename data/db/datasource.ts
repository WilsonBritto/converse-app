import "reflect-metadata";
import { DataSource } from "typeorm/browser";

import { Conversation } from "./entities/conversation";
import { Message } from "./entities/message";
import { Profile } from "./entities/profile";
import { init1671623489366 } from "./migrations/1671623489366-init";
import { addLensHandle1671788934503 } from "./migrations/1671788934503-addLensHandle";
import { addEnsName1673277126468 } from "./migrations/1673277126468-addEnsName";
import { addMessageStatus1680616920220 } from "./migrations/1680616920220-addMessageStatus";
import { addStatusIndex1681209069007 } from "./migrations/1681209069007-addStatusIndex";
import { addReadStatus1683114681319 } from "./migrations/1683114681319-addReadStatus";
import { addSentViaConverse1684057254703 } from "./migrations/1684057254703-addSentViaConverse";
import { addProfileEntity1686053217007 } from "./migrations/1686053217007-addProfileEntity";
import { removeHandlesFromConvo1686124833536 } from "./migrations/1686124833536-removeHandlesFromConvo";
import { addContentType1687793816866 } from "./migrations/1687793816866-addContentType";
import { addMessageReaction1688549487960 } from "./migrations/1688549487960-addMessageReaction";

// We support SQLite from version 3.8.10.2 (embedded in Android 6.0 - SDK 23)
// For supported methods see https://www.sqlite.org/changes.html
// Upsert is not always supported (see ./upsert.ts)
// ADD COLUMN supported (added in version 3.2.0)

const dataSource = new DataSource({
  database: "converse",
  driver: require("expo-sqlite"),
  entities: [Conversation, Message, Profile],
  synchronize: false,
  migrationsRun: false,
  migrations: [
    init1671623489366,
    addLensHandle1671788934503,
    addEnsName1673277126468,
    addMessageStatus1680616920220,
    addStatusIndex1681209069007,
    addReadStatus1683114681319,
    addSentViaConverse1684057254703,
    addProfileEntity1686053217007,
    removeHandlesFromConvo1686124833536,
    addContentType1687793816866,
    addMessageReaction1688549487960,
  ],
  type: "expo",
});

export default dataSource;
