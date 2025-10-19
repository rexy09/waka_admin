import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

interface ErrorResponse {
  error?: string;
  detail?: string;
  non_field_errors?: string[];
  [key: string]: any;
}

interface ErrorNotificationOptions {
  title?: string;
  fallbackMessage?: string;
  showFieldErrors?: boolean;
  customErrorMap?: Record<string, string>;
}

export function useErrorNotification() {
  const { t } = useTranslation();

  const showErrorNotification = (
    error: AxiosError<ErrorResponse> | Error,
    options: ErrorNotificationOptions = {}
  ) => {
    const {
      title = t("Error"),
      fallbackMessage = t("Something went wrong!"),
      showFieldErrors = true,
      customErrorMap = {},
    } = options;

    let message = fallbackMessage;

    // Handle Axios errors with response data
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const responseData = axiosError.response?.data;

      if (responseData) {
        // Priority 1: Custom error mappings
        const statusCode = axiosError.response?.status;
        const customKey = `${statusCode}` || "default";
        if (customErrorMap[customKey]) {
          message = customErrorMap[customKey];
        }
        // Priority 2: Specific error field (string)
        else if (responseData.error && typeof responseData.error === "string") {
          message = responseData.error;
        }
        // Priority 3: Detail field (string)
        else if (responseData.detail && typeof responseData.detail === "string") {
          message = responseData.detail;
        }
        // Priority 4: Non-field errors (array)
        else if (responseData.non_field_errors && Array.isArray(responseData.non_field_errors)) {
          message = responseData.non_field_errors.join(", ");
        }
        // Priority 5: Field validation errors (object)
        else if (showFieldErrors && typeof responseData === "object") {
          const errorMessages: string[] = [];

          Object.keys(responseData).forEach((field) => {
            const fieldErrors = responseData[field];
            if (Array.isArray(fieldErrors)) {
              const fieldName = field === "non_field_errors" ? "" : `${field}: `;
              errorMessages.push(`${fieldName}${fieldErrors.join(", ")}`);
            } else if (typeof fieldErrors === "string") {
              const fieldName = field === "non_field_errors" ? "" : `${field}: `;
              errorMessages.push(`${fieldName}${fieldErrors}`);
            }
          });

          if (errorMessages.length > 0) {
            message = errorMessages.join("; ");
          }
        }
      }
    }
    // Handle generic Error objects
    else if (error && typeof error === "object" && "message" in error) {
      message = error.message || fallbackMessage;
    }

    // Show the notification
    notifications.show({
      color: "red",
      title,
      message,
    });
  };

  // Wrapper function for common API error handling
  const handleApiError = (
    error: AxiosError<ErrorResponse> | Error,
    customMessage?: string
  ) => {
    showErrorNotification(error, {
      fallbackMessage: customMessage || t("Something went wrong!"),
    });
  };

  // Function to create a standardized catch handler
  const createErrorHandler = (
    options: ErrorNotificationOptions = {}
  ) => {
    return (error: AxiosError<ErrorResponse> | Error) => {
      showErrorNotification(error, options);
    };
  };

  return {
    showErrorNotification,
    handleApiError,
    createErrorHandler,
  };
}