import { Avatar } from "flowbite-react";
import {
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineUserGroup,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

// Custom hook to fetch active domains count
function useActiveDomainsCount() {
  return useQuery({
    queryKey: ["active-domains-count"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/domains/active-count");
      if (!res.ok) throw new Error("Failed to fetch active domains count");
      const data = await res.json();
      // Expecting { count: number } or similar
      return data.count ?? data.value ?? data;
    },
    refetchOnWindowFocus: false,
  });
}

// Custom hook to fetch expired domains count
function useExpiredDomainsCount() {
  return useQuery({
    queryKey: ["expired-domains-count"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/domains/expired-count");
      if (!res.ok) throw new Error("Failed to fetch expired domains count");
      const data = await res.json();
      return data.count ?? data.value ?? data;
    },
    refetchOnWindowFocus: false,
  });
}

// Custom hook to fetch projects count
function useProjectsCount() {
  return useQuery({
    queryKey: ["projects-count"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/projects-count");
      if (!res.ok) throw new Error("Failed to fetch projects count");
      const data = await res.json();
      return data.count ?? data.value ?? data;
    },
    refetchOnWindowFocus: false,
  });
}

// Custom hook to fetch users count
function useUsersCount() {
  return useQuery({
    queryKey: ["users-count"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/users-count");
      if (!res.ok) throw new Error("Failed to fetch users count");
      const data = await res.json();
      return data.count ?? data.value ?? data;
    },
    refetchOnWindowFocus: false,
  });
}

const recentActivity = [
  {
    id: 1,
    user: "Rahul S.",
    action: "Added new project: Green Valley",
    time: "2 hours ago",
  },
  {
    id: 2,
    user: "Priya K.",
    action: "Renewed domain: homepoint.co.in",
    time: "5 hours ago",
  },
  { id: 3, user: "Admin", action: "Added user: John Doe", time: "1 day ago" },
  {
    id: 4,
    user: "Rahul S.",
    action: "Marked domain as expired: oldsite.com",
    time: "2 days ago",
  },
];

export function SignOut() {
  const navigate = useNavigate();
  useEffect(() => {
    // Clear authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    // Optionally clear other sensitive data here
    // Redirect to login page
    navigate("/", { replace: true });
  }, [navigate]);
  return null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    data: activeCount,
    isLoading: isActiveLoading,
    isError: isActiveError,
  } = useActiveDomainsCount();
  const {
    data: expiredCount,
    isLoading: isExpiredLoading,
    isError: isExpiredError,
  } = useExpiredDomainsCount();
  const {
    data: projectsCount,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = useProjectsCount();
  const {
    data: usersCount,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useUsersCount();

  // Replace stats array with dynamic value for Active Domains
  const stats = [
    {
      id: 1,
      name: "Projects Listed",
      value: isProjectsLoading ? null : isProjectsError ? "-" : projectsCount,
      icon: <HiOutlineClipboardList className="h-7 w-7 text-blue-600" />,
      change: 4.2,
      changeType: "up",
      compare: "vs 23 last month",
      route: "/dashboard/lists",
      tooltip: "View all projects",
      isLoading: isProjectsLoading,
      isError: isProjectsError,
    },
    {
      id: 2,
      name: "Active Domains",
      value: isActiveLoading ? null : isActiveError ? "-" : activeCount,
      icon: <HiOutlineCheckCircle className="h-7 w-7 text-emerald-600" />,
      change: 2.1,
      changeType: "up",
      compare: "vs 17 last month",
      route: "/dashboard/domain-list?status=active",
      tooltip: "View active domains",
      isLoading: isActiveLoading,
      isError: isActiveError,
    },
    {
      id: 3,
      name: "Expired Domains",
      value: isExpiredLoading ? null : isExpiredError ? "-" : expiredCount,
      icon: <HiOutlineExclamationCircle className="h-7 w-7 text-red-600" />,
      change: -1.5,
      changeType: "down",
      compare: "vs 7 last month",
      route: "/dashboard/domain-list?status=expired",
      tooltip: "View expired domains",
      isLoading: isExpiredLoading,
      isError: isExpiredError,
    },
    {
      id: 4,
      name: "Users",
      value: isUsersLoading ? null : isUsersError ? "-" : usersCount,
      icon: <HiOutlineUserGroup className="h-7 w-7 text-purple-600" />,
      change: 3.8,
      changeType: "up",
      compare: "vs 108 last month",
      route: "/dashboard/users-management",
      tooltip: "View all users",
      isLoading: isUsersLoading,
      isError: isUsersError,
    },
  ];

  return (
    <div className="min-h-[80vh] bg-white py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Overview of your website’s key metrics and recent activity.
            </p>
          </div>
        </div>
        <hr className="mb-6 text-gray-200" />
        {/* Stat Cards Row */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.id}
              onClick={() => navigate(stat.route)}
              tabIndex={0}
              role="button"
              aria-label={stat.tooltip}
              className="flex w-full cursor-pointer flex-col items-start rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus:ring-2 focus:ring-blue-400 active:scale-100"
            >
              <div className="mb-2 flex items-center gap-2">
                {stat.icon}
                <span className="text-sm font-medium text-gray-500">
                  {stat.name}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {/* Show loading spinner for Active Domains only */}
                  {stat.isLoading ? (
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent align-middle"></span>
                  ) : (
                    stat.value
                  )}
                </span>
                <span
                  className={`flex items-center rounded px-2 py-0.5 text-xs font-semibold ${
                    stat.changeType === "up"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {stat.changeType === "up" ? (
                    <HiOutlineArrowUp className="mr-0.5 h-4 w-4" />
                  ) : (
                    <HiOutlineArrowDown className="mr-0.5 h-4 w-4" />
                  )}
                  {Math.abs(stat.change)}%
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-400">
                <span>{stat.compare}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Recent Activity Section */}
        <div className="rounded-lg bg-gray-50 p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
          <ul className="divide-y divide-gray-200">
            {recentActivity.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3">
                <Avatar
                  rounded
                  size="sm"
                  className="bg-blue-100 text-blue-700"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-800">{item.user}</span>{" "}
                  <span className="text-gray-600">{item.action}</span>
                  <div className="text-xs text-gray-400">{item.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
