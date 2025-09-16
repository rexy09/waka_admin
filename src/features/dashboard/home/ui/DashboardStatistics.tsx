import {
  Container,
  Grid,
  SimpleGrid,
  Skeleton,
  Stack,
  Title
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import {
  FaBriefcase,
  FaHeart,
  FaUsers,
  FaUserShield
} from "react-icons/fa6";
import { useDashboardServices } from "../services";
import { DashboardAnalytics, UserStatistics } from "../types";
import AnalyticsCharts from "./AnalyticsCharts";
import StatisticsCard from "./StatisticsCard";
import TopPerformingJobs from "./TopPerformingJobs";

export default function DashboardStatistics() {
  const { getBasicStatistics, getDashboardAnalytics } = useDashboardServices();

  const [basicStats, setBasicStats] = useState<Partial<UserStatistics>>();
  const [analytics, setAnalytics] = useState<DashboardAnalytics>();
  const [isLoadingBasic, setIsLoadingBasic] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);



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


  const fetchAnalytics = useCallback(async () => {
    setIsLoadingAnalytics(true);
    try {
      const data = await getDashboardAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      notifications.show({
        color: "red",
        title: "Error Loading Analytics",
        message: "Failed to load charts and analytics data",
      });
    }
    setIsLoadingAnalytics(false);
  }, []);

  useEffect(() => {
    fetchBasicStatistics();
    fetchAnalytics();
  }, [fetchBasicStatistics, fetchAnalytics]);




  const statSkeletons = Array.from({ length: 12 }, (_, index) => (
    <Skeleton key={index} height={120} radius="md" />
  ));



  const statisticsCards = basicStats ? [
    {
      title: "Total Jobs Posted",
      value: basicStats.totalJobsPosted,
      color: "#4968D5",
      icon: <FaBriefcase size="1.2rem" />
    },
  
    {
      title: "Active Job Posts",
      value: basicStats.activeJobPosts,
      color: "#22c55e",
      icon: <FaCheckCircle size="1.2rem" />
    },
   
    
   
    {
      title: "Profile Views",
      value: basicStats.profileViews,
      color: "#ef4444",
      icon: <FaHeart size="1.2rem" />
    },
   
    {
      title: "Total Users",
      value: basicStats.totalUsers,
      color: "#3b82f6",
      icon: <FaUsers size="1.2rem" />
    },
    {
      title: "Verified Users",
      value: basicStats.verifiedUsers,
      color: "#059669",
      icon: <FaUserShield size="1.2rem" />
    },
    
    {
      title: "Active Users",
      value: basicStats.activeUsers,
      color: "#7c3aed",
      icon: <FaCheckCircle size="1.2rem" />
    }
  ] : [];

  return (
    <Container size="xl" p={0}>
      <Stack >
        <div>
          <Title order={3} >
            Overview
          </Title>
          
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
                      value={ (card.value ?? "...")}
                      color={card.color}
                      icon={card.icon}
                    />
                  )
                })
            }
          </SimpleGrid>
        </div>

        {analytics && !isLoadingAnalytics && (
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <AnalyticsCharts
                jobPostingTrends={analytics.jobPostingTrends}
                applicationsByMonth={analytics.applicationsByMonth}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TopPerformingJobs jobs={analytics.topPerformingJobs} />
            </Grid.Col>
          </Grid>
        )}

       
      </Stack>
    </Container>
  );
}
