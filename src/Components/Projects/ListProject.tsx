import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Modal, ModalHeader, ModalBody, Button } from "flowbite-react";
import { MdDeleteForever } from "react-icons/md";
import { Link } from "react-router";

const fetchProjects = async () => {
  const res = await fetch("http://localhost:3000/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
};

// Define the Project type based on the API response
interface Project {
  _id: string;
  project_name: string;
  fresh_project: boolean;
  hero: {
    hero_images: string[];
  };
  zones: { title: string }[];
}

export const ListProject = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  if (isLoading) return <div>Loading projects...</div>;
  if (isError) return <div>Error: {(error as Error).message}</div>;

  // If the API returns an array of projects, adjust accordingly
  const projects: Project[] = Array.isArray(data)
    ? data
    : data?.project
      ? [data.project]
      : [];

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setShowModal(true);
    setDeleteError(null);
    setDeleteSuccess(false);
  };

  const closeDeleteModal = () => {
    setShowModal(false);
    setDeleteId(null);
    setDeleteError(null);
    setDeleteSuccess(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`http://localhost:3000/projects/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      setDeleteSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setTimeout(() => {
        closeDeleteModal();
      }, 1000);
    } catch (err) {
      setDeleteError((err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-center text-2xl font-bold">Project List</h1>
      <hr className="text-gray-200" />
      <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3">
        {projects.length === 0 && <div>No projects found.</div>}
        {projects.map((project) => (
          <Link
            to="/dashboard/add-project"
            key={project._id}
            state={{ viewData: projects }}
          >
            <Card
              className="relative h-50 max-w-sm *:w-full *:!p-0"
              imgSrc={project.hero.hero_images[0]}
              horizontal
            >
              {/* Delete Button */}
              <button
                className="absolute top-2 right-2 z-10 rounded-full bg-white p-1 text-red-600 shadow hover:bg-red-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openDeleteModal(project._id);
                }}
                title="Delete Project"
              >
                <MdDeleteForever size={22} />
              </button>
              <div className="mx-3 h-full w-full py-2 text-gray-600">
                <h5 className="text-2xl tracking-tight text-gray-900 dark:text-white">
                  {project.project_name}
                </h5>
                <h5 className="mt-2 text-sm font-semibold">
                  Zone : {project.zones[0]?.title || "Null"}
                </h5>
              </div>
              {!project.fresh_project ? (
                <div className="flex justify-end">
                  <div>
                    <strong className="-me-[2px] -mb-[2px] inline-flex items-center gap-1 rounded-ss-xl rounded-ee-xl bg-indigo-600 px-3 py-1.5 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                      <span className="text-[10px] font-medium sm:text-xs">
                        New Launches
                      </span>
                    </strong>
                  </div>
                </div>
              ) : null}
            </Card>
          </Link>
        ))}
      </div>
      {/* Delete Confirmation Modal */}
      <Modal show={showModal} onClose={closeDeleteModal} popup size="md">
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <MdDeleteForever className="mx-auto mb-4 h-12 w-12 text-red-600" />
            <h3 className="mb-5 text-lg font-normal text-gray-500">
              Are you sure you want to delete this project?
            </h3>
            {deleteError && (
              <div className="mb-2 text-sm text-red-600">{deleteError}</div>
            )}
            {deleteSuccess && (
              <div className="mb-2 text-sm text-green-600">
                Project deleted successfully!
              </div>
            )}
            <div className="flex justify-center gap-4">
              <Button
                className="px-6"
                color={"red"}
                pill
                size="sm"
                onClick={handleDelete}
                disabled={deleting || deleteSuccess}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </Button>
              <Button
                className="px-6"
                color={"gray"}
                pill
                outline
                size="sm"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};
