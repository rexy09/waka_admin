import {
  Grid,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Space,
  Text
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUtilities } from "../../../hooks/utils";
import JobCard from "../components/JobCard";
import { JobCardSkeleton } from "../components/Loaders";
import SearchModal from "../components/SearchModal";
import { useJobServices } from "../services";
import { useJobParameters } from "../stores";
import {
  ICommitmentType,
  IJobCategory,
  IJobPost,
  IUrgencyLevels,
} from "../types";

export default function Jobs() {
  const parameters = useJobParameters();
  const { getJobs, getCatgories, getCommitmentTypes, getUrgencyLevels } =
    useJobServices();
  const { getFormattedDate } = useUtilities();
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<IJobPost[]>([]);
  const [lastDoc, setLastDoc] = useState<any | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [_jobCategories, setJobCategories] = useState<IJobCategory[]>([]);
  const [_commitmentTypes, setCommitmentTypes] = useState<ICommitmentType[]>([]);
  const [_urgencyLevels, setUrgencyLevels] = useState<IUrgencyLevels[]>([]);
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

  const fetchJobs = () => {
    const params = useJobParameters.getState();
    if (isLoading) return;

    setIsLoading(true);
    // On initial load, lastDoc is null, so fetch first page
    // On next page, pass direction 'next' and lastDoc
    getJobs(params, lastDoc ? "next" : undefined, lastDoc ?? undefined)
      .then((response) => {
        setIsLoading(false);
        setJobs((prev) => {
          const existingIds = new Set(prev.map((job) => job.id));
          const newJobs = response.data.filter(
            (job) => !existingIds.has(job.id)
          );
          return [...prev, ...newJobs];
        });
        setLastDoc(response.lastDoc ?? null);
        setHasMore(response.data.length > 0 && !!response.lastDoc);
      })
      .catch((error) => {
        console.error("Error fetching filter data:", error);

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
    parameters.updateText("startDate", getFormattedDate(startDate));
    parameters.updateText("endDate", getFormattedDate(endDate));
    fetchData();
    fetchFilterData();
  }, []);

  const fetchFilterData = async () => {
    try {
      const [categories, commitmentTypes, urgencyLevels] = await Promise.all([
        getCatgories(),
        getCommitmentTypes(),
        getUrgencyLevels(),
      ]);

      setJobCategories(categories);
      setCommitmentTypes(commitmentTypes);
      setUrgencyLevels(urgencyLevels);
    } catch (error) {
      console.error("Error fetching filter data:", error);
    }
  };

  const fetchData = async () => {
    setJobs([]);
    setLastDoc(null);
    setHasMore(true);
    fetchJobs();
  };

  // const handleResetFilters = () => {
  //   // Reset all parameters
  //   parameters.updateText("search", "");
  //   parameters.updateText("location", "");
  //   parameters.updateText("category", "");
  //   parameters.updateText("urgency", "");
  //   parameters.updateText("commitment", "");
  //   fetchData();
  // };

  const skeletons = Array.from({ length: 6 }, (_, index) => (
    <JobCardSkeleton key={index} />
  ));

  const cards = jobs.map((item, index) => (
    <div key={index} ref={index === jobs.length - 1 ? lastJobRef : undefined}>
      <JobCard job={item} />
    </div>
  ));

  return (
    <div>
      <Space h="md" />

      <Grid>
        {/* <Grid.Col span={{ base: 12, md: 6, lg: 4 }} visibleFrom="lg">
          <Paper p={"md"} radius={"md"}>
            <Group justify="space-between">
              <Text size="18px" fw={700} c="#040404">
                Filter Job
              </Text>
              <Text
                size="14px"
                fw={400}
                c="#F25454"
                style={{ cursor: "pointer" }}
                onClick={handleResetFilters}
              >
                Reset Filter
              </Text>
            </Group>
            <Space h="lg" />
            <Select
              label="Category"
              placeholder="Select your category"
              data={jobCategories.map((item) => item.name)}
              value={parameters.category}
              searchable
              clearable
              onChange={(value) => {
                parameters.updateText("category", value ?? "");
                fetchData();
              }}
            />
            <Space h="md" />
            <Select
              label="Urgency"
              placeholder="Select your urgency"
              data={urgencyLevels.map((item) => item.level)}
              value={parameters.urgency}
              searchable
              clearable
              onChange={(value) => {
                parameters.updateText("urgency", value ?? "");
                fetchData();
              }}
            />
            <Space h="md" />

            <Select
              label="Job Type"
              placeholder="Select your Type"
              data={commitmentTypes.map((item) => item.type)}
              value={parameters.commitment}
              searchable
              clearable
              onChange={(value) => {
                parameters.updateText("commitment", value ?? "");
                fetchData();
              }}
            />
            <Space h="md" />
          </Paper>
        </Grid.Col> */}
        <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
          <Paper p={"md"} radius={"md"}>
            <SearchModal />
          </Paper>
          {/* <Group justify="flex-end" my="md">
            {jobs && (
              <PaginationComponent
                data={jobs}
                total={jobs.count}
                fetchData={fetchJobs}
                showPageParam={false}
              />
            )}
          </Group> */}
          <ScrollArea
            mt={"md"}
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
