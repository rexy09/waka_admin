import {
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  Divider,
  Grid,
  Group,
  Image,
  Loader,
  Modal,
  NumberFormatter,
  Paper,
  Radio,
  ScrollArea,
  SimpleGrid,
  Space,
  Spoiler,
  Stack,
  Tabs,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaMoneyBills } from "react-icons/fa6";
import { IoArrowBack, IoLocationOutline, IoTimeOutline } from "react-icons/io5";
import { MdBusinessCenter, MdVerified } from "react-icons/md";
import { TbUser, TbUsers } from "react-icons/tb";
import { useNavigate, useParams } from "react-router-dom";
import { timestampToISO } from "../../../hooks/utils";
import { JobDetailsCardSkeleton } from "../components/Loaders";
import UserAvatar from "../components/UserAvatar";
import { useJobServices } from "../services";
import {
  IHiredApplication,
  IJobApplication,
  IJobBid,
  IJobPost,
} from "../types";
import { getCategoryText } from "../utils";
import { FaMapMarkedAlt } from "react-icons/fa";

export default function PostedJobDetails() {
  const navigate = useNavigate();

  const { getJob, getJobBids, getJobApplications, getAllHiredJobApplications, updateJobPostType, toggleJobStatus, deleteJobPost } =
    useJobServices();
  const { id } = useParams();

  const [_isLoading, setIsLoading] = useState(false);
  const [job, setJob] = useState<IJobPost>();
  const [loadingApplication, setLoadingApplication] = useState(false);
  const [applications, setApplications] = useState<IJobApplication[]>([]);
  const [bids, setBids] = useState<IJobBid[]>([]);
  const [hiredApplications, setHiredApplications] = useState<
    IHiredApplication[]
  >([]);
  const [loadingHired, setLoadingHired] = useState(false);
  const [activeTab, setActiveTab] = useState("applicants");
  const [updatingPostType, setUpdatingPostType] = useState(false);
  const [postTypeModalOpened, setPostTypeModalOpened] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<"ad" | "job">("job");
  const [closeJobModalOpened, setCloseJobModalOpened] = useState(false);
  const [deleteJobModalOpened, setDeleteJobModalOpened] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [deletingJob, setDeletingJob] = useState(false);

  const tabs = [
    { id: "applicants", label: "Applicants" },
    { id: "hired", label: "Hired" },
  ];

  const fetchJobApplications = async () => {
    if (!job) return;
    setLoadingApplication(true);
    if (job.hasBidding) {
      try {
        const bids = await getJobBids({ jobId: job.id });
        setBids(bids);
      } catch (error) {
        setLoadingApplication(false);

        console.error("Error fetching job bids:", error);
        notifications.show({
          color: "red",
          title: "Error",
          message: "Failed to fetch job bids. Please try again later.",
        });
      } finally {
        setLoadingApplication(false);
      }
    } else {
      try {
        const application = await getJobApplications({ jobId: job.id });
        setApplications(application);
      } catch (error) {
        setLoadingApplication(false);

        console.error("Error checking user application:", error);
        notifications.show({
          color: "red",
          title: "Error",
          message:
            "Failed to check your application status. Please try again later.",
        });
      } finally {
        setLoadingApplication(false);
      }
    }

    try {
      setLoadingHired(true);
      const application = await getAllHiredJobApplications({ jobId: job.id });
      setHiredApplications(application);
    } catch (error) {
      setLoadingHired(false);

      console.error("Error checking user application:", error);
      notifications.show({
        color: "red",
        title: "Error",
        message:
          "Failed to check your application status. Please try again later.",
      });
    } finally {
      setLoadingHired(false);
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

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (job) {
      fetchJobApplications();
    }
  }, [job]);
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };
  const openGoogleMaps = () => {
    window.open(
      `https://maps.google.com?q=${job?.location.latitude},${job?.location.longitude
      } (${encodeURIComponent(job?.location.address ?? "")})`,
      "_blank"
    );
  };

  const handleOpenPostTypeModal = () => {
    if (job) {
      const postType = job.post_type;
      setSelectedPostType(postType === "ad" || postType === "job" ? postType : "job");
      setPostTypeModalOpened(true);
    }
  };

  const handleSubmitPostTypeChange = async () => {
    if (!job) return;

    setUpdatingPostType(true);
    try {
      await updateJobPostType(job.id, selectedPostType);
      setJob({ ...job, post_type: selectedPostType });
      notifications.show({
        color: "green",
        title: "Success",
        message: `Post type updated to ${selectedPostType.toUpperCase()}`,
      });
      setPostTypeModalOpened(false);
    } catch (error) {
      console.error("Error updating post type:", error);
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to update post type. Please try again.",
      });
    } finally {
      setUpdatingPostType(false);
    }
  };

  const handleToggleJobStatus = async () => {
    if (!job) return;

    setTogglingStatus(true);
    try {
      const newStatus = await toggleJobStatus(job.id);
      setJob({ ...job, isActive: newStatus });
      notifications.show({
        color: "green",
        title: "Success",
        message: `Job ${newStatus ? "reopened" : "closed"} successfully`,
      });
      setCloseJobModalOpened(false);
    } catch (error) {
      console.error("Error toggling job status:", error);
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to update job status. Please try again.",
      });
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!job) return;

    setDeletingJob(true);
    try {
      await deleteJobPost(job.id);
      notifications.show({
        color: "green",
        title: "Success",
        message: "Job deleted successfully",
      });
      setDeleteJobModalOpened(false);
      // Navigate back to jobs list after deletion
      navigate("/jobs");
    } catch (error) {
      console.error("Error deleting job:", error);
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to delete job. Please try again.",
      });
      setDeletingJob(false);
    }
  };

  const applicationsCards = applications.map((application) => (
    <Paper withBorder p={"xs"} radius={"md"} mb={"sm"} key={application.id}>
      <Group wrap="nowrap" align="center" justify="space-between">
        <UnstyledButton onClick={() => navigate(`/users/${application.uid}`)}>
          <Group wrap="nowrap" gap={"xs"}>
            <UserAvatar userId={application.uid} />
            <div>
              <Text size="16px" fw={500} c="#000000">
                {application.applicantName}
              </Text>
              <Space h="5px" />
              <Group wrap="nowrap" gap={3}>
                {/* <IoTimeOutline size={14} color="#596258" /> */}
                <Text size="14px" fw={400} c="#596258">
                  Applied at{" "}
                  {moment(
                    typeof application.dateAdded === "string"
                      ? new Date(application.dateAdded)
                      : application.dateAdded.toDate()
                  ).format("DD MMMM YYYY")}
                </Text>
              </Group>
            </div>
          </Group>
        </UnstyledButton>
      </Group>
    </Paper>
  ));
  const bidsCards = bids.map((bid) => (
    <Paper withBorder p={"xs"} radius={"md"} mb={"sm"} key={bid.id}>
      <Group wrap="nowrap" align="center" justify="space-between">
        <UnstyledButton onClick={() => navigate(`/users/${bid.bidderId}`)}>
          <Group wrap="nowrap" gap={"xs"}>
            <UserAvatar userId={bid.bidderId} />
            <div>
              <Text size="16px" fw={500} c="#000000">
                {bid.bidderName}
              </Text>
              <Space h="5px" />
              <Group wrap="nowrap" gap={3}>
                <Text size="14px" fw={400} c="#596258">
                  Bid at{" "}
                  {moment(
                    typeof bid?.dateAdded === "string"
                      ? new Date(bid.dateAdded)
                      : bid?.dateAdded.toDate()
                  ).format("D MMM YYYY  hh:mm A")}
                </Text>
              </Group>
              <Badge
                mt={"xs"}
                variant="light"
                color="#6247BA"
                size="md"
                radius={"xl"}
                fw={500}
              >
                <NumberFormatter
                  prefix={`${job?.currency ? job.currency.code : "TZS"} `}
                  value={bid.amount}
                  thousandSeparator
                />
              </Badge>
            </div>
          </Group>
        </UnstyledButton>
        <Stack align="end"></Stack>
      </Group>
    </Paper>
  ));
  const hiredCards = hiredApplications.map((applicant, index) => (
    <Paper withBorder p={"xs"} radius={"md"} mb={"sm"} key={index}>
      <Group wrap="nowrap" align="center" justify="space-between">
        <UnstyledButton
          onClick={() => navigate(`/users/${applicant.applicantUid}`)}
        >
          <Group wrap="nowrap" gap={"xs"}>
            <UserAvatar userId={applicant.applicantUid} />
            <div>
              <Text size="16px" fw={500} c="#000000">
                {applicant.applicantName}
              </Text>
              <Space h="5px" />
              <Group wrap="nowrap" gap={3}>
                <Text size="sm" fw={400} c="#596258">
                  Hired at{" "}
                  {moment(
                    typeof applicant?.dateHired === "string"
                      ? new Date(applicant.dateHired)
                      : applicant?.dateHired.toDate()
                  ).format("D MMM YYYY")}
                </Text>
              </Group>

              {job?.hasBidding && (
                <Badge
                  mt={"xs"}
                  variant="light"
                  color="#6247BA"
                  size="md"
                  radius={"xl"}
                  fw={500}
                >
                  <NumberFormatter
                    prefix={`${job?.currency ? job.currency.code : "TZS"} `}
                    value={applicant.amount}
                    thousandSeparator
                  />
                </Badge>
              )}
            </div>
          </Group>
        </UnstyledButton>
        <Group wrap="nowrap" gap={8}>
          <Badge
            variant="light"
            color={
              applicant.status === "completed"
                ? "green"
                : applicant.status === "approved"
                  ? "blue"
                  : applicant.status === "pending"
                    ? "gray"
                    : "gray"
            }
            size="sm"
            radius="xl"
          >
            {applicant.status ?? "N/A"}
          </Badge>
        </Group>
      </Group>
    </Paper>
  ));

  return (
    <div>
      <Modal
        opened={postTypeModalOpened}
        onClose={() => setPostTypeModalOpened(false)}
        title="Change Post Type"
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Select the post type for this job listing:
          </Text>
          <Radio.Group
            value={selectedPostType}
            onChange={(value) => {
              if (value === "ad" || value === "job") {
                setSelectedPostType(value);
              }
            }}
          >
            <Stack gap="sm">
              <Radio
                value="job"
                label="Job"
                description="Regular job posting"
              />
              <Radio
                value="ad"
                label="Ad"
                description="Promotional advertisement"
              />
            </Stack>
          </Radio.Group>
          <Group justify="flex-end" gap="sm" mt="md">
            <Button
              variant="subtle"
              onClick={() => setPostTypeModalOpened(false)}
              disabled={updatingPostType}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitPostTypeChange}
              loading={updatingPostType}
            >
              Submit
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Modal
        opened={closeJobModalOpened}
        onClose={() => setCloseJobModalOpened(false)}
        title={job?.isActive ? "Close Job" : "Reopen Job"}
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to {job?.isActive ? "close" : "reopen"} this job?
          </Text>
          <Text size="sm" fw={600}>
            {job?.title || getCategoryText(job?.category || "")}
          </Text>
          {job?.isActive && (
            <Text size="xs" c="dimmed">
              Closing this job will prevent new applications but won't delete existing ones.
            </Text>
          )}
          <Group justify="flex-end" gap="sm" mt="md">
            <Button
              variant="subtle"
              onClick={() => setCloseJobModalOpened(false)}
              disabled={togglingStatus}
            >
              Cancel
            </Button>
            <Button
              onClick={handleToggleJobStatus}
              loading={togglingStatus}
              color={job?.isActive ? "orange" : "green"}
            >
              {job?.isActive ? "Close Job" : "Reopen Job"}
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Modal
        opened={deleteJobModalOpened}
        onClose={() => setDeleteJobModalOpened(false)}
        title="Delete Job"
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="red" fw={600}>
            ⚠️ Warning: This action cannot be undone!
          </Text>
          <Text size="sm">
            Are you sure you want to permanently delete this job?
          </Text>
          <Text size="sm" fw={600}>
            {job?.title || getCategoryText(job?.category || "")}
          </Text>
          <Text size="xs" c="dimmed">
            This will permanently delete the job post and all associated data.
          </Text>
          <Group justify="flex-end" gap="sm" mt="md">
            <Button
              variant="subtle"
              onClick={() => setDeleteJobModalOpened(false)}
              disabled={deletingJob}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteJob}
              loading={deletingJob}
              color="red"
            >
              Delete Job
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Group wrap="wrap" justify="space-between" align="start">
        <Group justify="start">
          <UnstyledButton onClick={() => navigate(-1)}>
            <IoArrowBack size={20} />
          </UnstyledButton>
          <Text size="28px" fw={700} c="#141514">
            Job Details
          </Text>
        </Group>
        {job && (
          <Group gap="xs">
            <Button
              variant="light"
              color={job.isActive ? "orange" : "green"}
              onClick={() => setCloseJobModalOpened(true)}
              size="sm"
            >
              {job.isActive ? "Close Job" : "Reopen Job"}
            </Button>
            {(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && (
              <Button
                variant="light"
                color="red"
                onClick={() => setDeleteJobModalOpened(true)}
                size="sm"
              >
                Delete Job
              </Button>
            )}
          </Group>
        )}
      </Group>
      <Divider my="md" />
      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 8 }} order={{ base: 2, md: 1 }}>
          {job ? (
            <>
              <Card p={"md"} radius={"md"}>
                <div>
                  <Group justify="space-between" wrap="nowrap" align="start">
                    <Text size="18px" fw={600} c="#141514">
                      {job.title ? job.title : getCategoryText(job.category)}
                    </Text>
                    <Group gap="xs">
                      {job && (
                        <Badge
                          color={!job?.isActive ? "#E53935" : "#044299"}
                          radius="sm"
                          size="lg"
                        >
                          <Text size="xs" fw={500} c="#FFFFFF" tt={"capitalize"}>
                            {!job?.isActive ? "Closed" : "Active"}
                          </Text>
                        </Badge>
                      )}
                      {job?.post_type && (
                        <Badge
                          color={job.post_type === "ad" ? "#FF6B35" : "#6247BA"}
                          radius="sm"
                          size="lg"
                          variant="light"
                        >
                          <Text size="xs" fw={600} tt={"uppercase"}>
                            {job.post_type}
                          </Text>
                        </Badge>
                      )}
                    </Group>
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
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      margin: 0,
                      fontFamily: "inherit",
                    }}
                  >
                    {job.description}
                  </pre>
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
                      leftSection={<FaMapMarkedAlt />}
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
                  <Group wrap="nowrap" mt={"xs"}>
                    <div style={{ flex: 1 }}>
                      <Text size="12px" fw={700} c="#7F7D7D" mb={"5px"}>
                        Post Type
                      </Text>
                      <Group gap="xs" align="center">
                        <Badge
                          size="lg"
                          variant="light"
                          color={job.post_type === "ad" ? "orange" : "violet"}
                        >
                          {job.post_type?.toUpperCase() || "JOB"}
                        </Badge>
                        <Button
                          size="xs"
                          variant="light"
                          onClick={handleOpenPostTypeModal}
                        >
                          Change
                        </Button>
                      </Group>
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
                  <Space h="md" />
                  <UnstyledButton
                    onClick={() => navigate(`/users/${job.postedByUserId}`)}
                  >
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
                            {job.userDateJoined
                              ? moment(
                                typeof job.userDateJoined === "string"
                                  ? new Date(job.userDateJoined)
                                  : timestampToISO(
                                    job.userDateJoined.seconds ?? 0,
                                    job.userDateJoined.nanoseconds ?? 0
                                  )
                              ).format("MMMM YYYY")
                              : "NA"}
                          </Text>
                        </Group>
                        <Group wrap="nowrap" gap={3} mt={4}>
                          <MdBusinessCenter size={14} color="#596258" />
                          <Text size="14px" fw={400} c="#596258">
                            {job.numberOfPostedJobsByUser}{" "}
                            {job.numberOfPostedJobsByUser === 1
                              ? "job"
                              : "jobs"}{" "}
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
                  </UnstyledButton>
                </div>
              </Card>
            </>
          ) : (
            <JobDetailsCardSkeleton />
          )}
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }} order={{ base: 1, md: 2 }}>
          {!job?.hasBidding && (
            <Paper radius={"md"} p={"md"}>
              <Group justify="space-between">
                <Text size="28px" fw={700}>
                  Applications
                </Text>
              </Group>
              <Space h="lg" />
              <Group justify="center">
                <div className="flex bg-[#F4F4F4C9] rounded-lg p-1 w-fit gap-2 border border-[#C7C7C72B]">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                        ? "bg-[#151F42] text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                        }`}
                    >
                      {tab.label} {tab.id === "hired" && `(${hiredApplications.length})`} {tab.id === "applicants" && `(${applications.length})`}
                    </button>
                  ))}
                </div>
              </Group>
              <Space h="lg" />
              <Tabs value={activeTab} keepMounted={false}>
                <Tabs.Panel value="applicants">
                  {loadingApplication ? (
                    <Paper withBorder p={"xs"} radius={"md"}>
                      <Center>
                        <Loader color="violet" size={"sm"} />
                      </Center>
                    </Paper>
                  ) : applicationsCards.length > 0 ? (
                    <ScrollArea
                      style={{ height: "calc(100vh - 40vh)" }}
                      scrollbars="y"
                    >
                      {applicationsCards}
                    </ScrollArea>
                  ) : (
                    <Paper withBorder p={"xs"} radius={"md"}>
                      <Text size="sm" c="#7F7D7D" ta={"center"}>
                        No applications yet.
                      </Text>
                    </Paper>
                  )}
                </Tabs.Panel>
                <Tabs.Panel value="hired">
                  {loadingHired ? (
                    <Paper withBorder p={"xs"} radius={"md"}>
                      <Center>
                        <Loader color="violet" size={"sm"} />
                      </Center>
                    </Paper>
                  ) : hiredCards.length > 0 ? (
                    <ScrollArea
                      style={{ height: "calc(100vh - 40vh)" }}
                      scrollbars="y"
                    >
                      {hiredCards}
                    </ScrollArea>
                  ) : (
                    <Paper withBorder p={"xs"} radius={"md"}>
                      <Text size="sm" c="#7F7D7D" ta={"center"}>
                        No hired applications yet.
                      </Text>
                    </Paper>
                  )}
                </Tabs.Panel>
              </Tabs>
            </Paper>
          )}
          {job?.hasBidding && (
            <Paper radius={"md"} p={"md"}>
              <Group justify="space-between">
                <Text size="28px" fw={700}>
                  Bid Applications
                </Text>
              </Group>
              <Space h="lg" />
              <Group justify="center">
                <div className="flex bg-[#F4F4F4C9] rounded-lg p-1 w-fit gap-2 border border-[#C7C7C72B]">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                        ? "bg-[#151F42] text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </Group>
              <Space h="lg" />
              <Tabs value={activeTab} keepMounted={false}>
                <Tabs.Panel value="applicants">
                  {bidsCards.length > 0 ? (
                    <ScrollArea
                      style={{ height: "calc(100vh - 40vh)" }}
                      scrollbars="y"
                    >
                      {bidsCards}
                    </ScrollArea>
                  ) : (
                    <Paper withBorder p={"xs"} radius={"md"}>
                      <Text size="sm" c="#7F7D7D" ta={"center"}>
                        No bid applications yet.
                      </Text>
                    </Paper>
                  )}
                </Tabs.Panel>
                <Tabs.Panel value="hired">
                  {loadingHired ? (
                    <Paper withBorder p={"xs"} radius={"md"}>
                      <Center>
                        <Loader color="violet" size={"sm"} />
                      </Center>
                    </Paper>
                  ) : hiredCards.length > 0 ? (
                    <ScrollArea
                      style={{ height: "calc(100vh - 40vh)" }}
                      scrollbars="y"
                    >
                      {hiredCards}
                    </ScrollArea>
                  ) : (
                    <Paper withBorder p={"xs"} radius={"md"}>
                      <Text size="sm" c="#7F7D7D" ta={"center"}>
                        No hired applications yet.
                      </Text>
                    </Paper>
                  )}
                </Tabs.Panel>
              </Tabs>
            </Paper>
          )}
        </Grid.Col>
      </Grid>
    </div>
  );
}
