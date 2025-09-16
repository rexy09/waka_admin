import { Badge, Group, Paper, Stack, Text } from "@mantine/core";

interface JobPerformance {
  title: string;
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