import { Button, Grid, Group, Select, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useState, useEffect, useCallback } from "react";
import { UserFilterParameters, UserFilterOptions } from "../types";

interface UserFiltersProps {
  onFiltersChange: (filters: UserFilterParameters) => void;
  filterOptions: UserFilterOptions;
  isLoading?: boolean;
}

export default function UserFilters({ onFiltersChange, filterOptions, isLoading }: UserFiltersProps) {
  const [filters, setFilters] = useState<UserFilterParameters>({ isProduction: "both", isVerified: "both" });
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Debounce search term updates
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilter("searchTerm", searchTerm);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const updateFilter = useCallback((key: keyof UserFilterParameters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const clearFilters = () => {
    const emptyFilters = { isProduction: "both" as const, isVerified: "both" as const };
    setFilters(emptyFilters);
    setSearchTerm(""); // Clear search term as well
    onFiltersChange(emptyFilters);
  };

  return (
    <Grid gutter="md" mb="md">
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <TextInput
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading}
          size="sm"
        />
      </Grid.Col>

      {/* <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
        <Select
          placeholder="Role"
          data={filterOptions.roles.map(role => ({ value: role, label: role.charAt(0).toUpperCase() + role.slice(1) }))}
          value={filters.role || null}
          onChange={(value) => updateFilter("role", value)}
          clearable
          disabled={isLoading}
          size="sm"
        />
      </Grid.Col> */}

      <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
        <Select
          placeholder="User Type"
          data={filterOptions.userTypes.map(userType => ({ value: userType, label: userType.charAt(0).toUpperCase() + userType.slice(1) }))}
          value={filters.userType || null}
          onChange={(value) => updateFilter("userType", value)}
          clearable
          disabled={isLoading}
          size="sm"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
        <Select
          placeholder="Status"
          data={filterOptions.statuses.map(status => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) }))}
          value={filters.status || null}
          onChange={(value) => updateFilter("status", value)}
          clearable
          disabled={isLoading}
          size="sm"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
        <Select
          placeholder="Country"
          data={filterOptions.countries.map(country => ({ value: country.name, label: country.name }))}
          value={filters.country || null}
          onChange={(value) => updateFilter("country", value)}
          clearable
          disabled={isLoading}
          size="sm"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
        <Select
          placeholder="Verification"
          data={[
            { value: "both", label: "All" },
            { value: "true", label: "Verified" },
            { value: "false", label: "Unverified" }
          ]}
          value={filters.isVerified === "both" ? "both" : filters.isVerified?.toString() || null}
          onChange={(value) => {
            if (value === "both") {
              updateFilter("isVerified", "both");
            } else if (value === "true") {
              updateFilter("isVerified", true);
            } else if (value === "false") {
              updateFilter("isVerified", false);
            } else {
              updateFilter("isVerified", undefined);
            }
          }}
          disabled={isLoading}
          size="sm"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
        <Select
        size="sm"
          placeholder="Environment"
          data={[
            { value: "both", label: "All" },
            { value: "true", label: "Production" },
            { value: "false", label: "Staging" }
          ]}
          value={filters.isProduction === "both" ? "both" : filters.isProduction?.toString() || null}
          onChange={(value) => {
            if (value === "both") {
              updateFilter("isProduction", "both");
            } else if (value === "true") {
              updateFilter("isProduction", true);
            } else if (value === "false") {
              updateFilter("isProduction", false);
            } else {
              updateFilter("isProduction", undefined);
            }
          }}
          disabled={isLoading}
        />
      </Grid.Col>

      

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <DateInput
          placeholder="Date From"
          value={filters.dateFrom ? new Date(filters.dateFrom) : null}
          onChange={(value) => {
            if (value) {
              // Get date in local timezone to avoid timezone shift
              const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
              updateFilter("dateFrom", localDate.toISOString().split('T')[0]);
            } else {
              updateFilter("dateFrom", undefined);
            }
          }}
          disabled={isLoading}
          clearable
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <DateInput
          placeholder="Date To"
          value={filters.dateTo ? new Date(filters.dateTo) : null}
          onChange={(value) => {
            if (value) {
              // Get date in local timezone to avoid timezone shift
              const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
              updateFilter("dateTo", localDate.toISOString().split('T')[0]);
            } else {
              updateFilter("dateTo", undefined);
            }
          }}
          disabled={isLoading}
          clearable
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
        <Group>
          <Button variant="outline" onClick={clearFilters} size="sm" disabled={isLoading}>
            Clear Filters
          </Button>
        </Group>
      </Grid.Col>
    </Grid>
  );
}