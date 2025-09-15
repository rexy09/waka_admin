import {
  Avatar,
  Button,
  Card,
  Grid,
  Group,
  Image,
  NumberFormatter,
  Paper,
  SimpleGrid,
  Space,
  Spoiler,
  Text
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import moment from "moment";
import { useEffect, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import { FaMapMarkedAlt } from "react-icons/fa";
import { FaMoneyBills } from "react-icons/fa6";
import { FiBookmark } from "react-icons/fi";
import { IoLocationOutline, IoTimeOutline } from "react-icons/io5";
import { MdBusinessCenter, MdVerified } from "react-icons/md";
import { TbUser, TbUsers } from "react-icons/tb";
import { useParams } from "react-router-dom";
import { IUser } from "../../../auth/types";
import { timestampToISO } from "../../../hooks/utils";
import JobCard from "../components/JobCard";
import { JobCardSkeleton, JobDetailsCardSkeleton } from "../components/Loaders";
import SearchModal from "../components/SearchModal";
import { useJobServices } from "../services";
import { IJobPost, PaginatedResponse } from "../types";

export default function JobDetails() {
  const isAuthenticated = useIsAuthenticated();
  const authUser = useAuthUser<IUser>();

  const {
    getJob,
    getRelatedJobs,
    postJobApplication,
    userAppliedForJob,
    isJobSaved,
    saveJob,
    unsaveJob,
  } = useJobServices();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [_loadingJobs, setLoadingJobs] = useState(false);
  const [jobs, setJobs] = useState<PaginatedResponse<IJobPost>>();
  const [job, setJob] = useState<IJobPost>();
  const [coverLetter, setCoverLetter] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [checkingSavedStatus, setCheckingSavedStatus] = useState(false);
  const [authModalStatus, openAuthModal] = useState(false);



  const checkUserApplication = async () => {
    if (!job || !authUser?.uid || !isAuthenticated) return;

    setCheckingApplication(true);
    try {
      const applied = await userAppliedForJob(job.id, authUser.uid);
      setHasApplied(applied);
    } catch (error) {
      console.error("Error checking application status:", error);
    } finally {
      setCheckingApplication(false);
    }
  };

  const checkSavedStatus = async () => {
    if (!job || !authUser?.uid || !isAuthenticated) return;

    setCheckingSavedStatus(true);
    try {
      const saved = await isJobSaved(job.id);
      setIsSaved(saved);
    } catch (error) {
      console.error("Error checking saved status:", error);
    } finally {
      setCheckingSavedStatus(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!job) return;

    if (!isAuthenticated || !authUser?.uid) {
      openAuthModal(true);
      // notifications.show({
      //   color: "blue",
      //   title: "Authentication Required",
      //   message: "Please sign in to save jobs",
      // });
      return;
    }

    if (isSaving || checkingSavedStatus) {
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        await unsaveJob(job.id);
        setIsSaved(false);
        notifications.show({
          color: "green",
          title: "Success",
          message: "Job removed from saved jobs",
        });
      } else {
        await saveJob(job.id);
        setIsSaved(true);
        notifications.show({
          color: "green",
          title: "Success",
          message: "Job saved successfully",
        });
      }
    } catch (error: any) {
      console.error("Error toggling save status:", error);
      notifications.show({
        color: "red",
        title: "Error",
        message: error.message || "Failed to update saved status",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const fetchData = () => {
    setIsLoading(true);

    getJob(id!)
      .then((response) => {
        setIsLoading(false);
        setJob(response);
      })
      .catch((_error) => {
        setIsLoading(false);
        notifications.show({
          color: "red",
          title: "Error",
          message: "Something went wrong!",
        });
      });
  };
  const fetchRelatedJobs = (next?: string) => {
    setLoadingJobs(true);

    getRelatedJobs(job?.category!, id!, next, jobs?.lastDoc, jobs?.firstDoc)
      .then((response) => {
        setLoadingJobs(false);
        setJobs(response);
      })
      .catch((_error) => {
        setLoadingJobs(false);
        notifications.show({
          color: "red",
          title: "Error",
          message: "Something went wrong!",
        });
      });
  };
  useEffect(() => {
    fetchData();
  }, [id]);
  useEffect(() => {
    if (job) {
      fetchRelatedJobs();
    }
  }, [job]);
  useEffect(() => {
    if (job && isAuthenticated && authUser?.uid) {
      checkUserApplication();
      checkSavedStatus();
    }
  }, [job, isAuthenticated, authUser?.uid]);
  const skeletons = Array.from({ length: 6 }, (_, index) => (
    <JobCardSkeleton key={index} />
  ));
  const cards = jobs?.data.map((item, index) => (
    <JobCard job={item} key={index} />
  ));
  const openGoogleMaps = () => {
    window.open(`https://maps.google.com?q=${job?.location.latitude},${job?.location.longitude} (${encodeURIComponent(job?.location.address ?? "")})`, '_blank');
  };
 
  
  return (
    <div>
      

      <Paper p={"md"} radius={"md"}>
        <SearchModal />
      </Paper>
      <Space h="md" />
      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }} order={{ base: 2, md: 1 }}>
          <Group justify="space-between" visibleFrom="md">
            <Text size="28px" fw={700}>
              Related Jobs
            </Text>
          </Group>
          <Space h="md" />
          <Group justify="space-between" hiddenFrom="md" mb="md">
            <Text size="28px" fw={700}>
              Related Jobs
            </Text>
          </Group>
          <SimpleGrid cols={1}>{isLoading ? skeletons : cards}</SimpleGrid>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 8 }} order={{ base: 1, md: 2 }}>
          {job ? (
            <>
              <Group wrap="wrap" justify="space-between" align="start">
                <Text size="28px" fw={700} c="#141514">
                  Job Details
                </Text>
                <Group>
                  <Button
                    variant="filled"
                    color={isSaved ? "#151F42" : "#E5E5E5"}
                    c={isSaved ? "white" : "black"}
                    size="xs"
                    radius={"md"}
                    fw={500}
                    leftSection={
                      <FiBookmark
                        size={16}
                        fill={isSaved ? "white" : "none"}
                        color={isSaved ? "white" : "black"}
                      />
                    }
                    onClick={handleSaveToggle}
                    loading={isSaving || checkingSavedStatus}
                    disabled={isSaving || checkingSavedStatus}
                  >
                    {isSaved ? "Saved" : "Save job"}
                  </Button>
                  
                </Group>
              </Group>
              <Space h="md" />
              <Card p={"md"} radius={"md"}>
                <div>
                  <Group justify="space-between" wrap="nowrap" align="start">
                    <Text size="18px" fw={600} c="#141514">
                      {job.title ? job.title : job.category}
                    </Text>
                    <div
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${job.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      {job.isActive ? "Active" : "Closed"}
                    </div>
                  </Group>
                  <Group wrap="nowrap" gap={2} mt={"xs"}>
                    <IoTimeOutline size={12} />
                    <Text size="12px" fw={500} c="#596258">
                      {moment(
                        typeof job.datePosted === "string"
                          ? new Date(job.datePosted)
                          : job.datePosted.toDate()
                      )
                        .startOf("day")
                        .fromNow()}
                    </Text>
                  </Group>
                </div>
                <Space h="xs" />
                <Group wrap="wrap" gap={5}>
                  <span className="inline-flex items-center rounded-[7px] bg-[#F0F0F0] px-2 py-1 text-xs font-medium text-[#151F42]  ">
                    {job.commitment}
                  </span>
                  <span className="inline-flex items-center rounded-[7px] bg-[#F0F0F0] px-2 py-1 text-xs font-medium text-[#151F42]  ">
                    {job.urgency}
                  </span>
                  <span className="inline-flex items-center rounded-[7px] bg-[#F0F0F0] px-2 py-1 text-xs font-medium text-[#151F42]  ">
                    {job.workLocation}
                  </span>

                  <div className="inline-flex items-center rounded-[7px] bg-[#F0F0F0] px-2 py-1 text-xs font-medium text-[#151F42] ">
                    <span className="mr-1">
                      {(job.numberOfPositions ?? 1) > 1
                        ? `${job.numberOfPositions ?? 1}`
                        : `${job.numberOfPositions ?? 1}`}
                    </span>
                    {(job.numberOfPositions ?? 1) > 1 ? (
                      <TbUsers />
                    ) : (
                      <TbUser />
                    )}
                  </div>
                </Group>
                <Space h="xs" />

                <Spoiler maxHeight={146} showLabel="Show more" hideLabel="Hide">
                  <Text size="md" fw={400} c="#7F7D7D">
                    {job.description}
                  </Text>

                  {/* <TypographyStylesProvider>
                  <div
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </TypographyStylesProvider> */}
                </Spoiler>
              </Card>
              <Space h="md" />

              <Card p={"md"} radius={"md"}>
                <div>
                  <Text size="20px" fw={500} c="#141514">
                    Location
                  </Text>
                  <Group wrap="nowrap" justify="space-between" align="center">
                    <Group wrap="nowrap" gap={3} mt={"xs"}>
                      <IoLocationOutline />
                      <Text size="14px" fw={400} c="#596258">
                        {job.location.address}
                      </Text>
                    </Group>
                    <Button
                      variant="light"
                      color="violet"
                      size="sm"
                      radius="md"
                      onClick={() => openGoogleMaps()}
                      leftSection={
                        <FaMapMarkedAlt />
                      }
                    >
                      Open Map
                    </Button>
                  </Group>
                </div>
              </Card>
              <Space h="md" />
              <Card p={"md"} radius={"md"}>
                <div>
                  <Text size="20px" fw={500} c="#141514">
                    Budget
                  </Text>
                  <Group wrap="nowrap" mt={"xs"}>
                    <Avatar color="#EBEBEB" radius="xl" variant="filled">
                      <FaMoneyBills color="#141514" />
                    </Avatar>
                    <div>
                      <Text size="12px" fw={700} c="#7F7D7D" mb={"5px"}>
                        Budget
                      </Text>
                      <Text size="16px" fw={700} c="#151F42">
                        <NumberFormatter
                          prefix={`${job.currency ? job.currency.code : "TZS"
                            } `}
                          value={job.budget}
                          thousandSeparator
                        />
                        {job.maxBudget > 0 && (
                          <NumberFormatter
                            prefix={` - ${job.currency ? job.currency.code : "TZS"
                              } `}
                            value={job.maxBudget}
                            thousandSeparator
                          />
                        )}
                      </Text>
                    </div>
                  </Group>
                  <Group wrap="nowrap" mt={"xs"}>
                    <Avatar color="#EBEBEB" radius="xl" variant="filled">
                      <MdBusinessCenter color="#141514" />
                    </Avatar>
                    <div>
                      <Text size="12px" fw={700} c="#7F7D7D" mb={"5px"}>
                        Job Type
                      </Text>
                      <Text size="16px" fw={700} c="#151F42">
                        {job.commitment}
                      </Text>
                    </div>
                  </Group>
                </div>
              </Card>
              {job.imageUrls.length > 0 && (
                <Card p={"md"} radius={"md"} mt={"md"}>
                  <Text size="20px" fw={500} c="#141514">
                    Photos
                  </Text>
                  <Space h="xs" />
                  <SimpleGrid cols={4}>
                    {job.imageUrls.map((item, index) => (
                      <div key={index}>
                        <Image
                          radius="md"
                          h={150}
                          w="100%"
                          fit="cover"
                          src={item}
                        />
                      </div>
                    ))}
                  </SimpleGrid>
                </Card>
              )}
              <Space h="md" />
              <Card p={"md"} radius={"md"}>
                <div>
                  <Text size="20px" fw={500} c="#141514">
                    About Employer
                  </Text>
                  <Space h="xs" />
                  <Group wrap="nowrap" align="start">
                    <Avatar
                      w="50px"
                      h="50px"
                      radius={"xl"}
                      src={job.avatarUrl}
                    />
                    <div style={{ flex: 1 }}>
                      <Text size="16px" fw={500} c="#000000">
                        {job.fullName}
                      </Text>
                      <Space h="xs" />
                      <Group wrap="nowrap" gap={3}>
                        <IoTimeOutline size={14} color="#596258" />
                        <Text size="14px" fw={400} c="#596258">
                          Joined{" "}
                          {job.userDateJoined ? moment(
                            typeof job.userDateJoined === "string"
                              ? new Date(job.userDateJoined)
                              : timestampToISO(job.userDateJoined.seconds ?? 0, job.userDateJoined.nanoseconds ?? 0)
                          ).format("MMMM YYYY") : "NA"}
                        </Text>
                      </Group>
                      <Group wrap="nowrap" gap={3} mt={4}>
                        <MdBusinessCenter size={14} color="#596258" />
                        <Text size="14px" fw={400} c="#596258">
                          {job.numberOfPostedJobsByUser}{" "}
                          {job.numberOfPostedJobsByUser === 1 ? "job" : "jobs"}{" "}
                          posted
                        </Text>
                      </Group>
                      {job.isUserVerified && (
                        <Group wrap="nowrap" gap={3} mt={4}>
                          <MdVerified size={14} color="#44A047" />
                          <Text size="14px" fw={400} c="#44A047">
                            Verified employer
                          </Text>
                        </Group>
                      )}
                    </div>
                  </Group>
                </div>
              </Card>
            </>
          ) : (
            <JobDetailsCardSkeleton />
          )}
        </Grid.Col>
      </Grid>

      
    </div>
  );
}
