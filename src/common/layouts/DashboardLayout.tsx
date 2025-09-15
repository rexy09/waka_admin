import { AppShell, Box } from "@mantine/core";

import { useDisclosure } from "@mantine/hooks";
import { getToken } from "firebase/messaging";
import { useEffect } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Env from "../../config/env";
import { messaging } from "../../config/firebase";
import useAuthServices from "../../features/auth/services";
import { useNotificationStore } from "../../features/dashboard/notifications/stores";
import DasboardFooter from "../navs/dashboard/footer/DasboardFooter";
import HeaderMenu from "../navs/dashboard/header/HeaderMenu";
import Sidebar from "../navs/dashboard/sidebar/Sidebar";

export default function DashboardLayout() {
  const notificationStore = useNotificationStore();

  const [opened, { toggle }] = useDisclosure();
  const { updateUserDevice } = useAuthServices();
  async function requestPermission() {
    //requesting permission using Notification API
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: Env.APP_VAPID_KEY,
      });
      await updateUserDevice(token);

     
      // console.log("Token generated : ", token);
    } else if (permission === "denied") {
      //notifications are blocked
      alert("You denied for the notification");
    }
  }

  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <AppShell
      navbar={{ width: 250, breakpoint: "md", collapsed: { mobile: !opened } }}
      padding="0"
      style={{
        backgroundColor: "#ffffff",
      }}
    >
      <AppShell.Navbar p="0px" withBorder={false}>
        <Sidebar opened={opened} setOpened={toggle} />
      </AppShell.Navbar>
      <AppShell.Main>
        <HeaderMenu opened={opened} setOpened={toggle} />
        <Box
          style={{
            minHeight: "84vh",
            padding: "20px",
          }}
        >
          <Outlet />
          <ScrollRestoration />
        </Box>
        
        <DasboardFooter />
      </AppShell.Main>
    </AppShell>
  );
}
