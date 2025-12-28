import { Container, SimpleGrid, Skeleton, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { FaBriefcase, FaHeart, FaUsers, FaUserShield, FaBullhorn } from "react-icons/fa6";
import { useDashboardServices } from "../services";
import { UserStatistics } from "../types";
import StatisticsCard from "./StatisticsCard";

export default function DashboardStatistics() {
  const { getBasicStatistics } = useDashboardServices();

  const [basicStats, setBasicStats] = useState<Partial<UserStatistics>>();
  const [isLoadingBasic, setIsLoadingBasic] = useState(false);

  const fetchBasicStatistics = useCallback(async () => {
    setIsLoadingBasic(true);
    try {
      const data = await getBasicStatistics();
      setBasicStats(data);
    } catch (error) {
      console.error("Error fetching basic statistics:", error);
      notifications.show({
        color: "red",
        title: "Error Loading Basic Statistics",
        message: "Failed to load basic statistics",
      });
    }
    setIsLoadingBasic(false);
  }, []);

  useEffect(() => {
    fetchBasicStatistics();
  }, [fetchBasicStatistics]);

  const statSkeletons = Array.from({ length: 13 }, (_, index) => (
    <Skeleton key={index} height={120} radius="md" />
  ));

  const statisticsCards = basicStats
    ? [
      {
        title: "Total Jobs Posted",
        value: basicStats.totalJobsPosted,
        color: "#4968D5",
        icon: <FaBriefcase size="1.2rem" />,
      },

      {
        title: "Active Job Posts",
        value: basicStats.activeJobPosts,
        color: "#22c55e",
        icon: <FaCheckCircle size="1.2rem" />,
      },

      {
        title: "Total Jobs",
        value: basicStats.totalJobTypePosts,
        color: "#9333ea",
        icon: <FaBriefcase size="1.2rem" />,
      },

      {
        title: "Active Jobs",
        value: basicStats.activeJobTypePosts,
        color: "#16a34a",
        icon: <FaCheckCircle size="1.2rem" />,
      },

      {
        title: "Closed Jobs",
        value: basicStats.closedJobTypePosts,
        color: "#dc2626",
        icon: <FaCheckCircle size="1.2rem" />,
      },

      {
        title: "Total Ads",
        value: basicStats.totalAdTypePosts,
        color: "#f97316",
        icon: <FaBullhorn size="1.2rem" />,
      },

      {
        title: "Active Ads",
        value: basicStats.activeAdTypePosts,
        color: "#14b8a6",
        icon: <FaCheckCircle size="1.2rem" />,
      },

      {
        title: "Closed Ads",
        value: basicStats.closedAdTypePosts,
        color: "#6b7280",
        icon: <FaCheckCircle size="1.2rem" />,
      },

      {
        title: "Total Hired Jobs",
        value: basicStats.totalHiredJobs,
        color: "#ef4444",
        icon: <FaHeart size="1.2rem" />,
      },

      {
        title: "Closed but Not Hired",
        value: ((basicStats.closedJobTypePosts ?? 0) + (basicStats.closedAdTypePosts ?? 0)) - (basicStats.totalHiredJobs ?? 0),
        color: "#f59e0b",
        icon: <FaBriefcase size="1.2rem" />,
      },

      {
        title: "Total Users",
        value: basicStats.totalUsers,
        color: "#3b82f6",
        icon: <FaUsers size="1.2rem" />,
      },
      {
        title: "Verified Users",
        value: basicStats.verifiedUsers,
        color: "#059669",
        icon: <FaUserShield size="1.2rem" />,
      },

      {
        title: "Active Users",
        value: basicStats.activeUsers,
        color: "#7c3aed",
        icon: <FaCheckCircle size="1.2rem" />,
      },
    ]
    : [];

  return (
    <Container size="xl" p={0}>
      <Stack>
        <div>
          <Title order={3}>Overview</Title>
        </div>

        <div>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {isLoadingBasic
              ? statSkeletons
              : statisticsCards.map((card, index) => {
                return (
                  <StatisticsCard
                    key={index}
                    title={card.title}
                    value={card.value ?? "..."}
                    color={card.color}
                    icon={card.icon}
                  />
                );
              })}
          </SimpleGrid>
        </div>
      </Stack>
    </Container>
  );
}
