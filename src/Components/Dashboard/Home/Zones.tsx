import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Badge } from "flowbite-react";

const API_URL = import.meta.env.VITE_API_URL;

// Define the type for a zone
interface Zone {
  image: string[];
  title: string;
  active: boolean;
}

export const Zones = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["zones-launches"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/projects/zones-launches`);
      if (!res.ok) throw new Error("Failed to fetch zones launches");
      const json = await res.json();
      return json;
    },
  });

  if (isLoading) return <div>Loading zones...</div>;
  if (isError) return <div>Error: {(error as Error).message}</div>;

  // The response is expected to be an array as described
  const launches = Array.isArray(data) ? data : [];

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Zones Launches</h1>
      {launches.length === 0 && <div>No zones found.</div>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {launches.map((launch) =>
          launch.zones.map((zone: Zone, idx: number) => (
            <Card
              key={launch._id + idx}
              className="w-full max-w-sm"
              imgSrc={zone.image && zone.image[0] ? zone.image[0] : undefined}
              horizontal={false}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{zone.title}</span>
                  <Badge color={zone.active ? "success" : "failure"}>
                    {zone.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  Fresh Project: {launch.fresh_project ? "Yes" : "No"}
                </div>
              </div>
            </Card>
          )),
        )}
      </div>
    </div>
  );
};
