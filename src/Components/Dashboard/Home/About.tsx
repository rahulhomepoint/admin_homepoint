import React, { useState, useEffect } from "react";
import {
  Button,
  Label,
  Textarea,
  FileInput,
  Spinner,
  Card,
} from "flowbite-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

interface AboutData {
  _id: string;
  image: string;
  description: string;
}

export const About = () => {
  const [form, setForm] = useState({
    image: null as File | null,
    imagePreview: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch existing about data in the background
  const {
    data: aboutData,
    isLoading: isAboutLoading,
    isError: isAboutError,
    error: aboutError,
  } = useQuery<AboutData | AboutData[], Error>({
    queryKey: ["homeabout"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/homeabout`);
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || "Failed to fetch HomeAbout data");
      }
      return json.data;
    },
    // Don't block UI on loading
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Pre-fill form when data is loaded
  useEffect(() => {
    if (aboutData) {
      const data = Array.isArray(aboutData) ? aboutData[0] : aboutData;
      if (data) {
        setForm({
          image: null,
          imagePreview: data.image || "",
          description: data.description || "",
        });
        setEditId(data._id);
        setIsEditing(false);
      }
    }
  }, [aboutData]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "image" && files) {
      const file = files[0];
      setForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: file ? URL.createObjectURL(file) : "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Prepare payload for API
  const preparePayload = async () => {
    let imageBase64 = form.imagePreview;
    if (form.image) {
      imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(form.image as Blob);
      });
    }
    return {
      image: imageBase64,
      description: form.description,
    };
  };

  // Mutation for creating a new entry
  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = await preparePayload();
      const res = await fetch(`${API_URL}/homeabout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create HomeAbout entry");
      return res.json();
    },
    onSuccess: () => {
      toast.success("About section created successfully!");
      queryClient.invalidateQueries({ queryKey: ["homeabout"] });
    },
    onError: (err: Error) => toast.error(`Creation failed: ${err.message}`),
  });

  // Mutation for updating an existing entry
  const editMutation = useMutation({
    mutationFn: async () => {
      if (!editId) throw new Error("No ID to edit");
      const payload = await preparePayload();
      const res = await fetch(`${API_URL}/homeabout/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update HomeAbout entry");
      return res.json();
    },
    onSuccess: () => {
      toast.success("About section updated successfully!");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["homeabout"] });
    },
    onError: (err: Error) => toast.error(`Update failed: ${err.message}`),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editId && isEditing) {
      editMutation.mutate();
    } else if (!editId) {
      createMutation.mutate();
    }
  };

  if (isAboutLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (isAboutError) {
    // If the error is 'Not found', show the form for creating a new entry
    if (
      aboutError.message?.toLowerCase().includes("not found") ||
      aboutError.message?.toLowerCase().includes("notfound")
    ) {
      // Show empty form for creation
      return (
        <div className="p-4 sm:p-6 lg:p-8">
          <h1 className="mb-6 text-2xl font-bold">About Section Management</h1>
          <Card>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="image">Image</Label>
                {form.imagePreview && (
                  <img
                    src={form.imagePreview}
                    alt="Preview"
                    className="mt-2 h-48 w-full rounded-lg border object-contain"
                  />
                )}
                <FileInput
                  id="image"
                  name="image"
                  onChange={handleChange}
                  accept="image/*"
                  className="mt-2"
                  disabled={false}
                />
              </div>
              <div className="mb-6">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  disabled={false}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  color="success"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Saving..." : "Create Entry"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      );
    }
    // Otherwise, show the error
    return (
      <div className="text-center text-red-500">
        Error: {aboutError.message}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold">About Section Management</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="image">Image</Label>
            {form.imagePreview && (
              <img
                src={form.imagePreview}
                alt="Preview"
                className="mt-2 h-48 w-full rounded-lg border object-contain"
              />
            )}
            <FileInput
              id="image"
              name="image"
              onChange={handleChange}
              accept="image/*"
              className="mt-2"
              disabled={editId ? !isEditing : false}
            />
          </div>
          <div className="mb-6">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={6}
              disabled={editId ? !isEditing : false}
            />
          </div>
          <div className="flex justify-end gap-2">
            {editId && !isEditing && (
              <Button
                color="blue"
                pill
                size="sm"
                type="button"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )}
            {(isEditing || !editId) && (
              <Button
                type="submit"
                color="green"
                pill
                size="sm"
                disabled={createMutation.isPending || editMutation.isPending}
              >
                {createMutation.isPending || editMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            )}
          </div>
        </form>
      </Card>
      {/* Show error if not Not found and not loading */}
      {isAboutError &&
        aboutError &&
        (aboutError as Error).message?.toLowerCase().includes("not found") ===
          false && (
          <div className="mt-4 text-center text-red-500">
            Error: {(aboutError as Error).message}
          </div>
        )}
    </div>
  );
};
