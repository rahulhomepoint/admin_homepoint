import React, { useState } from "react";
import {
  Button,
  Label,
  TextInput,
  Select,
  FileInput,
  Spinner,
} from "flowbite-react";
import { usersApi } from "../../../API/Users.api";
import { toast } from "react-toastify";
import { HiEye, HiEyeOff } from "react-icons/hi";

export const AddUser = () => {
  const [form, setForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: "user" | "admin" | "manager";
    profileImage: string;
  }>({
    name: "",
    email: "",
    password: "",
    role: "user",
    profileImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (
      name === "profileImage" &&
      (e.target as HTMLInputElement).files &&
      (e.target as HTMLInputElement).files![0]
    ) {
      const file = (e.target as HTMLInputElement).files![0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setForm((prev) => ({ ...prev, profileImage: base64 }));
        setProfilePreview(base64);
      };
      reader.readAsDataURL(file);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleClear = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "user",
      profileImage: "",
    });
    setProfilePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      await usersApi.createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        profileImage: form.profileImage,
      });
      toast.success("User created successfully!");
      handleClear();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to create user.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-md rounded bg-white p-6 shadow">
      <h2 className="mb-6 text-2xl font-bold">Add User</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="name">Name*</Label>
          <TextInput
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="User Name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email*</Label>
          <TextInput
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="user@example.com"
          />
        </div>
        <div>
          <Label htmlFor="password">Password*</Label>
          <div className="relative">
            <TextInput
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              required
              placeholder="yourPassword"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 focus:outline-none"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
            </button>
          </div>
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="profileImage">Profile Image</Label>
          <FileInput
            id="profileImage"
            name="profileImage"
            accept="image/*"
            onChange={handleChange}
          />
          {profilePreview && (
            <img
              src={profilePreview}
              alt="Profile Preview"
              className="mt-2 h-20 w-20 rounded-full border object-cover"
            />
          )}
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Create User"}
          </Button>
          <Button type="button" color="gray" onClick={handleClear}>
            Clear Form
          </Button>
        </div>
      </form>
    </div>
  );
};
