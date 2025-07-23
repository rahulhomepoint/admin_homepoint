import React, { useState } from "react";
import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  Badge, // Add Badge import
  FileInput,
  TextInput,
  Select,
} from "flowbite-react";
import {
  useQuery as useRQ,
  useMutation as useMut,
  useQueryClient as useQC,
} from "@tanstack/react-query";
import { usersApi, User } from "../../../API/Users.api";
import { BsFillPencilFill } from "react-icons/bs";
import { HiTrash } from "react-icons/hi";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

export const UserList = () => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const queryClient = useQC();

  // Fetch users
  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useRQ<User[], Error>({
    queryKey: ["users"],
    queryFn: usersApi.getUsers,
  });

  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  // Fetch single user for edit
  const {
    data: editUserData,
    isLoading: isEditLoading,
    isError: isEditError,
    error: editError,
  } = useRQ<User | undefined, Error>({
    queryKey: ["user", editUserId],
    queryFn: () =>
      editUserId
        ? usersApi.getUserById(editUserId)
        : Promise.resolve(undefined),
    enabled: !!editUserId && showEditModal,
  });

  console.log("editUserData", editForm);

  // Update user mutation
  const updateUserMutation = useMut({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      usersApi.editUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowEditModal(false);
      setEditUserId(null);
      setEditForm({});
    },
  });

  // Open edit modal and set user ID
  const handleEdit = (user: User) => {
    setEditUserId(user._id);
    setShowEditModal(true);
    // Do NOT clear the form or call refetch here
  };

  // When user data loads and modal is open, set form
  React.useEffect(() => {
    if (editUserData && showEditModal) {
      setEditForm({
        name: editUserData.data.name,
        email: editUserData.data.email,
        role: editUserData.data.role,
        status: editUserData.data.status,
        profileImage: editUserData.data.profileImage,
      });
    }
  }, [editUserData, showEditModal]);

  // When modal closes, clear form and userId
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditUserId(null);
    setEditForm({});
  };

  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
  ];

  // Handle form change
  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type, files } = e.target as HTMLInputElement;
    if (type === "file" && files && files[0]) {
      const file = files[0];
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error("Only JPG, PNG, and GIF images are allowed.");
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error("Image size must be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm((prev) => ({
          ...prev,
          profileImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submit
  const handleEditFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editUserId && editForm) {
      updateUserMutation.mutate({ id: editUserId, data: editForm });
    }
  };

  // Delete user mutation
  const deleteUserMutation = useMut({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowDeleteModal(false);
      setDeleteId(null);
      toast.success("User deleted successfully.");
    },
  });

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteUserMutation.mutate(deleteId);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  return (
    <div className="p-4">
      <h3 className="mb-4 text-center text-xl font-semibold">User List</h3>
      {isLoading ? (
        <div className="flex justify-center">
          <Spinner />
        </div>
      ) : isError ? (
        <div className="text-center text-red-600">
          {error?.message || "Failed to load users."}
        </div>
      ) : users && users.length > 0 ? (
        <Table hoverable className="min-w-full">
          <TableHead>
            <TableHeadCell>Image</TableHeadCell>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Email</TableHeadCell>
            <TableHeadCell>Role</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y divide-gray-200">
            {users.map((user) => (
              <TableRow key={user._id} className="bg-white">
                <TableCell>
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="h-12 w-12 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-gray-200 text-gray-500">
                      N/A
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  {user.name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    color={user.role === "admin" ? "info" : "purple"}
                    className="w-fit rounded-full"
                    size="sm"
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className="w-fit rounded-full"
                    color={user.status === "active" ? "success" : "failure"}
                    size="sm"
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      color="blue"
                      pill
                      className="mr-2"
                      onClick={() => handleEdit(user)}
                    >
                      <BsFillPencilFill />
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      pill
                      onClick={() => handleDelete(user._id)}
                      disabled={deleteUserMutation.isPending}
                    >
                      <HiTrash />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center text-gray-500">No users found.</div>
      )}
      <Modal
        show={showEditModal}
        onClose={handleCloseEditModal}
        size="md"
        className=""
      >
        <ModalHeader>Edit User</ModalHeader>
        <ModalBody>
          {isEditLoading ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : isEditError ? (
            <div className="text-center text-red-600">
              {editError?.message || "Failed to load user."}
            </div>
          ) : editUserData ? (
            <form
              onSubmit={handleEditFormSubmit}
              className="flex flex-col gap-4"
            >
              <div className="mb-4 flex items-center justify-center rounded-lg">
                {editForm?.profileImage ? (
                  <img
                    src={editForm.profileImage}
                    alt="Profile"
                    className="mb-2 h-16 w-16 rounded-full border object-cover"
                  />
                ) : (
                  <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full border bg-gray-200 text-gray-500">
                    N/A
                  </div>
                )}
                <FileInput
                  name="profileImage"
                  accept="image/*"
                  onChange={handleEditFormChange}
                  className="ml-4"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium">Name</label>
                <TextInput
                  type="text"
                  name="name"
                  value={editForm?.name ?? ""}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block font-medium">Email</label>
                <TextInput
                  type="email"
                  name="email"
                  value={editForm?.email ?? ""}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block font-medium">Role</label>
                <Select
                  name="role"
                  value={editForm?.role ?? ""}
                  onChange={handleEditFormChange}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block font-medium">Status</label>
                <Select
                  name="status"
                  value={editForm?.status ?? ""}
                  onChange={handleEditFormChange}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  color="blue"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? (
                    <Spinner size="sm" />
                  ) : (
                    "Update"
                  )}
                </Button>
                <Button
                  color="gray"
                  onClick={handleCloseEditModal}
                  disabled={updateUserMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}
        </ModalBody>
      </Modal>
      <Modal
        show={showDeleteModal}
        onClose={cancelDelete}
        size="sm"
        className=""
      >
        <ModalHeader className="overflow-hidden bg-red-700">
          Delete User
        </ModalHeader>
        <ModalBody>
          <div className="text-center">
            <div className="mb-4 flex flex-col items-center justify-center">
              <ExclamationTriangleIcon className="mb-2 h-10 w-10 text-yellow-500" />
              <span className="text-lg font-semibold text-yellow-700">
                Warning
              </span>
            </div>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button
                color="red"
                onClick={confirmDelete}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  "Delete"
                )}
              </Button>
              <Button
                color="gray"
                onClick={cancelDelete}
                disabled={deleteUserMutation.isPending}
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
