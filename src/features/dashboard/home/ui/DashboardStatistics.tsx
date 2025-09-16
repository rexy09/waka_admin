import {
  Container,
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




  const statSkeletons = Array.from({ length: 6 }, (_, index) => (
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

       

       
      </Stack>
    </Container>
  );
}
