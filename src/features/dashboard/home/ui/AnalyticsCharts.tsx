import { BarChart } from "@mantine/charts";
import { Paper, Stack, Text } from "@mantine/core";
import { ChartData } from "../types";

interface AnalyticsChartsProps {
  jobPostingTrends: ChartData;
  applicationsByMonth: ChartData;
}

export default function AnalyticsCharts({
  jobPostingTrends,
  applicationsByMonth,
}: AnalyticsChartsProps) {
  const jobsChartData = jobPostingTrends.labels.map((label, index) => ({
    month: label,
    jobs: jobPostingTrends.datasets[0].data[index],
  }));

  const applicationsChartData = applicationsByMonth.labels.map((label, index) => ({
    month: label,
    applications: applicationsByMonth.datasets[0].data[index],
  }));

  return (
    <Stack gap="md">
      <Paper withBorder p="md" radius="md">
        <Text fw={600} mb="md">
          Job Posting Trends
        </Text>
        <BarChart
          h={300}
          data={jobsChartData}
          dataKey="month"
          series={[{ name: "jobs", color: "#4968D5" }]}
          tickLine="y"
        />
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Text fw={600} mb="md">
          Applications by Month
        </Text>
        <BarChart
          h={300}
          data={applicationsChartData}
          dataKey="month"
          series={[{ name: "applications", color: "#26366F" }]}
          tickLine="y"
        />
      </Paper>
    </Stack>
  );
}