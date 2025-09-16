import {
  Button,
  CloseButton,
  Divider,
  Group,
  Image,
  Paper,
  ScrollArea,
  Space,
  Stack,
  Text,
} from "@mantine/core";

import mainLogo from "../../../../assets/logo_white.svg";

import { useMediaQuery } from "@mantine/hooks";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import { useNavigate } from "react-router-dom";
import { Icons } from "../../../icons";
import { Color } from "../../../theme";
import classes from "./sidenav.module.css";
import NavLinkButton from "./ui/NavLinkButton";
import AccountMenu from "../header/components/AccountMenu";

type SidebarProps = {
  opened: boolean;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
};

function Sidebar({ setOpened }: SidebarProps) {
  const matches = useMediaQuery("(min-width: 62em)");
  const signOut = useSignOut();
  const navigate = useNavigate();

  // const { hasRight } = useUserAuth();

  return (
    <nav
      className={classes.navbar}
      style={{ backgroundColor: "#151F42" }}
    >
      <Group justify="flex-end" hiddenFrom="md">
        <CloseButton
          title="Close"
          size="xl"
          iconSize={20}
          icon={Icons.close}
          onClick={() => setOpened(true)}
        />
      </Group>

      <Stack
        h={matches ? "95vh" : "90vh"}
        align="stretch"
        justify="space-between"
        gap="xs"
      >
        <ScrollArea h={"100vh"}>
          <div>
            <Group  justify="center">
              <Image w={"200px"} src={mainLogo} alt="logo image" />
            </Group>
            <Divider my={"md"} />

            {/* <Space h="lg" /> */}
            <Stack align="stretch" justify="flex-start" gap="xs">
              <Group hiddenFrom="md" mb={"md"}>
                <Paper p={"md"} radius="md" w={"100%"}>
                  <Group justify="space-between">
                    <AccountMenu />
                    {/* <NotificationMenu setOpened={setOpened} /> */}
                  </Group>
                </Paper>
              </Group>

              <NavLinkButton
                setOpened={setOpened}
                to={"/"}
                label={"Dashboard"}
                iconKey={"dashboard"}
              />

              <NavLinkButton
                setOpened={setOpened}
                to={"/users"}
                label={"Users"}
                iconKey={"people"}
              />

              <NavLinkButton
                setOpened={setOpened}
                to={"/manage_users"}
                label={"Manage Users"}
                iconKey={"people"}
              />
              
              <NavLinkButton
                setOpened={setOpened}
                to={"/jobs"}
                label={"Jobs"}
                iconKey={"wallet"}
              />

              <NavLinkButton
                setOpened={setOpened}
                to={"/sana_agents"}
                label={"Agents"}
                iconKey={"personalcard"}
              />

              <NavLinkButton
                setOpened={setOpened}
                to={"/billing"}
                label={"Payments"}
                iconKey={"status_up"}
              />

              <NavLinkButton
                setOpened={setOpened}
                to={"/reports_analytics"}
                label={"Analytics"}
                iconKey={"report"}
              />

             
              <NavLinkButton
                setOpened={setOpened}
                to={"/system_settings"}
                label={"Settings"}
                iconKey={"cpu_setting"}
              />
              <NavLinkButton
                setOpened={setOpened}
                to={"/support_feedback"}
                label={"Support & Feedback"}
                iconKey={"message"}
              />
            </Stack>
            <Space h="md" />

            <Divider  />
            
            <Space h="md" />

            <Button
              leftSection={Icons.logout}
              variant="transparent"
              color={Color.White}
              onClick={() => {
                signOut();
                localStorage.clear();
                navigate("/login");
              }}
            >
              <Text fz="14px" fw={500} c="#C2C2C2">
                Log Out
              </Text>
            </Button>

            <Space h="lg" />
          </div>
        </ScrollArea>
      </Stack>
    </nav>
  );
}

export default Sidebar;
