import {
  Box,
  Card,
  Center,
  Group,
  Loader,
  ScrollArea,
  Select,
  Table,
  Text,
  ActionIcon,
} from "@mantine/core";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { Color } from "../../theme";
import "./table.css";

interface TableProps {
  columns: React.ReactNode;
  summary?: JSX.Element;
  rows: JSX.Element[];
  title?: string;
  subtitle?: string;
  colSpan: number;
  totalData: number;
  isLoading: boolean;
  showPagination?: boolean;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onPageSizeChange?: (size: number) => void;
  currentPageSize?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  currentRange?: { start: number; end: number };
}

export function CustomTable({
  rows,
  columns,
  colSpan,
  isLoading,
  totalData,
  showPagination,
  title,
  subtitle,
  summary,
  onNextPage,
  onPreviousPage,
  onPageSizeChange,
  currentPageSize = 50,
  hasNextPage = false,
  hasPreviousPage = false,
  currentRange = { start: 1, end: 1 },
}: TableProps) {

  return (
    <Card
      radius="md"
      p={0}
      withBorder
      style={{ border: `1px solid ${Color.Border}` }}
    >
      {(title != null || subtitle != null || summary != null) && (
        <Box p={"lg"}>
          <Group justify="space-between">
            <Group>
              {/* <div
                style={{
                  border: "1px solid #292D3214",
                  borderRadius: "8px",
                  padding: 10,
                  width: "40px",
                  height: "40px",
                }}
              >
                {Icons.box2}
              </div> */}
              <div>
                <Text fz="18px" fw={500} c={Color.TextTitle}>
                  {title}
                </Text>
                <Text fz="14px" fw={500} c={"#13131399"}>
                  {subtitle}
                </Text>
              </div>
            </Group>
            <Group>{summary}</Group>
          </Group>
        </Box>
      )}
      <ScrollArea
        p={"10px"}
        style={{
          background: "#ffffff",
          borderRadius: "7px",
        }}
      >
        <Table.ScrollContainer minWidth={800}>
          <Table verticalSpacing="sm" fz="xs">
            <Table.Thead>{columns}</Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={colSpan}>
                    <Center maw={400} h={100} mx="auto">
                      <Loader variant="dots" />
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={colSpan}>
                    <Text fw={400} ta="center">
                      Nothing found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
          {/* </div> */}
        </Table.ScrollContainer>
        {showPagination ? (
          <Group justify="space-between" p="md" style={{ borderTop: `1px solid ${Color.Border}` }}>
            <Group gap="md">
              <Group gap="xs">
                <Text size="sm" c="dimmed">Rows per page:</Text>
                <Select
                  size="xs"
                  w={70}
                  data={["20","50", "100", "250"]}
                  value={currentPageSize.toString()}
                  onChange={(value) => onPageSizeChange?.(Number(value))}
                  allowDeselect={false}
                />
              </Group>
              <Text size="sm" c="dimmed">
                {currentRange.start} - {currentRange.end} of {totalData}
              </Text>
            </Group>
            <Group gap="xs">
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={onPreviousPage}
                disabled={!hasPreviousPage}
                size="md"
              >
                <MdNavigateBefore size={20} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={onNextPage}
                disabled={!hasNextPage}
                size="md"
              >
                <MdNavigateNext size={20} />
              </ActionIcon>
            </Group>
          </Group>
        ) : null}
      </ScrollArea>
    </Card>
  );
}
