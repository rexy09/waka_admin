import {
  ActionIcon,
  Button,
  Divider,
  Grid,
  Group,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Space,
  Text,
  TextInput
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import { MdOutlineClear } from "react-icons/md";
import { Icons } from "../../../../common/icons";
import { Color } from "../../../../common/theme";
import { useUtilities } from "../../../hooks/utils";
import JobCard from "../components/JobCard";
import { JobCardSkeleton } from "../components/Loaders";
import { useJobServices } from "../services";
import { useJobParameters } from "../stores";
import { ICommitmentType, IJobCategory, IJobPost, IUrgencyLevels } from "../types";

export default function Jobs() {
  const parameters = useJobParameters();
  const { getJobs, getCatgories, getCommitmentTypes, getUrgencyLevels } =
    useJobServices();
  const { getFormattedDate } = useUtilities();
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<IJobPost[]>([]);
  const [lastDoc, setLastDoc] = useState<any | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [jobCategories, setJobCategories] = useState<IJobCategory[]>([]);
  const [commitmentTypes, setCommitmentTypes] = useState<ICommitmentType[]>([]);
  const [urgencyLevels, setUrgencyLevels] = useState<IUrgencyLevels[]>([]);
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
          const newJobs = response.data.filter((job) => !existingIds.has(job.id));
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
        getUrgencyLevels()
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
  }


  const handleResetFilters = () => {
    // Reset all parameters
    parameters.updateText("search", "");
    parameters.updateText("location", "");
    parameters.updateText("category", "");
    parameters.updateText("urgency", "");
    parameters.updateText("commitment", "");
    fetchData();
  
  };

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
      <Space h="md" />

      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }} visibleFrom="lg">
          <Paper p={"md"} radius={"md"}>
            <Group justify="space-between">
              <Text size="18px" fw={700} c="#040404">
                Filter Job
              </Text>
              <Text size="14px" fw={400} c="#F25454" style={{ cursor: 'pointer' }}
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


            {/* <div>
              <Group justify="space-between">
                <Text size="16px" fw={500} c="#040404">
                  Experience Level
                </Text>
                {Icons.arrow_up}
              </Group>
              <Space h="md" />

              <SimpleGrid cols={2}>
                <Checkbox label="Beginner" color={Color.DarkBlue} />
                <Checkbox
                  defaultChecked
                  label="Intermediate"
                  color={Color.DarkBlue}
                />
                <Checkbox label="Advance" color={Color.DarkBlue} />
                <Checkbox
                  defaultChecked
                  label="Profesional"
                  color={Color.DarkBlue}
                />
              </SimpleGrid>
            </div>
            <Divider my="lg" /> */}
            {/* <div>
              <Group justify="space-between">
                <Text size="16px" fw={500} c="#040404">
                  Budget Range
                </Text>
                {Icons.arrow_up}
              </Group>
              <Space h="md" />

              <SimpleGrid cols={2}>
                <Checkbox label="$0 - $100" color={Color.DarkBlue} />
                <Checkbox label="$100 - $1000" color={Color.DarkBlue} />
                <Checkbox label="$1000 - $2000" color={Color.DarkBlue} />
                <Checkbox label="$2000 - $5000" color={Color.DarkBlue} />
                <Checkbox
                  defaultChecked
                  label="Custom"
                  color={Color.DarkBlue}
                />
              </SimpleGrid>
              <Space h="md" />

              <RangeSlider
                color={Color.DarkBlue}
                minRange={0.2}
                min={0}
                max={1}
                step={0.0005}
                defaultValue={[0.1245, 0.5535]}
              />
            </div> */}
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 8 }}>
          <Paper p={"md"} radius={"md"}>
            <Group justify="space-between">
              <Group>
                <TextInput
                  leftSection={Icons.search}
                  placeholder="UI UX Designer"
                  radius={"md"}
                  value={parameters.search}
                  onChange={(value) => {
                    parameters.updateText("search", value.currentTarget.value);
                    // fetchOrders(1);
                  }}
                  rightSection={
                    parameters.search.length != 0 ? (
                      <ActionIcon
                        variant="transparent"
                        color="black"
                        onClick={() => {
                          parameters.updateText("search", "");
                          // fetchOrders(1);
                        }}
                      >
                        <MdOutlineClear />
                      </ActionIcon>
                    ) : null
                  }
                />
                <Divider orientation="vertical" />
                <TextInput
                  leftSection={Icons.location}
                  placeholder="Dar es salaam, Tanzania"
                  radius={"md"}
                  value={parameters.location}
                  onChange={(value) => {
                    parameters.updateText("location", value.currentTarget.value);
                  }}
                  rightSection={
                    parameters.location.length != 0 ? (
                      <ActionIcon
                        variant="transparent"
                        color="black"
                        onClick={() => {
                          parameters.updateText("location", "");
                        }}
                      >
                        <MdOutlineClear />
                      </ActionIcon>
                    ) : null
                  }
                />
              </Group>
              <Button
                size="md"
                variant="filled"
                color={Color.PrimaryBlue}
                fw={400}
              >
                Find Job
              </Button>
            </Group>
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
            <SimpleGrid cols={{ sm: 2, xs: 1 }} >
              {cards}
              {isLoading && skeletons}
            </SimpleGrid>
            {!hasMore && !isLoading && (
              <Group justify="center" mt="md">
                <Text c="dimmed" size="md">No more jobs to show</Text>
              </Group>
            )}
          </ScrollArea>
        </Grid.Col>
      </Grid>
    </div>
  );
}



