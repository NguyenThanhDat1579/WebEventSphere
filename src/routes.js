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
import OrganizerCreateNewEvent from "layouts/dashboard/organizer/OrganizerCreateNewEvent";
import OrganizerTicketsAndAttendees from "layouts/dashboard/organizer/OrganizerTicketsAndAttendees";
import UserManagement from "layouts/tables/admin/UserManagement";
import OrganizerManagement from "layouts/tables/admin/OrganizerManagement";
// Argon Dashboard 2 MUI components
import ArgonBox from "components/ArgonBox";

const routes = [
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
    name: "Admin Dashboard",
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
    name: "Organizer Dashboard",
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
    name: "Vé & người tham dự",
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
    route: "/revenue-organizer",
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
  },
  {
    type: "route",
    name: "Billing",
    key: "billing",
    route: "/billing",
    icon: <ArgonBox component="i" color="success" fontSize="14px" className="ni ni-credit-card" />,
    component: <Billing />,
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
  { type: "title", title: "Account Pages", key: "account-pages" },
  {
    type: "route",
    name: "Profile",
    key: "profile",
    route: "/profile",
    icon: <ArgonBox component="i" color="dark" fontSize="14px" className="ni ni-single-02" />,
    component: <Profile />,
  },
  {
    type: "route",
    name: "Admin Settings",
    key: "admin-profile",
    route: "/profile-admin",
    icon: <ArgonBox component="i" color="dark" fontSize="14px" className="ni ni-single-02" />,
    component: <ProfileAdmin />,
    allowedRoles: [1],
  },
  {
    type: "route",
    name: "Organizer Settings",
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
];

export default routes;
