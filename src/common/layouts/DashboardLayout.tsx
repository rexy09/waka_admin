import { AppShell, Box } from "@mantine/core";

import { useDisclosure } from "@mantine/hooks";
import { getToken } from "firebase/messaging";
import { useEffect } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Env from "../../config/env";
import { messaging } from "../../config/firebase";
import DasboardFooter from "../navs/dashboard/footer/DasboardFooter";
import HeaderMenu from "../navs/dashboard/header/HeaderMenu";
import Sidebar from "../navs/dashboard/sidebar/Sidebar";

export default function DashboardLayout() {
  const [opened, { toggle }] = useDisclosure();
  async function requestPermission() {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      await getToken(messaging, {
        vapidKey: Env.APP_VAPID_KEY,
      });
    } else if (permission === "denied") {
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
        backgroundColor: "#F9F9F9",
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
