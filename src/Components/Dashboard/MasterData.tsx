import React, { useState, useEffect } from "react";
import {
  Button,
  Label,
  TextInput,
  FileInput,
  Spinner,
  Alert,
} from "flowbite-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { masterApi, Master } from "../../API/Master.api";

export const MasterData = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<{
    logo: string | null;
    email: string;
    address: { registeredOffice: string; marketingOffice: string };
    rera?: string;
    privyarApi: string;
    phone: string[];
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  }>({
    logo: null,
    email: "",
    address: { registeredOffice: "", marketingOffice: "" },
    rera: "",
    privyarApi: "",
    phone: ["", ""],
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  // Fetch master data
  const {
    data: masterData,
    isLoading: isMasterLoading,
    isError: isMasterError,
    error: masterError,
  } = useQuery<Master | null, Error>({
    queryKey: ["master"],
    queryFn: masterApi.getMaster,
  });

  // Prefill form if master data exists
  useEffect(() => {
    if (masterData) {
      setForm({
        logo: masterData.logo || null,
        email: masterData.email || "",
        address: {
          registeredOffice: masterData.address?.registeredOffice || "",
          marketingOffice: masterData.address?.marketingOffice || "",
        },
        rera: masterData.rera || "",
        privyarApi: masterData.privyarApi || "",
        phone: masterData.phone?.length ? masterData.phone : ["", ""],
        facebook: masterData.facebook || "",
        instagram: masterData.instagram || "",
        linkedin: masterData.linkedin || "",
        youtube: masterData.youtube || "",
      });
      setEditId(masterData._id || null);
      setIsEditing(true);
    } else {
      setEditId(null);
      setIsEditing(false);
    }
  }, [masterData]);

  // Extracted mutation functions to avoid TS signature issues
  const createMutation = useMutation<Master, Error, Omit<Master, "_id">>({
    mutationFn: (data) => masterApi.createMaster(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master"] });
      setIsEditing(true);
    },
  });
  const updateMutation = useMutation<
    Master,
    Error,
    { id: string; data: Partial<Master> }
  >({
    mutationFn: (vars) => masterApi.updateMaster(vars.id, vars.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master"] });
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field?: string,
    idx?: number,
  ) => {
    const { name, value, files } = e.target;
    if (name === "logo" && files && files[0]) {
      const file = files[0];
      setLogoLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        // Convert to PNG base64 using canvas
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const pngBase64 = canvas.toDataURL("image/png");
            setForm((prev) => ({ ...prev, logo: pngBase64 }));
          }
          setLogoLoading(false);
        };
        img.onerror = () => {
          setLogoLoading(false);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else if (field === "address" && idx !== undefined) {
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [idx === 0 ? "registeredOffice" : "marketingOffice"]: value,
        },
      }));
    } else if (field === "phone" && idx !== undefined) {
      setForm((prev) => {
        const phone = [...prev.phone];
        phone[idx] = value;
        return { ...prev, phone };
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLogoError(null);
    if (logoLoading) {
      setLogoError("Please wait for the logo to finish uploading.");
      return;
    }
    if (!form.logo) {
      setLogoError("Logo is required. Please upload a logo image.");
      return;
    }
    const payload = (() => {
      const { rera, ...rest } = form;
      return {
        ...rest,
        logo: form.logo,
        rera: form.rera || "",
      };
    })();
    if (isEditing && editId) {
      updateMutation.mutate({ id: editId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
      <h2 className="mb-6 text-2xl font-bold">Create Master Data</h2>
      {/* If you want to further customize the scrollbar, ensure Tailwind's scrollbar plugin is enabled */}
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <div className="scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 scrollbar-track-gray-100 flex h-[500px] flex-col gap-4 overflow-x-hidden overflow-y-auto pr-2">
          {isMasterLoading && (
            <div className="flex h-32 items-center justify-center">
              <Spinner />
            </div>
          )}
          {isMasterError && (
            <Alert color="failure">
              {(masterError as Error)?.message || "Failed to load data"}
            </Alert>
          )}
          <div>
            <Label htmlFor="logo">Logo</Label>
            <FileInput
              id="logo"
              name="logo"
              //   value={form.logo || ""}
              onChange={handleChange}
              accept="image/*"
              required={form.logo === null ? true : false}
              disabled={logoLoading}
            />

            {logoLoading && (
              <div className="mt-1 text-xs text-gray-500">Uploading...</div>
            )}
            {form.logo && !logoLoading && (
              <img
                src={form.logo}
                alt="Logo preview"
                className="mt-2 h-16 object-contain"
              />
            )}
            {logoError && (
              <div className="mt-1 text-xs text-red-500">{logoError}</div>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <TextInput
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="registeredOffice">Registered Office Address</Label>
            <TextInput
              id="registeredOffice"
              name="registeredOffice"
              value={form.address.registeredOffice}
              onChange={(e) => handleChange(e, "address", 0)}
              required
            />
          </div>
          <div>
            <Label htmlFor="marketingOffice">Marketing Office Address</Label>
            <TextInput
              id="marketingOffice"
              name="marketingOffice"
              value={form.address.marketingOffice}
              onChange={(e) => handleChange(e, "address", 1)}
              required
            />
          </div>
          <div>
            <Label htmlFor="rera">RERA No.</Label>
            <TextInput
              id="rera"
              name="rera"
              value={form.rera}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="privyarApi">Privyar API</Label>
            <TextInput
              id="privyarApi"
              name="privyarApi"
              value={form.privyarApi}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone1">Phone 1</Label>
              <TextInput
                id="phone1"
                name="phone1"
                value={form.phone[0]}
                onChange={(e) => handleChange(e, "phone", 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone2">Phone 2</Label>
              <TextInput
                id="phone2"
                name="phone2"
                value={form.phone[1]}
                onChange={(e) => handleChange(e, "phone", 1)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="facebook">Facebook</Label>
            <TextInput
              id="facebook"
              name="facebook"
              value={form.facebook}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <TextInput
              id="instagram"
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <TextInput
              id="linkedin"
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="youtube">YouTube</Label>
            <TextInput
              id="youtube"
              name="youtube"
              value={form.youtube}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="sticky bottom-0 left-0 z-10 bg-white pt-4 pb-2">
          <Button
            type="submit"
            className="w-full"
            disabled={
              createMutation.status === "pending" ||
              updateMutation.status === "pending" ||
              logoLoading
            }
          >
            {createMutation.status === "pending" ||
            updateMutation.status === "pending" ||
            logoLoading
              ? isEditing
                ? "Updating..."
                : "Submitting..."
              : isEditing
                ? "Update"
                : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};
