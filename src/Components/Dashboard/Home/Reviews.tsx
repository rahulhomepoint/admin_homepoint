import React, { useState } from "react";
import {
  Label,
  TextInput,
  Textarea,
  Button,
  Spinner,
  FileInput,
  Table,
  Modal,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  ModalHeader,
  ModalBody,
} from "flowbite-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi, Review } from "../../../API/Reviews.api";
import { BsFillPencilFill } from "react-icons/bs";
import { HiTrash } from "react-icons/hi";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ReviewFormState {
  name: string;
  image: string;
  work: string;
  message: string;
}

export const Reviews = () => {
  const [form, setForm] = useState<ReviewFormState>({
    name: "",
    image: "",
    work: "",
    message: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch reviews
  const {
    data: reviews,
    isLoading,
    isError,
    error,
  } = useQuery<Review[], Error>({
    queryKey: ["reviews"],
    queryFn: reviewsApi.getReviews,
  });

  // Add review mutation
  const addReviewMutation = useMutation({
    mutationFn: reviewsApi.addReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setForm({ name: "", image: "", work: "", message: "" });
    },
  });

  // Edit review mutation
  const editReviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewFormState }) =>
      reviewsApi.editReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setEditId(null);
      setForm({ name: "", image: "", work: "", message: "" });
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type, files } = e.target as HTMLInputElement;
    if (type === "file" && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editId) {
      editReviewMutation.mutate({ id: editId, data: form });
    } else {
      addReviewMutation.mutate(form);
    }
  };

  const handleEdit = (review: Review) => {
    setForm({
      name: review.name,
      image: review.image || "",
      work: review.work,
      message: review.message,
    });
    setEditId(review._id || null);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteReviewMutation.mutate(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  return (
    <>
      <div className="mt-8 grid grid-cols-3 gap-4 rounded-lg bg-white p-6 shadow-md">
        <form onSubmit={handleSubmit} className="col-span-1 gap-4">
          <h2 className="mb-6 text-center text-2xl font-bold">
            {editId ? "Edit Review" : "Add a Review"}
          </h2>
          <div>
            <Label htmlFor="name">Name</Label>
            <TextInput
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Enter your name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="image">Upload Image</Label>
            {form.image && (
              <img
                src={form.image}
                alt="Preview"
                className="mb-2 h-20 w-20 rounded-full border object-cover"
              />
            )}
            <FileInput
              id="image"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="work">Work</Label>
            <TextInput
              id="work"
              type="text"
              name="work"
              value={form.work}
              onChange={handleChange}
              required
              placeholder="Enter your work/position"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              placeholder="Write your review message"
              className="mt-1"
              rows={4}
            />
          </div>
          <Button
            type="submit"
            className="mt-4 w-full"
            disabled={
              addReviewMutation.status === "pending" ||
              editReviewMutation.status === "pending"
            }
          >
            {editId
              ? editReviewMutation.status === "pending"
                ? "Saving..."
                : "Save Changes"
              : addReviewMutation.status === "pending"
                ? "Submitting..."
                : "Submit Review"}
          </Button>
          {(addReviewMutation.isError || editReviewMutation.isError) && (
            <div className="text-sm text-red-600">
              {(addReviewMutation.error as Error)?.message ||
                (editReviewMutation.error as Error)?.message ||
                "Failed to submit review."}
            </div>
          )}
        </form>

        <div className="col-span-2 mt-10">
          <h3 className="mb-4 text-center text-xl font-semibold">
            Reviews List
          </h3>
          {isLoading ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : isError ? (
            <div className="text-center text-red-600">
              {error?.message || "Failed to load reviews."}
            </div>
          ) : reviews && reviews.length > 0 ? (
            <Table hoverable className="min-w-full">
              <TableHead>
                <TableHeadCell>Image</TableHeadCell>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Work</TableHeadCell>
                <TableHeadCell>Message</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {reviews.map((review) => (
                  <TableRow key={review._id} className="bg-white">
                    <TableCell>
                      {review.image && (
                        <img
                          src={review.image}
                          alt={review.name}
                          className="h-12 w-12 rounded-full border object-cover"
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {review.name}
                    </TableCell>
                    <TableCell>{review.work}</TableCell>
                    <TableCell className="line-clamp-2 max-w-xs break-words">
                      {review.message}
                    </TableCell>
                    <TableCell className="">
                      <div className="flex items-center gap-2">
                        <Button
                          size="xs"
                          color="blue"
                          pill
                          className="mr-2"
                          onClick={() => handleEdit(review)}
                        >
                          <BsFillPencilFill />
                        </Button>
                        <Button
                          size="xs"
                          color="red"
                          pill
                          onClick={() => handleDelete(review._id!)}
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
            <div className="text-center text-gray-500">No reviews yet.</div>
          )}
        </div>
      </div>
      <Modal
        show={showDeleteModal}
        onClose={cancelDelete}
        size="sm"
        className="rounded-4xl"
      >
        <ModalHeader className="overflow-hidden bg-red-700">
          Delete Review
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
              Are you sure you want to delete this review? This action cannot be
              undone.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button
                color="red"
                onClick={confirmDelete}
                disabled={deleteReviewMutation.status === "pending"}
              >
                {deleteReviewMutation.status === "pending"
                  ? "Deleting..."
                  : "Delete"}
              </Button>
              <Button
                color="gray"
                onClick={cancelDelete}
                disabled={deleteReviewMutation.status === "pending"}
              >
                Cancel
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};
