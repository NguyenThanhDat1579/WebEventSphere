// Argon Dashboard 2 MUI layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import VirtualReality from "layouts/virtual-reality";
import RTL from "layouts/rtl";
import Profile from "layouts/profile";
import ProfileAdmin from "layouts/profile/admin/ProfileAdmin";
import ProfileOrganizer from "layouts/profile/organizer/ProfileOrganizer";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import AdminDashboard from "layouts/dashboard/admin/AdminDashboard";
import EventManagement from "layouts/dashboard/admin/EventManagement";
import RevenueAndReporting from "layouts/dashboard/admin/RevenueAndReporting";
import OrganizerDashboard from "layouts/dashboard/organizer/OrganizerDashboard";
import OrganizerMyEvent from "layouts/dashboard/organizer/OrganizerMyEvent";
import OrganizerRevenue from "layouts/dashboard/organizer/OrganizerRevenue";
import OrganizerCreateNewEvent from "layouts/dashboard/organizer/OrganizerCreateNewEvent/OrganizerCreateNewEvent";
import OrganizerTicketsAndAttendees from "layouts/dashboard/organizer/OrganizerTicketsAndAttendees";
import UserManagement from "layouts/tables/admin/UserManagement";
import OrganizerManagement from "layouts/tables/admin/OrganizerManagement";
import ForgetPasswordOrganizers from "layouts/authentication/forgotPassword/ForgetPasswordOrganizer";
import OtpForgetPasswordOrganizer from "layouts/authentication/forgotPassword/OtpForgetPasswordOrganizer";
import ResetPasswordOrganizer from "layouts/authentication/forgotPassword/ResetPasswordOrganizer";
import ArgonBox from "components/ArgonBox";
import OtpOrganizerVerification from "layouts/authentication/forgotPassword/OtpOrganizerVerification";
import WelcomePage from "layouts/welcome/WelcomePage";
const routes = [
    {
    type: "route",
    name: "Welcome",
    key: "welcome",
    route: "/welcome",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-world" />,
    component: <WelcomePage />,
    hidden: true, // Ẩn khỏi menu
  },
  {
    type: "route",
    name: "Dashboard",
    key: "dashboard",
    route: "/dashboard",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-tv-2" />,
    component: <Dashboard />,
    hidden: true,
  },
  {
    type: "route",
    name: "Tổng quan",
    key: "admin-dashboard",
    route: "/dashboard-admin",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-tv-2" />,
    component: <AdminDashboard />,
    allowedRoles: [1],
  },
  {
    type: "route",
    name: "Quản lý người dùng",
    key: "admin-usermanagement",
    route: "/usermanagement-admin",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-tv-2" />,
    component: <UserManagement />,
    allowedRoles: [1],
  },
  {
    type: "route",
    name: "Quản lý nhà tổ chức",
    key: "admin-organizermanagement",
    route: "/organizermanagement-admin",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-tv-2" />,
    component: <OrganizerManagement />,
    allowedRoles: [1],
  },
  {
    type: "route",
    name: "Quản lý sự kiện",
    key: "admin-eventmanagement",
    route: "/eventmanagement-admin",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-tv-2" />,
    component: <EventManagement />,
    allowedRoles: [1],
  },
  {
    type: "route",
    name: "Doanh thu & Báo cáo",
    key: "admin-revenueandreporting",
    route: "/revenueandreporting-admin",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-tv-2" />,
    component: <RevenueAndReporting />,
    allowedRoles: [1],
  },

  {
    type: "route",
    name: "Tổng quan",
    key: "organizer-dashboard",
    route: "/dashboard-organizer",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-tv-2" />,
    component: <OrganizerDashboard />,
    allowedRoles: [2],
  },
  {
    type: "route",
    name: "Sự kiện của tôi",
    key: "organizer-myevent",
    route: "/myevent-organizer",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-tv-2" />,
    component: <OrganizerMyEvent />,
    allowedRoles: [2],
  },

  {
    type: "route",
    name: "Tạo sự kiện",
    key: "organizer-createnewevent",
    route: "/createnewevent-organizer",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-tv-2" />,
    component: <OrganizerCreateNewEvent />,
    allowedRoles: [2],
  },
  {
    type: "route",
    name: "Vé & Người tham dự",
    key: "organizer-ticketsandattendees",
    route: "/ticketsandattendees-organizer",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-tv-2" />,
    component: <OrganizerTicketsAndAttendees />,
    allowedRoles: [2],
  },

  {
    type: "route",
    name: "Doanh thu",
    key: "organizer-revenue",
    route: "/revenue-organizer/:eventId/:eventTitle",
    icon: <ArgonBox component="i" color="primary" fontSize="14px" className="ni ni-tv-2" />,
    component: <OrganizerRevenue />,
    allowedRoles: [2],
  },

  {
    type: "route",
    name: "Tables",
    key: "tables",
    route: "/tables",
    icon: (
      <ArgonBox component="i" color="warning" fontSize="14px" className="ni ni-calendar-grid-58" />
    ),
    component: <Tables />,
    hidden: true,
  },
  {
    type: "route",
    name: "Billing",
    key: "billing",
    route: "/billing",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="ni ni-credit-card" />,
    component: <Billing />,
    hidden: true,
  },
  // {
  //   type: "route",
  //   name: "Virtual Reality",
  //   key: "virtual-reality",
  //   route: "/virtual-reality",
  //   icon: <ArgonBox component="i" color="info" fontSize="14px" className="ni ni-app" />,
  //   component: <VirtualReality />,
  // },
  // {
  //   type: "route",
  //   name: "RTL",
  //   key: "rtl",
  //   route: "/rtl",
  //   icon: <ArgonBox component="i" color="error" fontSize="14px" className="ni ni-world-2" />,
  //   component: <RTL />,
  // },
  { type: "title", title: "Cài đặt", key: "account-pages" },
  {
    type: "route",
    name: "Profile",
    key: "profile",
    route: "/profile",
    icon: <ArgonBox component="i" color="dark" fontSize="14px" className="ni ni-single-02" />,
    component: <Profile />,
    hidden: true,
  },
  {
    type: "route",
    name: "Thông tin của bạn",
    key: "admin-profile",
    route: "/profile-admin",
    icon: <ArgonBox component="i" color="dark" fontSize="14px" className="ni ni-single-02" />,
    component: <ProfileAdmin />,
    allowedRoles: [1],
     hidden: true,
  },
  {
    type: "route",
    name: "Thông tin của bạn",
    key: "organizer-profile",
    route: "/profile-organizer",
    icon: <ArgonBox component="i" color="dark" fontSize="14px" className="ni ni-single-02" />,
    component: <ProfileOrganizer />,
    allowedRoles: [2],
  },
  {
    type: "route",
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    icon: (
      <ArgonBox component="i" color="warning" fontSize="14px" className="ni ni-single-copy-04" />
    ),
    component: <SignIn />,
    hidden: true,
  },
  {
    type: "route",
    name: "Sign Up",
    key: "sign-up",
    route: "/authentication/sign-up",
    icon: <ArgonBox component="i" color="info" fontSize="14px" className="ni ni-collection" />,
    component: <SignUp />,
    hidden: true,
  },
{
  type: "route",
  name: "Quên mật khẩu",
  key: "forget-password-organizer",
  route: "/authentication/forget-password",
  icon: <ArgonBox component="i" color="warning" fontSize="14px" className="ni ni-lock-circle-open" />,
  component: <ForgetPasswordOrganizers />,
  hidden: true,
},

{
  type: "route",
  name: "OTP Quên mật khẩu",
  key: "otp-forget-password-organizer",
  route: "/authentication/otp-forget-password",
  icon: <ArgonBox component="i" color="info" fontSize="14px" className="ni ni-key-25" />,
  component: <OtpForgetPasswordOrganizer />,
  hidden: true,
},
{
  type: "route",
  name: "Đặt lại mật khẩu",
  key: "reset-password-organizer",
  route: "/authentication/reset-password",
  icon: <ArgonBox component="i" color="success" fontSize="14px" className="ni ni-settings-gear-65" />,
  component: <ResetPasswordOrganizer />,
  hidden: true,
},

{
  type: "route",
  name: "Xác thực OTP",
  key: "otp-forget-password",
  route: "/authentication/verify-otp-organizer",
  icon: (
    <ArgonBox
      component="i"
      color="info"
      fontSize="14px"
      className="ni ni-check-bold"
    />
  ),
  component: <OtpOrganizerVerification />,
  hidden: true, // ✅ Ẩn khỏi menu, chỉ điều hướng bằng navigate
},


];

export default routes;
