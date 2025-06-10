import React from "react";
// import { Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";

import { getDashboardStats } from "../../services/api";

import StatsCard from "@/components/stats-card";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  activeShipments: number;
  pendingReturns: number;
  recentOrders: any[];
  recentReturns: any[];
  productStats: {
    lowStock: number;
    outOfStock: number;
  };
  orderStats: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();

        setStats(response.data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card>
          <CardBody className="flex flex-col items-center gap-4 p-6">
            <Icon
              className="text-danger"
              icon="lucide:alert-circle"
              width={48}
            />
            <p className="text-center text-danger">{error}</p>
            <button
              className="text-primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Use mock data if stats is null (for development)
  const data = stats || {
    totalProducts: 1245,
    totalOrders: 68,
    activeShipments: 42,
    pendingReturns: 7,
    recentOrders: [],
    recentReturns: [],
    productStats: {
      lowStock: 15,
      outOfStock: 3,
    },
    orderStats: {
      pending: 24,
      approved: 38,
      rejected: 6,
    },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          change={2.5}
          changeLabel="from last month"
          color="primary"
          icon="lucide:package"
          title="Total Products"
          value={data.totalProducts}
        />
        <StatsCard
          change={5.2}
          changeLabel="from last month"
          color="secondary"
          icon="lucide:shopping-cart"
          title="Order Requests"
          value={data.totalOrders}
        />
        <StatsCard
          change={-1.8}
          changeLabel="from last month"
          color="success"
          icon="lucide:truck"
          title="Active Shipments"
          value={data.activeShipments}
        />
        <StatsCard
          change={12.3}
          changeLabel="from last month"
          color="warning"
          icon="lucide:rotate-ccw"
          title="Pending Returns"
          value={data.pendingReturns}
        />
      </div>

      {/* Product Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex gap-3 pb-2">
            <Icon icon="lucide:package" width={24} />
            <div className="flex flex-col">
              <p className="text-md font-semibold">Inventory Status</p>
              <p className="text-small text-default-500">
                Product stock overview
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-danger-50 border border-danger-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-danger-600 text-sm">Out of Stock</p>
                    <p className="text-2xl font-semibold text-danger">
                      {data.productStats.outOfStock}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-danger-100">
                    <Icon
                      className="text-danger"
                      icon="lucide:alert-triangle"
                      width={20}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-warning-50 border border-warning-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-warning-600 text-sm">Low Stock</p>
                    <p className="text-2xl font-semibold text-warning">
                      {data.productStats.lowStock}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-warning-100">
                    <Icon
                      className="text-warning"
                      icon="lucide:alert-circle"
                      width={20}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Order Status */}
        <Card>
          <CardHeader className="flex gap-3 pb-2">
            <Icon icon="lucide:shopping-cart" width={24} />
            <div className="flex flex-col">
              <p className="text-md font-semibold">Order Status</p>
              <p className="text-small text-default-500">
                Current order requests
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-warning-50 border border-warning-100">
                <div className="flex flex-col">
                  <p className="text-warning-600 text-sm">Pending</p>
                  <p className="text-2xl font-semibold text-warning">
                    {data.orderStats.pending}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-success-50 border border-success-100">
                <div className="flex flex-col">
                  <p className="text-success-600 text-sm">Approved</p>
                  <p className="text-2xl font-semibold text-success">
                    {data.orderStats.approved}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-danger-50 border border-danger-100">
                <div className="flex flex-col">
                  <p className="text-danger-600 text-sm">Rejected</p>
                  <p className="text-2xl font-semibold text-danger">
                    {data.orderStats.rejected}
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Activity Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col">
            <p className="text-md font-semibold">Recent Activity</p>
            <p className="text-small text-default-500">
              Latest system activities
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {/* Mock activity items */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary-100 text-primary">
                <Icon icon="lucide:shopping-cart" width={18} />
              </div>
              <div>
                <p className="font-medium">New order received</p>
                <p className="text-sm text-default-500">
                  Order #12345 from Reseller XYZ
                </p>
                <p className="text-xs text-default-400 mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-success-100 text-success">
                <Icon icon="lucide:check-circle" width={18} />
              </div>
              <div>
                <p className="font-medium">Order approved</p>
                <p className="text-sm text-default-500">
                  Order #12342 has been approved
                </p>
                <p className="text-xs text-default-400 mt-1">3 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-warning-100 text-warning">
                <Icon icon="lucide:rotate-ccw" width={18} />
              </div>
              <div>
                <p className="font-medium">Return request received</p>
                <p className="text-sm text-default-500">
                  Return #R789 from Reseller ABC
                </p>
                <p className="text-xs text-default-400 mt-1">5 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary-100 text-primary">
                <Icon icon="lucide:truck" width={18} />
              </div>
              <div>
                <p className="font-medium">Shipment updated</p>
                <p className="text-sm text-default-500">
                  Shipment #SH456 status changed to &quot;In Transit&quot;
                </p>
                <p className="text-xs text-default-400 mt-1">Yesterday</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;
