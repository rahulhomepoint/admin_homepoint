import { Badge } from "flowbite-react";
import React, { useEffect, useState } from "react";

const statusColors = {
  EXPIRED: "failure",
  SUSPENDED: "warning",
  ACTIVE: "success",
  EXPIRING: "pink",
  // fallback for unknown
  default: "bg-gray-100 text-gray-800 border border-gray-300",
};

function isExpiringSoon(expireDate) {
  if (!expireDate) return false;
  const now = new Date();
  const exp = new Date(expireDate);
  const diff = (exp - now) / (1000 * 60 * 60 * 24);
  return diff <= 15 && diff >= 0;
}

export default function AllDomain() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/domains")
      .then((res) => res.json())
      .then((data) => {
        setDomains(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch domains");
        setLoading(false);
      });
  }, []);

  // Get all unique keys from the domains array for table headers, filter out securityLock, whoisPrivacy, notLocal, and created date
  let allKeys = Array.from(
    domains.reduce((keys, domain) => {
      Object.keys(domain).forEach((k) => keys.add(k));
      return keys;
    }, new Set()),
  );
  allKeys = allKeys.filter(
    (key) =>
      key !== "securityLock" &&
      key !== "whoisPrivacy" &&
      key !== "notLocal" &&
      key.toLowerCase() !== "created" &&
      key.toLowerCase() !== "createddate" &&
      key !== "tld",
  );

  // Insert serial number as the first column
  const displayKeys = ["S/N", ...allKeys];

  return (
    <div>
      {" "}
      <div className="">
        <div className="w-full max-w-7xl rounded-xl bg-white p-4 shadow-lg sm:p-8">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Domain List</h1>
          {loading && (
            <div className="text-center text-gray-500">
              <div
                role="status"
                class="max-w-full animate-pulse space-y-4 divide-y divide-gray-200 rounded-sm border border-gray-200 p-4 shadow-sm md:p-6 dark:divide-gray-700 dark:border-gray-700"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="mb-2.5 h-2.5 w-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <div class="h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div class="h-2.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                </div>
                <div class="flex items-center justify-between pt-4">
                  <div>
                    <div class="mb-2.5 h-2.5 w-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <div class="h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div class="h-2.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                </div>
                <div class="flex items-center justify-between pt-4">
                  <div>
                    <div class="mb-2.5 h-2.5 w-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <div class="h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div class="h-2.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                </div>
                <div class="flex items-center justify-between pt-4">
                  <div>
                    <div class="mb-2.5 h-2.5 w-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <div class="h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div class="h-2.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                </div>
                <div class="flex items-center justify-between pt-4">
                  <div>
                    <div class="mb-2.5 h-2.5 w-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <div class="h-2 w-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div class="h-2.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                </div>
                <span class="sr-only">Loading...</span>
              </div>
            </div>
          )}
          {error && <div className="text-center text-red-500">{error}</div>}
          {!loading && !error && (
            <div className="h-[75vh] overflow-x-auto sm:overflow-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm md:text-base">
                <thead>
                  <tr>
                    {displayKeys.map((key) => (
                      <th
                        key={key}
                        className="bg-gray-100 px-2 py-2 text-left font-bold tracking-wider whitespace-nowrap text-gray-600 uppercase sm:px-4"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {domains.map((domain, i) => (
                    <tr key={domain.domain || domain.name || i}>
                      <td className="px-1 py-2 whitespace-nowrap text-gray-900 sm:px-4">
                        {i + 1}
                      </td>
                      {allKeys.map((key) => {
                        // Special badge color and text for expiring soon or expired
                        if (key.toLowerCase().includes("status")) {
                          let badgeClass =
                            statusColors[(domain[key] || "").toUpperCase()] ||
                            statusColors.default;
                          let badgeText = domain[key] || "-";
                          // If expiring soon
                          if (isExpiringSoon(domain.expireDate)) {
                            badgeClass = statusColors.EXPIRING;
                            let daysLeft = null;
                            if (domain.expireDate) {
                              const now = new Date();
                              const exp = new Date(domain.expireDate);
                              daysLeft = Math.ceil(
                                (exp - now) / (1000 * 60 * 60 * 24),
                              );
                            }
                            badgeText =
                              daysLeft !== null && daysLeft >= 0
                                ? `EXPIRED SOON (${daysLeft} day${daysLeft !== 1 ? "s" : ""} left)`
                                : "EXPIRED SOON";
                          }
                          // If expired, show days since expired
                          else if (
                            (domain[key] || "").toUpperCase() === "EXPIRED" &&
                            domain.expireDate
                          ) {
                            const now = new Date();
                            const exp = new Date(domain.expireDate);
                            const diff = Math.floor(
                              (now - exp) / (1000 * 60 * 60 * 24),
                            );
                            if (!isNaN(diff) && diff >= 0) {
                              badgeText = `EXPIRED (${diff} day${diff !== 1 ? "s" : ""} ago)`;
                            }
                          }
                          return (
                            <td
                              key={key}
                              className="w-fit truncate px-2 py-2 whitespace-nowrap text-gray-900 sm:px-4"
                            >
                              <Badge
                                color={badgeClass}
                                className="w-fit rounded-full"
                                size="xs"
                              >
                                {badgeText}
                              </Badge>
                            </td>
                          );
                        }
                        // Show readable date for expire/expireDate
                        if (
                          key.toLowerCase() === "expire" ||
                          key.toLowerCase() === "expiredate"
                        ) {
                          const rawDate = domain[key];
                          let readable = "-";
                          if (rawDate) {
                            const d = new Date(rawDate);
                            readable = !isNaN(d)
                              ? d.toLocaleDateString()
                              : rawDate;
                          }
                          return (
                            <td
                              key={key}
                              className="max-w-xs truncate px-2 py-2 whitespace-nowrap text-gray-900 sm:px-4"
                            >
                              {readable}
                            </td>
                          );
                        }
                        if (key === "autoRenew") {
                          return (
                            <td
                              key={key}
                              className="max-w-xs truncate px-2 py-2 whitespace-nowrap text-gray-900 sm:px-4"
                            >
                              {domain[key] === 1
                                ? "true"
                                : domain[key] === 0
                                  ? "false"
                                  : "true"}
                            </td>
                          );
                        }
                        if (typeof domain[key] === "boolean") {
                          return (
                            <td
                              key={key}
                              className="max-w-xs truncate px-2 py-2 whitespace-nowrap text-gray-900 sm:px-4"
                            >
                              <span
                                className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                                  domain[key]
                                    ? "bg-green-200 text-green-800"
                                    : "bg-red-200 text-red-800"
                                }`}
                              >
                                {domain[key] ? "Yes" : "No"}
                              </span>
                            </td>
                          );
                        }
                        return (
                          <td
                            key={key}
                            className="max-w-xs truncate px-2 py-2 whitespace-nowrap text-gray-900 sm:px-4"
                          >
                            {domain[key] || "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
