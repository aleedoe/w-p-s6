import React from "react";
// import {
//   Navbar,
//   NavbarBrand,
//   NavbarContent,
//   NavbarItem,
//   Link,
//   Badge,
//   Dropdown,
//   DropdownTrigger,
//   DropdownMenu,
//   DropdownItem,
//   Button,
//   Avatar,
// } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useLocation } from "react-router-dom";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Avatar } from "@heroui/avatar";

import { useSocket } from "../contexts/socket-context";
import { useAuth } from "../contexts/auth-context";

import Sidebar from "@/components/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const location = useLocation();
  // const history = useHistory();

  const getPageTitle = () => {
    const path = location.pathname;

    if (path.includes("/dashboard")) return "Dashboard";
    if (path.includes("/products")) return "Product Management";
    if (path.includes("/orders")) return "Order Requests";
    if (path.includes("/shipping")) return "Shipping Management";
    if (path.includes("/returns")) return "Return Requests";

    return "Admin Dashboard";
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navbar */}
        <Navbar className="border-b border-divider" maxWidth="full">
          <NavbarBrand>
            <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
          </NavbarBrand>

          <NavbarContent className="gap-4" justify="end">
            <NavbarItem>
              <Badge
                isDot
                color={connected ? "success" : "danger"}
                content=""
                placement="bottom-right"
                size="sm"
              >
                <div className="flex items-center gap-2">
                  <Icon className="text-default-500" icon="lucide:signal" />
                  <span className="text-sm text-default-500 hidden sm:inline">
                    {connected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </Badge>
            </NavbarItem>

            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  className="text-default-500"
                  radius="full"
                  variant="light"
                >
                  <Icon icon="lucide:bell" width={20} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Notifications">
                <DropdownItem key="notifications" className="h-14 gap-2">
                  <p className="font-bold">Notifications</p>
                  <p className="text-default-500 text-tiny">
                    No new notifications
                  </p>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="primary"
                  name={user?.name || "Admin User"}
                  size="sm"
                  src={user?.avatar || ""}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-bold">{user?.name || "Admin User"}</p>
                  <p className="text-default-500 text-tiny">
                    {user?.email || "admin@example.com"}
                  </p>
                </DropdownItem>
                <DropdownItem key="settings">My Settings</DropdownItem>
                <DropdownItem key="help_and_feedback">
                  Help & Feedback
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={logout}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarContent>
        </Navbar>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
