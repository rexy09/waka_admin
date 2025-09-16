import {
  Avatar,
  Box,
  Button,
  Divider,
  Group,
  Paper,
  ScrollArea,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import moment from "moment";
import { useEffect, useRef } from "react";
import { Icons } from "../../../../common/icons";
import { Color } from "../../../../common/theme";
import { OrderSkeleton } from "../components/Loaders";
import { useNotificationStore } from "../stores";
import { INotification } from "../types";

interface Props {
  data: INotification[];
  isLoading: boolean;
  hasMore: boolean;
  fetchtNotifications: () => void;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setNotifications: React.Dispatch<React.SetStateAction<INotification[]>>;
}
export default function NotificationSection({
  data,
  isLoading,
  hasMore,
  setPage,
  fetchtNotifications,
}: Props) {
  const viewport = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const notificationStore = useNotificationStore();

  useEffect(() => {
      
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            setPage((prev) => prev + 1);
          }
        },
        { root: viewport.current, threshold: 0.1 } // Trigger when 10% of sentinel is visible
      );
  
      if (observerRef.current) {
        observer.observe(observerRef.current);
      }
  
      return () => {
        if (observerRef.current) {
          observer.unobserve(observerRef.current);
        }
      };
  }, [notificationStore.refresh]);

  const orderSkeletons = Array(4)
    .fill(0)
    .map((_, index) => <OrderSkeleton key={index} />);
  



  return (
    <>
      <Paper p="md" radius="10px" style={{ border: "1px solid #1A2F570F" }}>
        <Group justify="space-between">
          <Text c={Color.TextSecondary} size="16px" fw={500}>
            Today
          </Text>
          <Group>
            <Button
              radius={"md"}
              variant={notificationStore.isRead == undefined ? "filled" : "default"}
              onClick={() => {
                notificationStore.updateText("isRead", undefined)
                notificationStore.inc();
                fetchtNotifications();
              }}
            >
              All
            </Button>
            <Button
              variant={notificationStore.isRead != undefined ? "filled" : "default"}
              radius={"md"}
              onClick={() => {
                if (notificationStore.isRead == undefined) {
                  notificationStore.updateText("isRead", false)

                } else if (notificationStore.isRead == true) {
                  notificationStore.updateText("isRead", false)

                } else {
                  notificationStore.updateText("isRead", true)

                }
                notificationStore.inc();
                fetchtNotifications();

              }}
            >
              {notificationStore.isRead == true ? "Read" : "Unread"} {notificationStore.readCount != 0 ? notificationStore.readCount : null}
            </Button>
          </Group>
        </Group>
        <Space h="md" />
        <ScrollArea h={"60vh"} w={"100%"} scrollbars="y">
          <Box w={"100%"}>
            {data.map((item) => (
              <Paper
                key={item.id}
                p="md"
                radius="10px"
                w={"100%"}
                onClick={() => {
                  if (item.is_read ==false) {
                  }
                }}
              >
                <Group justify="space-between">
                  <Group>
                    <Avatar
                      color={item.is_read ? "#A6A5A6" : "#0B72DA"}
                      radius="xl"
                      size={"lg"}
                    >
                      {item.is_read
                        ? Icons.notification
                        : Icons.notification_blue}
                    </Avatar>
                    <div>
                      <Text c="#000000" size="16px" fw={400}>
                        {item.title}
                      </Text>
                      <Space h="sm" />
                      <Text c={Color.TextSecondary} size="16px" fw={400}>
                        {item.message}
                      </Text>
                    </div>
                  </Group>
                  <Text c={Color.TextSecondary} size="16px" fw={400}>
                    {moment(item.created_at).fromNow()}
                  </Text>
                </Group>
                <Divider ms={"70px"} my={"md"} />
              </Paper>
            ))}
            {hasMore && (
              <div
                ref={observerRef}
                style={{ height: "20px", textAlign: "center" }}
              >
                {isLoading && orderSkeletons}
              </div>
            )}
            {data.length == 0 && isLoading == false && (
              <Stack justify="center" align="center" h={300}>
                <Text>No notification available</Text>
              </Stack>
            )}
          </Box>
        </ScrollArea>
      </Paper>
    </>
  );
}
