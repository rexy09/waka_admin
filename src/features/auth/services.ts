import { useState } from "react";

export default function useAuthServices() {
  const [submitted, setSubmitted] = useState<boolean>(false);

  return {
    submitted,
    setSubmitted,
  };
}
