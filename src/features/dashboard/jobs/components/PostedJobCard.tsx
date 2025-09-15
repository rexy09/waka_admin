import {
  Badge,
  Button,
  Card,
  Group,
  Menu,
  Space,
  Text,
  UnstyledButton
} from "@mantine/core";
import moment from "moment";
import { IoIosMore } from "react-icons/io";
import { IoTimeOutline } from "react-icons/io5";
import { TbUser, TbUsers } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { Icons } from "../../../../common/icons";
import { IJobPost } from "../types";
interface Props {
  job: IJobPost;
}
export default function PostedJobCard({ job }: Props) {
  const navigate = useNavigate();





  return (
    <>

      <div className="group relative mx-auto w-[100%] overflow-hidden rounded-[13px] bg-white-300 p-[1px] transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-[#151F42] hover:via-[#170645] hover:to-[#044299]">
        <div className="group-hover:animate-spin-slow invisible absolute -top-40 -bottom-40 left-10 right-10 bg-gradient-to-r from-transparent via-white/90 to-transparent group-hover:visible"></div>

        <div className="relative rounded-[12px] bg-white h-[100%] w-[100%]">
          <Card
            p={"md"}
            radius={"12px"}

          >
            <Group wrap="nowrap" align="start">
              <div className="w-[100%]">
                <Group
                  justify="space-between"
                  wrap="nowrap"
                  gap={5}
                  align="start"
                >
                  <Text
                    size="16px"
                    fw={500}
                    c="#151F42"
                    lineClamp={1}
                    style={{ lineHeight: 1.2 }}
                  >
                    {job.title ? job.title : job.category}
                  </Text>
                  <Menu shadow="md" width={150}>
                    <Menu.Target>
                      <UnstyledButton className="inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100">
                        <IoIosMore size={20} />
                      </UnstyledButton>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item onClick={() => {
                        navigate("/jobs/" + job.id + "/posted");
                      }}>View Job</Menu.Item>
                      <Menu.Item>View Applications</Menu.Item>
                      <Menu.Item>View Bids</Menu.Item>
                      <Menu.Item>Close Job</Menu.Item>
                      <Menu.Item>Reopen Job</Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>

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
              <Button variant="default" size="xs" leftSection={<TbUsers />} onClick={() => {
                navigate("/my_jobs/" + job.id + "/posted");
              }}>
                View {job.hasBidding && "Bid"} Applications
              </Button>
              <Badge
                color={!job?.isActive ? "#E53935" : "#044299"}
                radius="sm"
                size="lg"
              >
                <Text size="xs" fw={500} c="#FFFFFF" tt={"capitalize"}>
                  {!job?.isActive ? "Closed" : "Active"}
                </Text>
              </Badge>
            </Group>
          </Card>
        </div>
      </div>
    </>
  );
}
