import {
  Group,
  ScrollArea,
  SimpleGrid,
  Text
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import { useJobServices } from "../services";
import { IJobApplicationWithPost, } from "../types";
import AppliedJobCard from "./AppliedJobCard";
import { JobCardSkeleton } from "./Loaders";
import { useParams } from "react-router-dom";

export default function AppliedJobsTab() {
  const { getAppliedJobs } = useJobServices();
  const [isLoading, setIsLoading] = useState(false);
  const [jobApplicationPairs, setJobApplicationPairs] = useState<IJobApplicationWithPost[]>([]);
  const [lastDoc, setLastDoc] = useState<any | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { id:uid } = useParams<{ id: string }>();
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
    if (isLoading || !uid) return;
    setIsLoading(true);
    getAppliedJobs(uid, lastDoc ? "next" : undefined, lastDoc ?? undefined)
      .then((response) => {
        setIsLoading(false);
        setJobApplicationPairs((prev) => {
          const existingIds = new Set(prev.map((pair) => pair.job?.id));
          const newPairs = response.data.filter((pair) => pair.job && !existingIds.has(pair.job.id));
          return [...prev, ...newPairs];
        });
        setLastDoc(response.lastDoc ?? null);
        setHasMore(response.data.length > 0 && !!response.lastDoc);
      })
      .catch((error) => {
        setIsLoading(false);
        setHasMore(false);
        notifications.show({
          color: "red",
          title: "Error",
          message: error.message || "Something went wrong!",
        });
      });
  };
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setJobApplicationPairs([]);
    setLastDoc(null);
    setHasMore(true);
    fetchJobs();
  }

  const skeletons = Array.from({ length: 6 }, (_, index) => (
    <JobCardSkeleton key={index} />
  ));
  
  const cards = jobApplicationPairs.map((item, index) => (
    <div
      key={item.job?.id || index}
      ref={index === jobApplicationPairs.length - 1 ? lastJobRef : undefined}
    >
      <AppliedJobCard job={item.job} application={item.application} />
      {/* You can use item.application here if you want to display application info */}
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
        {!hasMore && !isLoading && (
          <Group justify="center" mt="md">
            <Text c="dimmed" size="md">No more jobs to show</Text>
          </Group>
        )}
      </ScrollArea>
    </div>
  );
}



