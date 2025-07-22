import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Label, FileInput, Spinner, Toast } from "flowbite-react";
import { HiCheck, HiExclamation, HiTrash, HiPencil } from "react-icons/hi";
import { associateDeveloperApi } from "../../../API/AssociateDeveloper/AssociateDeveloper.api.js";

const AssociateDevelopers = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState({
    icon: HiCheck,
    message: "",
  });
  const [editId, setEditId] = useState(null); // null = create mode
  const queryClient = useQueryClient();

  // Fetch all associate developers
  const { data: developers, isLoading: isListLoading } = useQuery({
    queryKey: ["associateDevelopers"],
    queryFn: associateDeveloperApi.getAssociateDevelopers,
  });

  // Fetch associate developer data in edit mode
  const { data: editData, isLoading: isEditLoading } = useQuery({
    queryKey: ["associateDeveloper", editId],
    queryFn: () =>
      editId ? associateDeveloperApi.getAssociateDeveloper(editId) : null,
    enabled: !!editId,
  });

  // console.log(developers.data[0].images);
  // Populate selectedImages with fetched images in edit mode
  useEffect(() => {
    if (editData && editData.images) {
      setSelectedImages(
        editData.images.map((url) => ({
          file: null,
          preview: url,
        })),
      );
    } else if (!editId) {
      setSelectedImages([]);
    }
  }, [editData, editId]);

  // Unified mutation for create or edit
  const mutation = useMutation({
    mutationFn: async ({ images, id }) => {
      // If id is present, update only the images field for the existing developer (PUT)
      if (id) {
        return associateDeveloperApi.updateAssociateDeveloper(id, { images });
      } else {
        // If no id, create a new developer with images (POST)
        return associateDeveloperApi.createAssociateDeveloper({ images });
      }
    },
    onSuccess: () => {
      setToastContent({
        icon: HiCheck,
        message: editId
          ? "Images updated successfully!"
          : "Images uploaded successfully!",
      });
      setShowToast(true);
      setSelectedImages([]);
      setEditId(null);
      queryClient.invalidateQueries(["associateDevelopers"]);
    },
    onError: () => {
      setToastContent({
        icon: HiExclamation,
        message: "Error submitting images. Please try again.",
      });
      setShowToast(true);
    },
  });

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setSelectedImages((prevImages) => [...prevImages, ...filesArray]);
    }
  };

  const removeImage = (imageToRemove) => {
    setSelectedImages((prevImages) =>
      prevImages.filter((image) => image !== imageToRemove),
    );
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the "data:image/png;base64," or similar prefix
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedImages.length === 0) {
      setToastContent({
        icon: HiExclamation,
        message: "Please select images to upload.",
      });
      setShowToast(true);
      return;
    }

    // Convert all files to base64
    const base64Images = await Promise.all(
      selectedImages.map(async (img) => {
        if (img.file) {
          return await fileToBase64(img.file);
        }
        // If already a base64 string (editing), just return the preview (assuming it's base64)
        return img.preview;
      }),
    );

    if (editId) {
      // Append new images to existing images
      const existingImages = editData && editData.images ? editData.images : [];
      const updatedImages = [...existingImages, ...base64Images];
      mutation.mutate({ images: updatedImages, id: editId });
    } else {
      // If creating, send images for new developer
      mutation.mutate({ images: base64Images });
    }
  };

  // Handler to delete an image from a developer's images array
  const handleDeleteDevImage = (dev, imgToDelete) => {
    const imageIndex = dev.images.findIndex((img) => img === imgToDelete);
    if (imageIndex === -1) return;

    const developerId = dev.id || dev._id; // Use _id if id is not present
    if (!developerId) {
      console.error("Developer ID is missing!", dev);
      return;
    }

    associateDeveloperApi
      .deleteAssociateDeveloperImage(developerId, imageIndex)
      .then(() => {
        setToastContent({
          icon: HiCheck,
          message: "Image deleted successfully!",
        });
        setShowToast(true);
        queryClient.invalidateQueries(["associateDevelopers"]);
      })
      .catch(() => {
        setToastContent({
          icon: HiExclamation,
          message: "Error deleting image. Please try again.",
        });
        setShowToast(true);
      });
  };

  // Defensive: fallback to HiCheck if icon is not a function
  const IconComponent =
    typeof toastContent.icon === "function" ? toastContent.icon : HiCheck;

  return (
    <div className="p-4">
      {showToast && (
        <Toast>
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="ml-3 text-sm font-normal">{toastContent.message}</div>
          <Toast.Toggle onDismiss={() => setShowToast(false)} />
        </Toast>
      )}
      <Card>
        <h2 className="mb-4 text-xl font-semibold">Associate Developers</h2>
        {editId && isEditLoading ? (
          <div className="mb-4 flex items-center gap-2 text-gray-500">
            <Spinner size="sm" /> Loading images...
          </div>
        ) : null}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="images" value="Upload Images" />
            <FileInput
              id="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              helperText="Select one or more images to upload."
            />
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
            <Button
              type="submit"
              isProcessing={mutation.isPending}
              disabled={mutation.isPending}
            >
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
        <h3 className="mb-2 text-lg font-semibold">All Associate Developers</h3>
        {isListLoading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Spinner size="sm" /> Loading developers...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(Array.isArray(developers?.data) ? developers.data : developers)
              ?.length > 0 ? (
              (Array.isArray(developers?.data)
                ? developers.data
                : developers
              ).map((dev) =>
                dev.images && dev.images.length > 0
                  ? dev.images.map((img, index) => (
                      <Card key={index} className="relative *:p-1">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <img
                            key={index}
                            src={`data:image/png;base64,${img}`}
                            alt={`dev-img-${index}`}
                            className="rounded border object-cover"
                          />
                          <Button
                            type="button"
                            onClick={() => handleDeleteDevImage(dev, img)}
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
              <div className="text-gray-500">
                No associate developers found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssociateDevelopers;
