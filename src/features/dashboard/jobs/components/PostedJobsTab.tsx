import {
  Group,
  ScrollArea,
  SimpleGrid,
  Text
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useUtilities } from "../../../hooks/utils";
import { useJobServices } from "../services";
import { useJobParameters } from "../stores";
import { IJobPost } from "../types";
import { JobCardSkeleton } from "./Loaders";
import PostedJobCard from "./PostedJobCard";

export default function PostedJobsTab() {
  const parameters = useJobParameters();
  const { getPostedJobs } = useJobServices();
    const {id:uid} = useParams<{ id: string }>();
  
  const { getFormattedDate } = useUtilities();
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<IJobPost[]>([]);
  const [lastDoc, setLastDoc] = useState<any | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Infinite scroll observer
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

  const getFirstDayOfCurrentMonth = (): Date => {
    const today = new Date();
    const value = new Date(today.getFullYear(), today.getMonth(), 1);
    return value;
  };

  const getLastDayOfCurrentMonth = (): Date => {
    const today = new Date();
    const value = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return value;
  };

  const [startDate, _setStartDate] = useState<Date | null>(() =>
    getFirstDayOfCurrentMonth()
  );
  const [endDate, _setEndDate] = useState<Date | null>(() =>
    getLastDayOfCurrentMonth()
  );

  const fetchJobs = async () => {
    if (isLoading || !uid || !hasMore) return;
    setIsLoading(true);
    try {
      // getPostedJobs should accept pagination params: userId, direction, startAfterDoc
      const response = await getPostedJobs(uid, "next", lastDoc);
      const newJobs = response.data || response;
      setJobs((prev) => {
        const existingIds = new Set(prev.map((job) => job.id));
        return [...prev, ...newJobs.filter((job: IJobPost) => !existingIds.has(job.id))];
      });
      setLastDoc(response.lastDoc ?? null);
      setHasMore(newJobs.length > 0 && !!response.lastDoc);
    } catch (error: any) {
      setHasMore(false);
      notifications.show({
        color: "red",
        title: "Error",
        message: error.message || "Failed to fetch your posted jobs",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    parameters.updateText("startDate", getFormattedDate(startDate));
    parameters.updateText("endDate", getFormattedDate(endDate));
    setJobs([]);
    setLastDoc(null);
    setHasMore(true);
    fetchJobs();
    // eslint-disable-next-line
  }, [uid]);

  const skeletons = Array.from({ length: 6 }, (_, index) => (
    <JobCardSkeleton key={index} />
  ));
  
  const cards = jobs.map((item, index) => (
    <div
      key={index}
      ref={index === jobs.length - 1 ? lastJobRef : undefined}
    >
      <PostedJobCard job={item} />
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
        {!isLoading && jobs.length === 0 && (
          <Group justify="center" mt="md">
            <Text c="dimmed" size="md">No posted jobs found</Text>
          </Group>
        )}
        {!hasMore && jobs.length > 0 && (
          <Group justify="center" mt="md">
            <Text c="dimmed" size="md">No more jobs to show</Text>
          </Group>
        )}
      </ScrollArea>
    </div>
  );
}



