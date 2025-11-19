import { useCallback, useEffect, useRef, useState } from "react";
import { Grid, Group, Paper, ScrollArea, SimpleGrid, Space, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import JobCard from "../components/JobCard";
import { JobCardSkeleton } from "../components/Loaders";
import SearchModal from "../components/SearchModal";
import { useJobServices } from "../services";
import { IJobPost } from "../types";

export default function Jobs() {
  const { getJobs } = useJobServices();
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<IJobPost[]>([]);
  const [lastDoc, setLastDoc] = useState<any | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const lastJobRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            // console.log("Fetching more jobs...");
            fetchJobs();
          }
        },
        { root: null, rootMargin: "100px", threshold: 0.1 }
      );
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  const fetchJobs = () => {
    if (isLoading) return;
    setIsLoading(true);
    getJobs(lastDoc ? "next" : undefined, lastDoc ?? undefined)
      .then((response) => {
        setJobs((prev) => {
          const existingIds = new Set(prev.map((job) => job.id));
          const newJobs = response.data.filter((job) => !existingIds.has(job.id));
          // console.log("New jobs:", newJobs.map((j) => ({ id: j.id, })));
          return [...prev, ...newJobs];
        });
        setLastDoc(response.lastDoc ?? null);
        setHasMore(response.data.length > 0 && !!response.lastDoc);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching jobs:", error);
        setIsLoading(false);
        setHasMore(false);
        notifications.show({
          color: "red",
          title: "Error",
          message: "Something went wrong!",
        });
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setJobs([]);
    setLastDoc(null);
    setHasMore(true);
    fetchJobs();
  };

  const skeletons = Array.from({ length: 6 }, (_, index) => (
    <JobCardSkeleton key={index} />
  ));

  const cards = jobs.map((item, index) => (
    <div key={item.id} ref={index === jobs.length - 1 ? lastJobRef : undefined}>
      <JobCard job={item} />
    </div>
  ));

  return (
    <div>
      <Space h="md" />
      <Grid>
        <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
          <Paper p="md" radius="md">
            <SearchModal />
          </Paper>
          <ScrollArea
            mt="md"
            ref={containerRef}
            style={{ height: "calc(100vh - 120px)" }}
            scrollbars="y"
          >
            <SimpleGrid cols={{ sm: 3, xs: 1 }}>
              {cards}
              {isLoading && skeletons}
            </SimpleGrid>
            {!hasMore && !isLoading && (
              <Group justify="center" mt="md">
                <Text c="dimmed" size="md">
                  No more jobs to show
                </Text>
              </Group>
            )}
          </ScrollArea>
        </Grid.Col>
      </Grid>
    </div>
  );
}