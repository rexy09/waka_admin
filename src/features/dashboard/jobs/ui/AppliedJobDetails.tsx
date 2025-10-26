import {
  Avatar,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Image,
  NumberFormatter,
  SimpleGrid,
  Space,
  Spoiler,
  Text
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import moment from "moment";
import { useEffect, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { FaMoneyBills } from "react-icons/fa6";
import { IoLocationOutline, IoTimeOutline } from "react-icons/io5";
import { MdBusinessCenter, MdVerified } from "react-icons/md";
import { TbUser, TbUsers } from "react-icons/tb";
import { useParams } from "react-router-dom";
import { IUser } from "../../../auth/types";
import { timestampToISO } from "../../../hooks/utils";
import { JobDetailsCardSkeleton } from "../components/Loaders";
import { useJobServices } from "../services";
import { IJobApplication, IJobPost } from "../types";
import { getCategoryText } from "../utils";

export default function AppliedJobDetails() {
  const authUser = useAuthUser<IUser>();

  const { getJob, getAppliedJob } = useJobServices();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [job, setJob] = useState<IJobPost>();
  const [applied, setHasApplied] = useState<IJobApplication>();
  const [checkingApplication, setCheckingApplication] = useState(false);


  const checkUserApplication = async () => {
    if (!job || !authUser?.uid) return;
    setCheckingApplication(true);
    try {
      const application = await getAppliedJob(authUser.uid, job.id);
      setHasApplied(application);
    } catch (error) {
      console.error("Error checking user application:", error);
      notifications.show({
        color: "red",
        title: "Error",
        message:
          "Failed to check your application status. Please try again later.",
      });
    } finally {
      setCheckingApplication(false);
    }
  };

  const fetchData = () => {
    setIsLoading(true);
    getJob(id!)
      .then((response) => {
        setIsLoading(false);
        setJob(response);
        checkUserApplication();
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
    if (job && authUser?.uid) {
      checkUserApplication();
    }
  }, [job, authUser?.uid]);

  return (
    <div>

      <Grid justify="center" align="start">
        <Grid.Col span={{ base: 12, md: 6, lg: 8 }}>
          {!isLoading && job ? (
            <>
              <Group wrap="wrap" justify="space-between" align="start">
                <Text size="28px" fw={700} c="#141514">
                  Job Details
                </Text>
                <Group>
                  {applied?.status == "accepted" && (
                    <Button
                      variant="filled"
                      color="#151F42"
                      size="xs"
                      radius={"md"}
                      fw={500}
                      // onClick={() => setApplicationModalOpen(true)}
                      loading={checkingApplication}
                    >
                      Complete Job
                    </Button>
                  )}
                </Group>
              </Group>
              <Space h="md" />
              <Card p={"md"} radius={"md"}>
                <div>
                  <Group justify="space-between" wrap="nowrap" align="start">
                    <Text size="18px" fw={600} c="#141514">
                      {job.title ? job.title : getCategoryText(job.category)}
                    </Text>
                    {applied && (
                      <Badge
                        color={
                          applied.status === "accepted"
                            ? "#044299"
                            : applied.status === "approved"
                              ? "#6247BA"
                              : applied.status === "completed"
                                ? "#43A047"
                                : applied.status === "pending"
                                  ? "#FF8810"
                                  : applied.status === "rejected"
                                    ? "#E53935"
                                    : "#044299"
                        }
                        radius="sm"
                        size="md"
                      >
                        <Text size="xs" fw={500} c="#FFFFFF" tt={"capitalize"}>
                          {applied.status === "rejected"
                            ? "Closed"
                            : applied.status}
                        </Text>
                      </Badge>
                    )}
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
                  <Group wrap="nowrap" gap={3} mt={"xs"}>
                    <IoLocationOutline />
                    <Text size="14px" fw={400} c="#596258">
                      {job.location.address}
                    </Text>
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
                          {moment(
                            typeof job.userDateJoined === "string"
                              ? new Date(job.userDateJoined)
                              : timestampToISO(job?.userDateJoined?.seconds ?? 0, job?.userDateJoined?.nanoseconds ?? 0)

                          ).format("MMMM YYYY")}
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
