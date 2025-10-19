import RequireAuth from "@auth-kit/react-router/RequireAuth";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import AuthLayout from "../common/layouts/AuthLayout";
import LoginPage from "../pages/auth/LoginPage";
import AppliedJobDetailsPage from "../pages/dashboard/AppliedJobDetailsPage";
import CompleteProfilePage from "../pages/dashboard/CompleteProfilePage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import JobsPage from "../pages/dashboard/JobsPage";
import MyJobsPage from "../pages/dashboard/MyJobsPage";
import PostedJobDetailsPage from "../pages/dashboard/PostedJobDetailsPage";
import PostJobPage from "../pages/dashboard/PostJobPage";
import ProfilePage from "../pages/dashboard/ProfilePage";
import UsersPage from "../pages/dashboard/BannerPage";
import { NotFound } from "../pages/NotFound";
import DashboardLayout from "../common/layouts/DashboardLayout";
import NotificationCenterPage from "../pages/dashboard/NotificationCenterPage";
import BannerPage from "../pages/dashboard/BannerPage";
export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      
      <Route
        element={
          <RequireAuth fallbackPath={"/signin"}>
            <DashboardLayout />
          </RequireAuth>
        }
        // errorElement={<ServerError />}

      >
        <Route index path="/" element={<DashboardPage />} />
        <Route index path="/jobs" element={<JobsPage />} />
        <Route index path="/jobs/:id" element={<PostedJobDetailsPage />} />
        <Route index path="/complete_profile" element={<CompleteProfilePage />} />
        <Route index path="/post_job" element={<PostJobPage />} />
        <Route index path="/my_jobs" element={<MyJobsPage />} />
        <Route index path="/my_jobs/:id/applied" element={<AppliedJobDetailsPage />} />
        <Route index path="/my_jobs/:id/posted" element={<PostedJobDetailsPage />} />
        <Route index path="/profile" element={<ProfilePage />} />
        <Route index path="/users" element={<UsersPage />} />
        <Route index path="/notification_center" element={<NotificationCenterPage />} />
        <Route index path="/banner" element={<BannerPage />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/signin" element={<LoginPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </>
  ), {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);
