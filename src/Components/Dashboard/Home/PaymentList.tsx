import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Label, FileInput, Spinner } from "flowbite-react";
import { HiTrash } from "react-icons/hi";
// @ts-expect-error: No type declaration for JS module
import paymentListApi from "../../../API/PaymentList.api";
import { toast } from "react-toastify";

// Type for a payment entry
interface PaymentEntry {
  id: string;
  images: string[];
  [key: string]: unknown;
}

// Type for selected image (file or preview)
type SelectedImage = { file: File | null; preview: string };

const PaymentList = () => {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [editId, setEditId] = useState<string | null>(null); // null = create mode
  const queryClient = useQueryClient();

  // Fetch all payment entries
  const { data: paymentLists, isLoading: isListLoading } = useQuery({
    queryKey: ["paymentLists"],
    queryFn: () =>
      paymentListApi
        .getPaymentLists()
        .then((res: unknown) => (res as { data: PaymentEntry[] }).data),
  });

  // Fetch payment entry in edit mode
  const { data: editData, isLoading: isEditLoading } = useQuery({
    queryKey: ["paymentList", editId],
    queryFn: () =>
      editId
        ? paymentListApi
            .getPaymentList(editId)
            .then((res: unknown) => (res as { data: PaymentEntry }).data)
        : null,
    enabled: !!editId,
  });

  // Populate selectedImages with fetched images in edit mode
  useEffect(() => {
    if (editData && editData.images) {
      setSelectedImages(
        editData.images.map((img: string) => ({
          file: null,
          preview: `data:image/png;base64,${img}`,
        })),
      );
    } else if (!editId) {
      setSelectedImages([]);
    }
  }, [editData, editId]);

  // Unified mutation for create or edit
  const mutation = useMutation({
    mutationFn: async ({ images, id }: { images: string[]; id?: string }) => {
      if (id) {
        return paymentListApi.updatePaymentList(id, { images });
      } else {
        return paymentListApi.createPaymentList({ images });
      }
    },
    onSuccess: () => {
      toast.success(
        editId
          ? "Images updated successfully!"
          : "Images uploaded successfully!",
      );
      setSelectedImages([]);
      setEditId(null);
      queryClient.invalidateQueries({ queryKey: ["paymentLists"] });
    },
    onError: () => {
      toast.error("Error submitting images. Please try again.");
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray: SelectedImage[] = Array.from(e.target.files).map(
        (file) => ({
          file,
          preview: URL.createObjectURL(file),
        }),
      );
      setSelectedImages((prevImages) => [...prevImages, ...filesArray]);
    }
  };

  const removeImage = (imageToRemove: SelectedImage) => {
    setSelectedImages((prevImages) =>
      prevImages.filter((image) => image !== imageToRemove),
    );
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedImages.length === 0) {
      toast.error("Please select images to upload.");
      return;
    }
    const base64Images = await Promise.all(
      selectedImages.map(async (img) => {
        if (img.file) {
          return await fileToBase64(img.file);
        }
        // If already a base64 string (editing), just return the preview (assuming it's base64)
        return img.preview.split(",")[1];
      }),
    );
    if (editId) {
      // Append new images to existing images
      const existingImages = editData && editData.images ? editData.images : [];
      const updatedImages = [...existingImages, ...base64Images];
      mutation.mutate({ images: updatedImages, id: editId });
    } else {
      mutation.mutate({ images: base64Images });
    }
  };

  // Handler to delete an image from a payment entry's images array
  const handleDeletePaymentImage = (
    payment: PaymentEntry,
    imgToDelete: string,
  ) => {
    const imageIndex = payment.images.findIndex((img) => img === imgToDelete);
    if (imageIndex === -1) return;
    const paymentId = payment.id || payment._id;
    if (!paymentId) {
      console.error("Payment ID is missing!", payment);
      return;
    }
    paymentListApi
      .removePaymentListImage(paymentId, imageIndex)
      .then(() => {
        toast.success("Image deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["paymentLists"] });
      })
      .catch(() => {
        toast.error("Error deleting image. Please try again.");
      });
  };

  return (
    <div className="p-4">
      <Card>
        <h2 className="mb-4 text-xl font-semibold">Payment List</h2>
        {editId && isEditLoading ? (
          <div className="mb-4 flex items-center gap-2 text-gray-500">
            <Spinner size="sm" /> Loading images...
          </div>
        ) : null}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="images">Upload Images</Label>
            <FileInput
              id="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            <p className="mt-1 text-xs text-gray-500">
              Select one or more images to upload.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            {selectedImages.map((image, index) => (
              <div key={index} className="group relative">
                <img
                  src={image.preview}
                  alt={`preview ${index}`}
                  className="h-24 w-24 rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(image)}
                  className="absolute top-1 right-1 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white opacity-80 shadow-lg transition-opacity duration-200 hover:opacity-100"
                  title="Delete image"
                >
                  <HiTrash className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">
                    {editId ? "Saving..." : "Submitting..."}
                  </span>
                </>
              ) : editId ? (
                "Save"
              ) : (
                "Submit"
              )}
            </Button>
            {editId && (
              <Button
                type="button"
                color="gray"
                onClick={() => setEditId(null)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>
      <div className="mt-8">
        <h3 className="mb-2 text-lg font-semibold">All Payment Entries</h3>
        {isListLoading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Spinner size="sm" /> Loading payments...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(Array.isArray(paymentLists)
              ? paymentLists
              : (paymentLists?.data ?? [])
            )?.length > 0 ? (
              (Array.isArray(paymentLists)
                ? paymentLists
                : (paymentLists?.data ?? [])
              ).map((payment: PaymentEntry) =>
                payment.images && payment.images.length > 0
                  ? payment.images.map((img: string, index: number) => (
                      <Card key={index} className="relative *:p-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <img
                            key={index}
                            src={`data:image/png;base64,${img}`}
                            alt={`payment-img-${index}`}
                            className="rounded object-cover"
                          />
                          <Button
                            type="button"
                            onClick={() =>
                              handleDeletePaymentImage(payment, img)
                            }
                            className="absolute top-1 right-1 z-10 p-2"
                            size="xs"
                            color="red"
                            pill
                            title="Delete image"
                          >
                            <HiTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  : null,
              )
            ) : (
              <div className="text-gray-500">No payment entries found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentList;
