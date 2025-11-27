import {
  Group,
  ScrollArea,
  SimpleGrid,
  Text
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useJobServices } from "../services";
import { IJobPost } from "../types";
import JobCard from "./JobCard";
import { JobCardSkeleton } from "./Loaders";

export default function SavedJobsTab() {
  const { getSavedJobs } = useJobServices();
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<IJobPost[]>([]);
  const [lastDoc, setLastDoc] = useState<any | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const {id:uid} = useParams<{ id: string }>();

  const observer = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Set up Intersection Observer (following NotificationSection pattern)
  const lastJobRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            fetchJobs();
          }
        },
        {
          root: null,
          rootMargin: "100px",
          threshold: 0.1,
        }
      );
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, lastDoc]
  );


  const fetchJobs = () => {
    if (!uid) {
      console.log("User not authenticated, cannot fetch saved jobs");
      setIsLoading(false);
      setHasMore(false);
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    // On initial load, lastDoc is null, so fetch first page
    // On next page, pass direction 'next' and lastDoc
    getSavedJobs(uid, lastDoc ? "next" : undefined, lastDoc ?? undefined)
      .then((response) => {
        setIsLoading(false);
        setJobs((prev) => {
          const existingIds = new Set(prev.map((job) => job.id));
          const newJobs = response.data.filter((job: IJobPost) => !existingIds.has(job.id));
          return [...prev, ...newJobs];
        });
        setLastDoc(response.lastDoc ?? null);
        setHasMore(response.data.length > 0 && !!response.lastDoc);
      })
      .catch((error: any) => {
        console.error("Error fetching saved jobs:", error);
        setIsLoading(false);
        setHasMore(false);
        notifications.show({
          color: "red",
          title: "Error",
          message: "Failed to load saved jobs!",
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
  }




  const skeletons = Array.from({ length: 6 }, (_, index) => (
    <JobCardSkeleton key={index} />
  ));
  
  const cards = jobs.map((item, index) => (
    <div
      key={index}
      ref={index === jobs.length - 1 ? lastJobRef : undefined}
    >
      <JobCard job={item} />
    </div>
  ));

  return (
    <div>
      <ScrollArea
        mt={"md"}
        ref={containerRef}
        style={{ height: "calc(100vh - 40vh)" }}
        scrollbars="y"
      >
        <SimpleGrid cols={{ sm: 3, xs: 1 }} >
          {cards}
          {isLoading && skeletons}
        </SimpleGrid>
        {!hasMore && !isLoading && jobs.length === 0 && (
          <Group justify="center" mt="xl">
            <Text c="dimmed" size="lg" ta="center">
              No saved jobs found
              <br />
              <Text c="dimmed" size="sm">
                Save jobs that interest you to view them here
              </Text>
            </Text>
          </Group>
        )}
        {!hasMore && !isLoading && jobs.length > 0 && (
          <Group justify="center" mt="md">
            <Text c="dimmed" size="md">No more saved jobs to show</Text>
          </Group>
        )}
      </ScrollArea>
    </div>
  );
}



