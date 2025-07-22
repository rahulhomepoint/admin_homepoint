import React, { useState, useEffect } from "react";
import { Button, Label, TextInput, FileInput, Spinner } from "flowbite-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

export default function Hero() {
  const [form, setForm] = useState({
    image: null as File | null,
    imagePreview: "",
    title: "",
    subtitle: "",
    value: {
      brokerage: "",
      projects: "",
      developers: "",
      happyClient: "",
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch existing HomeHero data (assume only one entry)
  const {
    data: heroData,
    isLoading: isHeroLoading,
    isError: isHeroError,
    error: heroError,
  } = useQuery({
    queryKey: ["homehero"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/homehero`);
      if (!res.ok) throw new Error("Failed to fetch HomeHero data");
      const json = await res.json();
      return json.data; // Only return the data array/object
    },
  });

  // When heroData loads, if there is data, set form to read-only and prefill
  useEffect(() => {
    console.log("Fetched heroData:", heroData);
    if (heroData && !Array.isArray(heroData)) {
      // If heroData is a single object
      const entry = heroData;
      setForm({
        image: null,
        imagePreview: entry.image || "",
        title: entry.title || "",
        subtitle: entry.subtitle || "",
        value: {
          brokerage: entry.value?.brokerage || "",
          projects: entry.value?.projects || "",
          developers: entry.value?.developers || "",
          happyClient: entry.value?.happyClient || "",
        },
      });
      setEditId(entry._id || entry.id || null);
      setIsEditing(false);
    } else if (heroData && Array.isArray(heroData) && heroData.length > 0) {
      // Existing array logic
      const entry = heroData[0];
      setForm({
        image: null,
        imagePreview: entry.image || "",
        title: entry.title || "",
        subtitle: entry.subtitle || "",
        value: {
          brokerage: entry.value?.brokerage || "",
          projects: entry.value?.projects || "",
          developers: entry.value?.developers || "",
          happyClient: entry.value?.happyClient || "",
        },
      });
      setEditId(entry._id || entry.id || null);
      setIsEditing(false);
    } else {
      setEditId(null);
      setIsEditing(false);
    }
  }, [heroData]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files ? files[0] : null;
      setForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: file ? URL.createObjectURL(file) : "",
      }));
    } else if (
      ["brokerage", "projects", "developers", "happyClient"].includes(name)
    ) {
      setForm((prev) => ({
        ...prev,
        value: { ...prev.value, [name]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Prepare form data for API
  const preparePayload = async () => {
    let imageBase64 = "";
    if (form.image) {
      imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(form.image!);
      });
    } else if (form.imagePreview && form.imagePreview.startsWith("data:")) {
      imageBase64 = form.imagePreview;
    } else if (form.imagePreview) {
      imageBase64 = form.imagePreview;
    }
    return {
      image: imageBase64,
      title: form.title,
      subtitle: form.subtitle,
      value: {
        brokerage: form.value.brokerage,
        projects: form.value.projects,
        developers: form.value.developers,
        happyClient: form.value.happyClient,
      },
    };
  };

  // React Query mutation for POST /homehero
  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = await preparePayload();
      const res = await fetch(`${API_URL}/homehero`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add HomeHero");
      return res.json();
    },
    onSuccess: () => {
      toast.success("HomeHero added successfully!");
      setForm({
        image: null,
        imagePreview: "",
        title: "",
        subtitle: "",
        value: { brokerage: "", projects: "", developers: "", happyClient: "" },
      });
      queryClient.invalidateQueries({ queryKey: ["homehero"] });
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to add HomeHero");
      }
    },
  });

  // React Query mutation for PUT /homehero/:id
  const editMutation = useMutation({
    mutationFn: async () => {
      if (!editId) throw new Error("No HomeHero ID to edit");
      const payload = await preparePayload();
      const res = await fetch(`${API_URL}/homehero/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update HomeHero");
      return res.json();
    },
    onSuccess: () => {
      toast.success("HomeHero updated successfully!");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["homehero"] });
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update HomeHero");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEditing && editId) {
      editMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  if (isHeroLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }
  if (isHeroError) {
    return (
      <div className="mt-8 text-center text-red-500">
        Error:{" "}
        {heroError instanceof Error ? heroError.message : "Failed to load data"}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-2 text-center text-3xl font-semibold">
        Hero Management
      </h1>
      <h2 className="mb-6 text-center text-xl font-medium text-gray-600">
        {editId && !isEditing
          ? "View HomeHero Entry"
          : editId && isEditing
            ? "Edit HomeHero Entry"
            : "Add HomeHero Entry"}
      </h2>
      <form className="rounded bg-white p-6 shadow" onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="image">Image</Label>
          <FileInput
            id="image"
            name="image"
            onChange={handleChange}
            accept="image/*"
            disabled={!!(editId && !isEditing)}
          />
          {form.imagePreview && (
            <img
              src={form.imagePreview}
              alt="Preview"
              className="mt-2 h-32 w-full rounded border object-contain"
            />
          )}
        </div>
        <div className="mb-4">
          <Label htmlFor="title">Title</Label>
          <TextInput
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            disabled={!!(editId && !isEditing)}
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="subtitle">SubTitle</Label>
          <TextInput
            id="subtitle"
            name="subtitle"
            value={form.subtitle}
            onChange={handleChange}
            required
            disabled={!!(editId && !isEditing)}
          />
        </div>
        <div className="mb-4">
          <h3 className="mb-2 text-lg font-semibold">Value</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="brokerage">Brokerage</Label>
              <TextInput
                id="brokerage"
                name="brokerage"
                value={form.value.brokerage}
                onChange={handleChange}
                required
                disabled={!!(editId && !isEditing)}
              />
            </div>
            <div>
              <Label htmlFor="projects">Projects</Label>
              <TextInput
                id="projects"
                name="projects"
                value={form.value.projects}
                onChange={handleChange}
                required
                disabled={!!(editId && !isEditing)}
              />
            </div>
            <div>
              <Label htmlFor="developers">Developers</Label>
              <TextInput
                id="developers"
                name="developers"
                value={form.value.developers}
                onChange={handleChange}
                required
                disabled={!!(editId && !isEditing)}
              />
            </div>
            <div>
              <Label htmlFor="happyClient">Happy Client</Label>
              <TextInput
                id="happyClient"
                name="happyClient"
                value={form.value.happyClient}
                onChange={handleChange}
                required
                disabled={!!(editId && !isEditing)}
              />
            </div>
          </div>
        </div>
        {editId && !isEditing && (
          <Button
            type="button"
            color="purple"
            className="mb-2 w-full"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        )}
        {(!editId || (editId && isEditing)) && (
          <Button
            type="submit"
            color="purple"
            className="w-full"
            disabled={
              (editId && isEditing && editMutation.status === "pending") ||
              (!editId && createMutation.status === "pending")
            }
          >
            {editId && isEditing
              ? editMutation.status === "pending"
                ? "Saving..."
                : "Save"
              : createMutation.status === "pending"
                ? "Submitting..."
                : "Submit"}
          </Button>
        )}
      </form>
    </div>
  );
}
