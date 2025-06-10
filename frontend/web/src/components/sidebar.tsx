import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/button";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      icon: "lucide:layout-dashboard",
      path: "/admin/dashboard",
    },
    {
      name: "Products",
      icon: "lucide:package",
      path: "/admin/products",
    },
    {
      name: "Orders",
      icon: "lucide:shopping-cart",
      path: "/admin/orders",
    },
    {
      name: "Shipping",
      icon: "lucide:truck",
      path: "/admin/shipping",
    },
    {
      name: "Returns",
      icon: "lucide:rotate-ccw",
      path: "/admin/returns",
    },
  ];

  return (
    <aside
      className={`bg-content1 border-r border-divider transition-all duration-300 flex flex-col ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-divider">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Icon className="text-primary" icon="lucide:zap" width={24} />
            <span className="font-bold text-lg">ElectroAdmin</span>
          </div>
        )}
        <Button
          isIconOnly
          className={collapsed ? "mx-auto" : ""}
          radius="full"
          size="sm"
          variant="light"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Icon
            icon={collapsed ? "lucide:chevron-right" : "lucide:chevron-left"}
            width={18}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link to={item.path}>
                <Button
                  className={`w-full justify-start ${
                    location.pathname === item.path ? "sidebar-active" : ""
                  }`}
                  startContent={<Icon icon={item.icon} width={20} />}
                  variant="light"
                >
                  {!collapsed && item.name}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-divider">
        <Button
          className="w-full justify-start"
          startContent={<Icon icon="lucide:settings" width={20} />}
          variant="light"
        >
          {!collapsed && "Settings"}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
