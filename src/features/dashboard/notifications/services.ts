import axios from "axios";
import Env from "../../../config/env";
import { INotificationForm } from "./types";

export const useNotificationServices = () => {
  const broadcastNotification = async (d: INotificationForm) => {
    return axios.post(
      Env.baseURL + "/notifications/broadcast_notifications",
      d
    );
  };

  return {
    broadcastNotification,
  };
};
