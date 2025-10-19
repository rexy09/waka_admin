import { notifications } from "@mantine/notifications";
import { AxiosError } from "axios";
// import { useTranslation } from "react-i18next";
import { UseFormReturnType } from "@mantine/form";

interface ErrorResponse {
  error?: string;
  detail?: string;
  message?: string;
  non_field_errors?: string[];
  errors?: Record<string, string[]>;
  [key: string]: any;
}

interface FormErrorHandlerOptions {
  title?: string;
  fallbackMessage?: string;
  showNotificationForNonFieldErrors?: boolean;
  customErrorMap?: Record<string, string>;
}

export function useFormErrorHandler() {
  // const { t } = useTranslation();

  /**
   * Handle API errors and map them to form field errors
   * @param error - Axios error or generic error
   * @param form - Mantine form instance
   * @param options - Configuration options
   */
  const handleFormError = <T extends Record<string, any>>(
    error: AxiosError<ErrorResponse> | Error,
    form: UseFormReturnType<T>,
    options: FormErrorHandlerOptions = {}
  ) => {
    const {
      title = ("Error"),
      fallbackMessage = ("Something went wrong!"),
      showNotificationForNonFieldErrors = true,
      customErrorMap = {},
    } = options;

    // Handle Axios errors with response data
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const responseData = axiosError.response?.data;
      const statusCode = axiosError.response?.status;

      // Check for 400 Bad Request (validation errors)
      if (
        statusCode === 400 &&
        responseData &&
        typeof responseData === "object"
      ) {
        const formErrors: Record<string, string> = {};
        const nonFieldMessages: string[] = [];

        // Handle new structure: { "message": "Validation failed", "errors": { "field": ["error"] } }
        if (responseData.errors && typeof responseData.errors === "object") {
          Object.keys(responseData.errors).forEach((key) => {
            const errorValue = responseData.errors![key];

            // Check if the key matches a form field
            if (form.values.hasOwnProperty(key)) {
              const errorMessage = Array.isArray(errorValue)
                ? errorValue.join(", ")
                : typeof errorValue === "string"
                ? errorValue
                : JSON.stringify(errorValue);

              formErrors[key] = errorMessage;
            } else {
              const errorMessage = Array.isArray(errorValue)
                ? errorValue.join(", ")
                : typeof errorValue === "string"
                ? errorValue
                : "";

              if (errorMessage) {
                nonFieldMessages.push(errorMessage);
              }
            }
          });

          // Add the general message if provided
          if (responseData.message && typeof responseData.message === "string") {
            // Only add to non-field messages if there are no field-specific errors
            if (Object.keys(formErrors).length === 0) {
              nonFieldMessages.push(responseData.message);
            }
          }
        } else {
          // Handle old structure: direct field errors in response root
          Object.keys(responseData).forEach((key) => {
            const errorValue = responseData[key];

            // Skip metadata keys
            if (["error", "detail", "message", "non_field_errors"].includes(key)) {
              return;
            }

            // Check if the key matches a form field
            if (form.values.hasOwnProperty(key)) {
              // Map the error to the corresponding form field
              const errorMessage = Array.isArray(errorValue)
                ? errorValue.join(", ")
                : typeof errorValue === "string"
                ? errorValue
                : JSON.stringify(errorValue);

              formErrors[key] = errorMessage;
            } else {
              // Collect non-field errors
              const errorMessage = Array.isArray(errorValue)
                ? errorValue.join(", ")
                : typeof errorValue === "string"
                ? errorValue
                : "";

              if (errorMessage) {
                nonFieldMessages.push(errorMessage);
              }
            }
          });
        }

        // Set form field errors
        if (Object.keys(formErrors).length > 0) {
          form.setErrors(formErrors);
        }

        // Show notification for non-field errors
        if (nonFieldMessages.length > 0 && showNotificationForNonFieldErrors) {
          notifications.show({
            color: "red",
            title,
            message: nonFieldMessages.join("; "),
          });
        } else if (Object.keys(formErrors).length === 0) {
          // No field errors were mapped, show general error
          notifications.show({
            color: "red",
            title,
            message: fallbackMessage,
          });
        }

        return;
      }

      // Handle other status codes with custom error map
      if (statusCode && customErrorMap[statusCode.toString()]) {
        notifications.show({
          color: "red",
          title,
          message: customErrorMap[statusCode.toString()],
        });
        return;
      }

      // Handle other error response formats
      if (responseData) {
        let message = fallbackMessage;

        if (responseData.error && typeof responseData.error === "string") {
          message = responseData.error;
        } else if (
          responseData.detail &&
          typeof responseData.detail === "string"
        ) {
          message = responseData.detail;
        } else if (
          responseData.non_field_errors &&
          Array.isArray(responseData.non_field_errors)
        ) {
          message = responseData.non_field_errors.join(", ");
        }

        notifications.show({
          color: "red",
          title,
          message,
        });
        return;
      }
    }

    // Handle generic Error objects
    if (error && typeof error === "object" && "message" in error) {
      notifications.show({
        color: "red",
        title,
        message: error.message || fallbackMessage,
      });
      return;
    }

    // Fallback error notification
    notifications.show({
      color: "red",
      title,
      message: fallbackMessage,
    });
  };

  /**
   * Create a standardized form error handler with predefined options
   * @param options - Configuration options
   * @returns Error handler function
   */
  const createFormErrorHandler = <T extends Record<string, any>>(
    form: UseFormReturnType<T>,
    options: FormErrorHandlerOptions = {}
  ) => {
    return (error: AxiosError<ErrorResponse> | Error) => {
      handleFormError(error, form, options);
    };
  };

  return {
    handleFormError,
    createFormErrorHandler,
  };
}
