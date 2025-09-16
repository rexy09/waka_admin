import { Paper, Text, Group, RingProgress, Center } from "@mantine/core";
import { Icons } from "../../../../common/icons";

interface StatisticsCardProps {
  title: string;
  value: number | string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export default function StatisticsCard({
  title,
  value,
  color,
  trend,
  icon,
}: StatisticsCardProps) {
  const trendIcon = trend?.isPositive ? Icons.arrow_up : Icons.arrow_down;

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between">
        <div>
          <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
            {title}
          </Text>
          <Text fw={700} fz="xl">
            {typeof value === "number" ? value.toLocaleString() : value}
          </Text>
          {trend && (
            <Group gap="xs" mt={5}>
              {trendIcon}
              <Text
                c={trend.isPositive ? "teal" : "red"}
                fz="sm"
                fw={500}
              >
                {trend.value}%
              </Text>
            </Group>
          )}
        </div>
        {icon && (
          <Center>
            <RingProgress
              size={80}
              roundCaps
              thickness={8}
              sections={[{ value: 100, color: color }]}
              label={
                <Center>
                  <div style={{ color }}>{icon}</div>
                </Center>
              }
            />
          </Center>
        )}
      </Group>
    </Paper>
  );
}