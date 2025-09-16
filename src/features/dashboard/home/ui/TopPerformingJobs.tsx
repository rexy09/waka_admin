import { Paper, Text, Stack, Group, Badge } from "@mantine/core";
import { FaEye, FaUser } from "react-icons/fa6";

interface JobPerformance {
  title: string;
  applications: number;
  views: number;
}

interface TopPerformingJobsProps {
  jobs: JobPerformance[];
}

export default function TopPerformingJobs({ jobs }: TopPerformingJobsProps) {
  return (
    <Paper withBorder p="md" radius="md">
      <Text fw={600} mb="md">
        Top Performing Jobs
      </Text>
      <Stack gap="sm">
        {jobs.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No job performance data available
          </Text>
        ) : (
          jobs.map((job, index) => (
            <Paper key={index} bg="gray.0" p="sm" radius="sm">
              <Group justify="space-between" align="flex-start">
                <div style={{ flex: 1 }}>
                  <Text fw={500} lineClamp={1}>
                    {job.title}
                  </Text>
                  <Group gap="lg" mt="xs">
                    <Group gap="xs">
                      <FaUser size="0.8rem" color="#26366F" />
                      <Text size="sm" c="dimmed">
                        {job.applications} applications
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <FaEye size="0.8rem" color="#4968D5" />
                      <Text size="sm" c="dimmed">
                        {job.views} views
                      </Text>
                    </Group>
                  </Group>
                </div>
                <Badge
                  color={index === 0 ? "yellow" : index === 1 ? "gray" : "orange"}
                  variant="light"
                >
                  #{index + 1}
                </Badge>
              </Group>
            </Paper>
          ))
        )}
      </Stack>
    </Paper>
  );
}