import { Group, Space, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { useNotificationStore } from "../stores";
import { INotification } from "../types";
import NotificationSection from "./NotificationSection";

export default function Notifications() {
  const [isLoading, setIsLoading] = useState(false);


  const [sanaNotifications, setNotifications] = useState<INotification[]>([]);
  const [page, setPage] = useState(1);
  const notificationStore = useNotificationStore();
  const fetchData = () => {
    setIsLoading(true);
    
  };

  const fetchtNotifications = () => {
    setNotifications([]);
    setPage(1);
  };

  useEffect(() => {
    fetchData();
  }, [page, notificationStore.isRead]);

  return (
    <div>
      <Group justify="space-between">
        <Text size="18px" fw={500}>
          Notifications
        </Text>
      </Group>
      <Space h="md" />
      <NotificationSection
        data={sanaNotifications}
        isLoading={isLoading}
        hasMore={false}
        setPage={setPage}
        setNotifications={setNotifications}
        fetchtNotifications={fetchtNotifications}
      />
      <Space h="md" />
    </div>
  );
}
