import React, { createContext, Dispatch, useReducer } from "react";

import { AppActions, appInitialState, appReducer, AppType } from "./appReducer";
import {
  NotificationsActions,
  notificationsInitialState,
  notificationsReducer,
  NotificationsType,
} from "./notificationsReducer";
import {
  ProfilesActions,
  profilesInitialState,
  profilesReducer,
  ProfilesType,
} from "./profilesReducer";
import {
  XmtpActions,
  xmtpInitialState,
  xmtpReducer,
  XmtpType,
} from "./xmtpReducer";

export type StateType = {
  xmtp: XmtpType;
  notifications: NotificationsType;
  app: AppType;
  profiles: ProfilesType;
};

const initialState: StateType = {
  xmtp: xmtpInitialState,
  notifications: notificationsInitialState,
  app: appInitialState,
  profiles: profilesInitialState,
};

export type ActionsType =
  | XmtpActions
  | NotificationsActions
  | AppActions
  | ProfilesActions;
export type DispatchType = (value: ActionsType) => void;

const AppContext = createContext<{
  state: StateType;
  dispatch: Dispatch<ActionsType>;
}>({
  state: initialState,
  dispatch: () => null,
});

const mainReducer = (
  { xmtp, notifications, app, profiles }: StateType,
  action: ActionsType
) => ({
  app: appReducer(app, action as AppActions),
  xmtp: xmtpReducer(xmtp, action as XmtpActions),
  notifications: notificationsReducer(
    notifications,
    action as NotificationsActions
  ),
  profiles: profilesReducer(profiles, action as ProfilesActions),
});

const AppProvider: React.FC<any> = (props: any) => {
  const [state, dispatch] = useReducer(mainReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {props.children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
