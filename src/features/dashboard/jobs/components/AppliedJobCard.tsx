import {
  Avatar,
  Badge,
  Card,
  Group,
  NumberFormatter,
  Space,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import moment from "moment";
import { useEffect, useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import { FiBookmark } from "react-icons/fi";
import { IoTimeOutline } from "react-icons/io5";
import { TbUser, TbUsers } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { Icons } from "../../../../common/icons";
import { IUser } from "../../../auth/types";
import { IJobApplication, IJobPost } from "../types";
import { useJobServices } from "../services";
interface Props {
  job: IJobPost;
  application: IJobApplication;
}
export default function AppliedJobCard({ job, application }: Props) {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const authUser = useAuthUser<IUser>();
  const { isJobSaved, saveJob, unsaveJob } = useJobServices();

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Check if job is saved when component mounts
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!isAuthenticated || !authUser?.uid) {
        console.log("User not authenticated, skipping save status check");
        return;
      }

      // console.log('Checking save status for job:', job.id);
      setCheckingStatus(true);
      try {
        const saved = await isJobSaved(job.id);
        // console.log('Job save status:', saved);
        setIsSaved(saved);
      } catch (error) {
        console.error("Error checking saved status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkSavedStatus();
  }, [job.id, isAuthenticated, authUser?.uid]); // Removed isJobSaved from dependencies

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card click navigation

    console.log(
      "Save toggle clicked for job:",
      job.id,
      "Current saved status:",
      isSaved
    );

    

    if (isLoading || checkingStatus) {
      console.log("Already loading, skipping...");
      return;
    }

    setIsLoading(true);
    try {
      if (isSaved) {
        console.log("Unsaving job:", job.id);
        await unsaveJob(job.id);
        setIsSaved(false);
        notifications.show({
          color: "green",
          title: "Success",
          message: "Job removed from saved jobs",
        });
      } else {
        console.log("Saving job:", job.id);
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
      setIsLoading(false);
    }
  };

  return (
    <>
     
      <div className="group relative mx-auto w-[100%] overflow-hidden rounded-[13px] bg-white-300 p-[1px] transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-[#151F42] hover:via-[#170645] hover:to-[#044299]">
        <div className="group-hover:animate-spin-slow invisible absolute -top-40 -bottom-40 left-10 right-10 bg-gradient-to-r from-transparent via-white/90 to-transparent group-hover:visible"></div>

        <div className="relative rounded-[12px] bg-white h-[100%] w-[100%]">
          <Card
            p={"md"}
            radius={"12px"}
            onClick={() => {
              navigate("/my_jobs/" + job.id + "/applied");
            }}
          >
            <Group wrap="nowrap" align="start">
              <Avatar w="40px" h="40px" radius={"xl"} src={job.avatarUrl} />

              <div className="w-[100%]">
                <Group
                  justify="space-between"
                  wrap="nowrap"
                  gap={5}
                  align="start"
                >
                  <Text size="md" fw={400} c="#000000" lineClamp={1}>
                    {job.fullName}
                  </Text>
                  <div onClick={handleSaveToggle} style={{ cursor: "pointer" }}>
                    <UnstyledButton
                      variant="subtle"
                      color={isSaved ? "#151F42" : "#C7C7C7"}
                      size={"md"}
                      disabled={checkingStatus || isLoading}
                      style={{
                        opacity: checkingStatus || isLoading ? 0.5 : 1,
                        cursor:
                          isLoading || checkingStatus
                            ? "not-allowed"
                            : "pointer",
                        pointerEvents: "none", // Prevent button from handling click
                      }}
                    >
                      <FiBookmark
                        size={16}
                        fill={isSaved ? "#151F42" : "none"}
                        color={isSaved ? "#151F42" : "#C7C7C7"}
                      />
                    </UnstyledButton>
                  </div>
                </Group>
                <Text
                  size="16px"
                  fw={500}
                  c="#151F42"
                  lineClamp={1}
                  style={{ lineHeight: 1.2 }}
                >
                  {job.title ? job.title : job.category}
                </Text>
                <Group wrap="nowrap" gap={2} mt={2}>
                  <IoTimeOutline size={10} />
                  <Text size="10px" fw={500} c="#596258">
                    {moment(
                      typeof job.datePosted === "string"
                        ? new Date(job.datePosted)
                        : job.datePosted.toDate()
                    )
                      .startOf("day")
                      .fromNow()}
                  </Text>
                </Group>
                <Space h="xs" />
              </div>
            </Group>
            <Group wrap="nowrap" gap={5}>
              <Text
                size="10px"
                fw={500}
                c="#044299"
                lineClamp={1}
                style={{ lineHeight: 1.2 }}
              >
                {job.category}
              </Text>
              <Group wrap="nowrap" gap={3}>
                {Icons.location2}
                <Text
                  size="10px"
                  fw={500}
                  c="#596258"
                  lineClamp={1}
                  style={{ lineHeight: 1.2 }}
                >
                  {job.location.address}
                </Text>
              </Group>
            </Group>
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
                {(job.numberOfPositions ?? 1) > 1 ? <TbUsers /> : <TbUser />}
              </div>
            </Group>
            <Space h="xs" />
            <Text size="sm" fw={400} c="#596258" lineClamp={3}>
              {job.description}
            </Text>

            <Space h="xs" />
            <Group justify="space-between" align="center">
              <Text size="20px" fw={400} c="#151F42">
                <NumberFormatter
                  prefix={`${job.currency ? job.currency.code : "TZS"} `}
                  value={job.budget}
                  thousandSeparator
                />
                {job.maxBudget > 0 && (
                  <NumberFormatter
                    prefix={` - ${job.currency ? job.currency.code : "TZS"} `}
                    value={job.maxBudget}
                    thousandSeparator
                  />
                )}
              </Text>
              <Badge
                color={
                  application.status === "accepted"
                    ? "#044299"
                    : application.status === "approved"
                      ? "#6247BA"
                      : application.status === "completed"
                    ? "#43A047"
                    : application.status === "pending"
                    ? "#FF8810"
                    : application.status === "rejected"
                            ? "#E53935"
                    : "#044299"
                }
                radius="sm"
                size="md"
              >
                <Text size="xs" fw={500} c="#FFFFFF" tt={"capitalize"}>
                  {application.status === "rejected"?"Closed":application.status}
                </Text>
              </Badge>
            </Group>
          </Card>
        </div>
      </div>
    </>
  );
}
