import React, { useRef } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import {
  HomeIcon,
  TagIcon,
  CalendarIcon,
  LinkIcon,
  InformationCircleIcon,
  UsersIcon,
  PlusIcon,
  MinusIcon,
  MapPinIcon,
  DocumentTextIcon,
  LightBulbIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  TextInput,
  Textarea,
  Button,
  ToggleSwitch,
  FileInput,
} from "flowbite-react";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { MdDelete } from "react-icons/md";
import { useLocation } from "react-router";

// Types for the entire form
interface ProjectFormValues {
  // Project Info
  project_name: string;
  project_logo: File[];
  // Hero
  title: string;
  tagline: string;
  price_range: string;
  land_area: string;
  possession_date: string;
  configurations: { bhk: string }[];
  hero_images: File[];
  // Overview
  overview_title: string;
  overview_subtitle: string;
  overview_description: string;
  overview_gallery_images: File[];
  overview_button_label: string;
  overview_button_link: string;
  // Amenities
  amenities: string[];
  // Key Highlights
  highlights: { title: string; description: string; image: File[] }[];
  // Zones
  zones: { image: File[]; title: string; active: boolean }[];
  // Fresh Project & Development
  fresh_project: boolean;
  development: boolean;
  // Location Advantage
  location_section_title: string;
  location_section_subtitle: string;
  map_embed_url: string;
  location_categories: { category: string; items: string }[];
  // Layout & Floorplan
  layouts: {
    name: string;
    image: File[];
    carpet_area: string;
    saleable_area: string;
    car_parks: string;
  }[];
  master_layout_description: string;
  download_pdf_url: string;
  // About
  left_image: File[];
  left_title: string;
  realty_title: string;
  realty_description: string;
  group_title: string;
  group_description: string;
  cta_button_text: string;
  cta_button_link: string;
}

const amenitiesOptions = [
  "Swimming Pool",
  "Floating Cafe",
  "Pedal Boat Area",
  "Fishing Deck",
  "Yoga Deck",
  "Stargazing Deck",
  "Pet Relief Area",
  "Serene Temple",
  "Aroma Garden",
  "Jogging Track",
  "Skating Rink",
  "Club House",
  "Kids Play Area",
  "Cricket Turf",
];

// Utility: Convert File to base64
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

// Utility: Recursively transform all File(s) to base64
async function transformImagesToBase64(data: unknown): Promise<unknown> {
  if (Array.isArray(data)) {
    return Promise.all(data.map(transformImagesToBase64));
  } else if (data instanceof File) {
    return await fileToBase64(data);
  } else if (typeof data === "object" && data !== null) {
    const result: Record<string, unknown> = {};
    for (const key in data as Record<string, unknown>) {
      result[key] = await transformImagesToBase64(
        (data as Record<string, unknown>)[key],
      );
    }
    return result;
  }
  return data;
}

// Mutation function for React Query
const submitProject = async (
  groupedData: Record<string, unknown>,
): Promise<unknown> => {
  const payload = await transformImagesToBase64(groupedData);
  const response = await fetch("http://localhost:3000/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to submit project");
  }
  return response.json();
};

export const AddProject = () => {
  const location = useLocation();
  const { viewData } = location.state || {};
  // console.log("these value is the ", viewData);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
    clearErrors,
    setFocus,
  } = useForm<ProjectFormValues>({
    defaultValues: {
      // Project Info
      project_name: "",
      project_logo: [],
      // Hero
      title: "",
      tagline: "",
      price_range: "",
      land_area: "",
      possession_date: "",
      configurations: [],
      hero_images: [],
      // Overview
      overview_title: "",
      overview_subtitle: "",
      overview_description: "",
      overview_gallery_images: [],
      overview_button_label: "",
      overview_button_link: "",
      // Amenities
      amenities: [],
      // Key Highlights
      highlights: [{ title: "", description: "", image: [] }],
      // Zones
      zones: [{ image: [], title: "", active: true }],
      // Fresh Project & Development
      fresh_project: false,
      development: false,
      // Location Advantage
      location_section_title: "",
      location_section_subtitle: "",
      map_embed_url: "",
      location_categories: [{ category: "", items: "" }],
      // Layout & Floorplan
      layouts: [],
      master_layout_description: "",
      download_pdf_url: "",
      // About
      left_image: [],
      left_title: "",
      realty_title: "",
      realty_description: "",
      group_title: "",
      group_description: "",
      cta_button_text: "",
      cta_button_link: "",
    },
    mode: "onTouched",
  });

  // Field arrays
  const { fields: highlightsFields, append: appendHighlight } = useFieldArray({
    control,
    name: "highlights",
  });
  const {
    fields: locationCategoriesFields,
    append: appendLocationCategory,
    remove: removeLocationCategory,
  } = useFieldArray({ control, name: "location_categories" });
  const {
    fields: configurationFields,
    remove: removeConfiguration,
    append: appendConfiguration,
  } = useFieldArray({ control, name: "configurations" });
  const {
    fields: layoutFields,
    append: appendLayout,
    remove: removeLayout,
  } = useFieldArray({ control, name: "layouts" });
  const {
    fields: zoneFields,
    append: appendZone,
    remove: removeZone,
  } = useFieldArray({ control, name: "zones" });

  // Watch for dynamic field changes
  React.useEffect(() => {
    // No longer needed as FileMosaic handles preview
  }, [zoneFields.length]);
  React.useEffect(() => {
    // No longer needed as FileMosaic handles preview
  }, [layoutFields.length]);

  // Watch all image fields for reactive updates
  const heroImages = watch("hero_images");
  const overviewGalleryImages = watch("overview_gallery_images");
  const leftImage = watch("left_image");
  const highlights = watch("highlights");
  const zones = watch("zones");
  const layouts = watch("layouts");

  const mutation: UseMutationResult<
    unknown,
    unknown,
    Record<string, unknown>
  > = useMutation({
    mutationFn: submitProject,
    onSuccess: (data: unknown) => {
      toast.success("Project submitted successfully!");
      console.log("API response:", data);
      // Reset form to default values
      reset();
    },
    onError: (error: unknown) => {
      toast.error("Failed to submit project. Please try again.");
      console.error(error);
    },
  });

  const onSubmit: SubmitHandler<ProjectFormValues> = (data) => {
    // Transform location_categories items from string to array
    const locationCategories = data.location_categories.map((cat) => ({
      ...cat,
      items: cat.items
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    }));

    // Build grouped response
    const groupedData = {
      project_info: {
        project_name: data.project_name,
        project_logo: data.project_logo,
      },
      hero: {
        title: data.title,
        tagline: data.tagline,
        price_range: data.price_range,
        land_area: data.land_area,
        possession_date: data.possession_date,
        configurations: data.configurations,
        hero_images: data.hero_images,
      },
      overview: {
        overview_title: data.overview_title,
        overview_subtitle: data.overview_subtitle,
        overview_description: data.overview_description,
        overview_gallery_images: data.overview_gallery_images,
        overview_button_label: data.overview_button_label,
        overview_button_link: data.overview_button_link,
      },
      amenities: data.amenities,
      highlights: data.highlights,
      zones: data.zones,
      location_advantage: {
        location_section_title: data.location_section_title,
        location_section_subtitle: data.location_section_subtitle,
        map_embed_url: data.map_embed_url,
        location_categories: locationCategories,
      },
      layout_and_floorplan: {
        layouts: data.layouts,
        master_layout_description: data.master_layout_description,
        download_pdf_url: data.download_pdf_url,
      },
      about: {
        left_image: data.left_image,
        left_title: data.left_title,
        realty_title: data.realty_title,
        realty_description: data.realty_description,
        group_title: data.group_title,
        group_description: data.group_description,
        cta_button_text: data.cta_button_text,
        cta_button_link: data.cta_button_link,
      },
      fresh_project: data.fresh_project,
      development: data.development,
    };

    mutation.mutate(groupedData);
  };

  // FileInput refs
  const heroImagesInputRef = useRef<HTMLInputElement | null>(null);
  const overviewGalleryInputRef = useRef<HTMLInputElement | null>(null);
  const leftImageInputRef = useRef<HTMLInputElement | null>(null);
  const highlightsImageInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const zonesImageInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const layoutsImageInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  return (
    <section className="glassmorphism flex h-[91vh] w-full flex-col">
      <header className="sticky top-0 z-10 border-b border-blue-100 bg-white/80 px-4 py-3 backdrop-blur">
        <h1 className="flex items-center gap-3 text-3xl tracking-tight text-blue-900">
          <BuildingOffice2Icon className="size-12 text-blue-700" /> Add Project
        </h1>
      </header>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-7xl flex-1 space-y-16 overflow-y-auto px-4 py-12"
        autoComplete="off"
      >
        {/* Project Info Section */}
        <section className="mb-12 w-full p-0">
          <div className="mb-6 flex items-center gap-3 border-b border-blue-200 pb-3">
            <BuildingOffice2Icon className="h-8 w-8 text-blue-600" />
            <h2 className="text-xl font-bold text-blue-900">
              Project Information
            </h2>
          </div>
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Project Name
              </label>
              <TextInput
                {...register("project_name", {
                  required: "Project name is required",
                })}
                icon={BuildingOffice2Icon}
                color={errors.project_name ? "failure" : "gray"}
                placeholder="Enter project name"
              />
              {errors.project_name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.project_name.message}
                </p>
              )}
            </div>
            <div className="flex flex-col items-start gap-4">
              <div className="flex flex-col">
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Project Logo
                </label>
                <FileInput
                  accept="image/*"
                  color={errors.project_logo ? "failure" : "gray"}
                  onChange={(e) => {
                    const files = e.target.files
                      ? Array.from(e.target.files)
                      : [];
                    setValue("project_logo", files);
                  }}
                />
              </div>
              {watch("project_logo") && watch("project_logo").length > 0 && (
                <div className="flex items-center gap-2">
                  {watch("project_logo").map((file: File, i: number) => (
                    <div
                      key={i}
                      className="relative flex h-16 w-16 items-center justify-center"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-full w-full rounded-md border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setValue("project_logo", []);
                        }}
                        className="absolute -top-2 -right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-lg ring-2 ring-white hover:bg-red-700"
                        title="Remove logo"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="mb-12 w-full p-0">
          <div className="mb-6 flex items-center gap-3 border-b border-blue-200 pb-3">
            <HomeIcon className="h-8 w-8 text-blue-600" />
            <h2 className="text-xl font-bold text-blue-900">Hero Section</h2>
          </div>
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-8">
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Title
              </label>
              <TextInput
                {...register("title", { required: "Title is required" })}
                icon={HomeIcon}
                color={errors.title ? "failure" : "gray"}
                placeholder="Find your dream house"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="col-span-4">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Tagline
              </label>
              <TextInput
                {...register("tagline", { required: "Tagline is required" })}
                icon={TagIcon}
                color={errors.tagline ? "failure" : "gray"}
                placeholder="Kolkata's only Real Estate platform..."
              />
              {errors.tagline && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.tagline.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Price Range
              </label>
              <TextInput
                {...register("price_range", {
                  required: "Price range is required",
                })}
                icon={TagIcon}
                color={errors.price_range ? "failure" : "gray"}
                placeholder="₹1 Crore"
              />
              {errors.price_range && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.price_range.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Land Area
              </label>
              <TextInput
                {...register("land_area", {
                  required: "Land area is required",
                })}
                icon={MapPinIcon}
                color={errors.land_area ? "failure" : "gray"}
                placeholder="40 Acres"
              />
              {errors.land_area && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.land_area.message}
                </p>
              )}
            </div>
          </div>
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Possession Date
              </label>
              <TextInput
                {...register("possession_date", {
                  required: "Possession date is required",
                })}
                icon={CalendarIcon}
                color={errors.possession_date ? "failure" : "gray"}
                placeholder="December 2026"
              />
              {errors.possession_date && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.possession_date.message}
                </p>
              )}
            </div>
            <div className="col-span-3">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Configurations (BHK Types)
              </label>
              <div className="flex flex-row flex-wrap items-center gap-2">
                {configurationFields.map((field, idx) => (
                  <div key={field.id} className="relative flex items-center">
                    <input
                      type="text"
                      {...register(`configurations.${idx}.bhk`, {
                        required: "BHK is required",
                      })}
                      className="w-32 rounded border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g. 2 BHK,"
                    />
                    <button
                      type="button"
                      onClick={() => removeConfiguration(idx)}
                      className="absolute top-1/2 right-1 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-red-100 text-red-500 transition hover:text-red-700 focus:outline-none"
                      title="Remove BHK"
                      tabIndex={-1}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  color="green"
                  pill
                  outline
                  size="xs"
                  onClick={() => appendConfiguration({ bhk: "" })}
                  className="ml-2"
                >
                  <PlusIcon className="h-4 w-4" /> Add BHK
                </Button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Current:{" "}
                {configurationFields.map((field, idx) => (
                  <span key={field.id}>
                    {idx > 0 ? ", " : ""}
                    {(typeof field.bhk === "string" && field.bhk) || ""}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* HERO IMAGES */}
          <div className="mt-6 flex flex-col items-start gap-4 md:flex-row">
            <div className="flex flex-col">
              <label className="mb-1 block text-base text-sm font-semibold text-gray-700">
                Hero Images
              </label>
              <FileInput
                multiple
                accept="image/*"
                color={errors.hero_images ? "failure" : "gray"}
                onChange={(e) => {
                  const files = e.target.files
                    ? Array.from(e.target.files)
                    : [];
                  setValue("hero_images", files);
                  if (heroImagesInputRef.current)
                    heroImagesInputRef.current.value = "";
                }}
                ref={heroImagesInputRef}
              />
            </div>
            {Array.isArray(heroImages) && heroImages.length > 0 && (
              <div className="scrollbar-thin scrollbar-thumb-blue-200 flex max-w-full flex-row items-center gap-2 overflow-x-auto rounded-lg bg-blue-50 px-3 py-2">
                {heroImages.map((file: File, i: number) => (
                  <div
                    key={i}
                    className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-full w-full rounded-md border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newFiles = heroImages.filter(
                          (_: File, j: number) => j !== i,
                        );
                        setValue("hero_images", newFiles);
                      }}
                      className="absolute -top-2 -right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-lg ring-2 ring-white hover:bg-red-700"
                      title="Delete image"
                      tabIndex={0}
                      aria-label="Remove image"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Overview Section */}
        <section className="mb-12 w-full p-0">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-blue-900">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" /> Project
            Overview
          </h2>
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            <div className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-1">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Title
              </label>
              <TextInput
                {...register("overview_title", {
                  required: "Overview title is required",
                })}
                icon={DocumentTextIcon}
                color={errors.overview_title ? "failure" : "gray"}
                placeholder="EMAMI AASTHA Overview"
              />
              {errors.overview_title && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.overview_title.message}
                </p>
              )}
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-1">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Subtitle
              </label>
              <TextInput
                {...register("overview_subtitle", {
                  required: "Overview subtitle is required",
                })}
                icon={InformationCircleIcon}
                color={errors.overview_subtitle ? "failure" : "gray"}
                placeholder="Project Overview"
              />
              {errors.overview_subtitle && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.overview_subtitle.message}
                </p>
              )}
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Description
              </label>
              <Textarea
                {...register("overview_description", {
                  required: "Description is required",
                })}
                color={errors.overview_description ? "failure" : "gray"}
                placeholder="Enter description here..."
              />
              {errors.overview_description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.overview_description.message}
                </p>
              )}
            </div>
            {/* OVERVIEW GALLERY IMAGES */}
            <div className="col-span-2 flex flex-col items-start gap-4 md:col-span-2 md:flex-row lg:col-span-2 xl:col-span-1">
              <div className="flex flex-col">
                <label className="mb-1 block text-base text-sm font-semibold text-gray-700">
                  Gallery Images
                </label>
                <FileInput
                  multiple
                  accept="image/*"
                  color={errors.overview_gallery_images ? "failure" : "gray"}
                  onChange={(e) => {
                    const files = e.target.files
                      ? Array.from(e.target.files)
                      : [];
                    setValue("overview_gallery_images", files);
                    if (overviewGalleryInputRef.current)
                      overviewGalleryInputRef.current.value = "";
                  }}
                  ref={overviewGalleryInputRef}
                />
              </div>
              {Array.isArray(overviewGalleryImages) &&
                overviewGalleryImages.length > 0 && (
                  <div className="scrollbar-thin scrollbar-thumb-blue-200 flex max-w-full flex-row items-center gap-2 overflow-x-auto rounded-lg bg-blue-50 px-3 py-2">
                    {overviewGalleryImages.map((file: File, i: number) => (
                      <div
                        key={i}
                        className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="h-full w-full rounded-md border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = overviewGalleryImages.filter(
                              (_: File, j: number) => j !== i,
                            );
                            setValue("overview_gallery_images", newFiles);
                          }}
                          className="absolute -top-2 -right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-lg ring-2 ring-white hover:bg-red-700"
                          title="Delete image"
                          tabIndex={0}
                          aria-label="Remove image"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-1">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Button Label
              </label>
              <TextInput
                {...register("overview_button_label", {
                  required: "Button label is required",
                })}
                icon={DocumentTextIcon}
                color={errors.overview_button_label ? "failure" : "gray"}
                placeholder="Download Brochure"
              />
              {errors.overview_button_label && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.overview_button_label.message}
                </p>
              )}
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-1">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Button Link
              </label>
              <TextInput
                {...register("overview_button_link", {
                  required: "Button link is required",
                })}
                icon={LinkIcon}
                color={errors.overview_button_link ? "failure" : "gray"}
                placeholder="/downloads/emami-aastha-brochure.pdf"
              />
              {errors.overview_button_link && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.overview_button_link.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Amenities Section - improved grid and selection */}
        <section className="mb-12 w-full p-0">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-blue-900">
            <CheckCircleIcon className="h-8 w-8 text-blue-600" /> Select Project
            Amenities
          </h2>
          <div className="grid w-full grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {amenitiesOptions.map((opt) => (
              <div
                key={opt}
                className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-blue-100"
              >
                <ToggleSwitch
                  id={opt.toLowerCase().replace(/ /g, "_")}
                  checked={watch("amenities").includes(
                    opt.toLowerCase().replace(/ /g, "_"),
                  )}
                  onChange={(checked) => {
                    const amenities = watch("amenities");
                    const value = opt.toLowerCase().replace(/ /g, "_");
                    if (checked) {
                      setValue("amenities", [...amenities, value]);
                    } else {
                      setValue(
                        "amenities",
                        amenities.filter((a: string) => a !== value),
                      );
                    }
                  }}
                />
                <label htmlFor={opt.toLowerCase().replace(/ /g, "_")}>
                  {opt}
                </label>
              </div>
            ))}
          </div>
          {errors.amenities && (
            <p className="mt-1 text-xs text-red-500">
              {errors.amenities.message}
            </p>
          )}
        </section>

        {/* Zones Section */}
        <section className="mb-12 w-full p-0">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-blue-900">
            <MapPinIcon className="h-8 w-8 text-blue-600" /> Project Zones
          </h2>
          {zoneFields.map((field, idx) => (
            <div
              key={field.id}
              className="mb-6 grid grid-cols-1 items-end gap-6 border-b pb-4 md:grid-cols-6"
            >
              <div className="col-span-1 md:col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Zone Title
                </label>
                <TextInput
                  {...register(`zones.${idx}.title`, {
                    required: "Zone title is required",
                  })}
                  icon={TagIcon}
                  color={errors.zones?.[idx]?.title ? "failure" : "gray"}
                  placeholder="e.g. North Zone"
                />
                {errors.zones?.[idx]?.title && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.zones[idx]?.title?.message}
                  </p>
                )}
              </div>
              {/* ZONES IMAGE */}
              <div className="col-span-1 flex flex-col items-start gap-4 md:col-span-2 md:flex-row">
                <div className="flex flex-col">
                  <label className="mb-1 block text-base text-sm font-semibold text-gray-700">
                    Zone Image
                  </label>
                  <FileInput
                    multiple
                    accept="image/*"
                    color={errors.zones?.[idx]?.image ? "failure" : "gray"}
                    onChange={(e) => {
                      const files = e.target.files
                        ? Array.from(e.target.files)
                        : [];
                      setValue(`zones.${idx}.image`, files);
                      if (zonesImageInputRefs.current[idx])
                        zonesImageInputRefs.current[idx].value = "";
                    }}
                    ref={(el) => {
                      zonesImageInputRefs.current[idx] = el;
                    }}
                  />
                </div>
                {Array.isArray(zones[idx].image) &&
                  zones[idx].image.length > 0 && (
                    <div className="scrollbar-thin scrollbar-thumb-blue-200 flex max-w-full flex-row items-center gap-2 overflow-x-auto rounded-lg bg-blue-50 px-3 py-2">
                      {zones[idx].image.map((file: File, i: number) => (
                        <div
                          key={i}
                          className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="h-full w-full rounded-md border object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = zones[idx].image.filter(
                                (_: File, j: number) => j !== i,
                              );
                              setValue(`zones.${idx}.image`, newFiles);
                            }}
                            className="absolute -top-2 -right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-lg ring-2 ring-white hover:bg-red-700"
                            title="Delete image"
                            tabIndex={0}
                            aria-label="Remove image"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
              <div className="col-span-1 mt-6 flex items-center gap-2 md:col-span-1">
                <ToggleSwitch
                  checked={zones[idx].active}
                  onChange={(checked) =>
                    setValue(`zones.${idx}.active`, checked)
                  }
                  id={`zone-active-${idx}`}
                />
                <label className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
              <div className="col-span-1 mt-6 flex items-center gap-2 md:col-span-2">
                {idx > 0 && (
                  <Button
                    type="button"
                    color="red"
                    pill
                    size="xs"
                    outline
                    className="px-6"
                    onClick={() => removeZone(idx)}
                  >
                    <MdDelete className="size-5" />
                  </Button>
                )}
                {idx === zoneFields.length - 1 && (
                  <Button
                    type="button"
                    color="green"
                    size="xs"
                    pill
                    onClick={() => {
                      appendZone(
                        { image: [], title: "", active: true },
                        { shouldFocus: false },
                      );
                      clearErrors("zones");
                    }}
                  >
                    <PlusIcon className="h-4 w-4" /> Add Zone
                  </Button>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Fresh Project & Development booleans */}
        <section className="mb-12 flex w-full flex-col gap-4 rounded-xl border border-blue-100 bg-white p-10 shadow-xl">
          <div className="flex items-center gap-4">
            <ToggleSwitch
              checked={watch("fresh_project")}
              onChange={(checked) => setValue("fresh_project", checked)}
              id="fresh_project"
            />
            <label className="text-sm font-medium text-gray-700">
              Fresh Project
            </label>
            <ToggleSwitch
              checked={watch("development")}
              onChange={(checked) => setValue("development", checked)}
              id="development"
            />
            <label className="text-sm font-medium text-gray-700">
              Development
            </label>
          </div>
        </section>

        {/* Key Highlights Section */}
        <section className="mb-12 w-full p-0">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-blue-900">
            <LightBulbIcon className="h-8 w-8 text-blue-600" /> Key Highlights
          </h2>
          {highlightsFields.map((field, idx) => (
            <div
              key={field.id}
              className="mb-4 grid grid-cols-1 gap-6 border-b pb-2 md:grid-cols-3"
            >
              <div className="col-span-1 md:col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Title
                </label>
                <TextInput
                  {...register(`highlights.${idx}.title`, {
                    required: "Highlight title is required",
                  })}
                  icon={LightBulbIcon}
                  color={errors.highlights?.[idx]?.title ? "failure" : "gray"}
                  placeholder="e.g. Prime Location"
                />
                {errors.highlights?.[idx]?.title && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.highlights[idx]?.title?.message}
                  </p>
                )}
              </div>
              <div className="col-span-1 md:col-span-1">
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <Textarea
                  {...register(`highlights.${idx}.description`, {
                    required: "Highlight description is required",
                  })}
                  color={
                    errors.highlights?.[idx]?.description ? "failure" : "gray"
                  }
                  placeholder="Enter description here..."
                  rows={2}
                />
                {errors.highlights?.[idx]?.description && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.highlights[idx]?.description?.message}
                  </p>
                )}
              </div>
              {/* HIGHLIGHTS IMAGE */}
              <div className="col-span-1 flex flex-col items-start gap-4 md:col-span-1 md:flex-row">
                <div className="flex flex-col">
                  <label className="mb-1 block text-base text-sm font-semibold text-gray-700">
                    Image
                  </label>
                  <FileInput
                    multiple
                    accept="image/*"
                    color={errors.highlights?.[idx]?.image ? "failure" : "gray"}
                    onChange={(e) => {
                      const files = e.target.files
                        ? Array.from(e.target.files)
                        : [];
                      setValue(`highlights.${idx}.image`, files);
                      if (highlightsImageInputRefs.current[idx])
                        highlightsImageInputRefs.current[idx].value = "";
                    }}
                    ref={(el) => {
                      highlightsImageInputRefs.current[idx] = el;
                    }}
                  />
                </div>
                {Array.isArray(highlights[idx].image) &&
                  highlights[idx].image.length > 0 && (
                    <div className="scrollbar-thin scrollbar-thumb-blue-200 flex max-w-full flex-row items-center gap-2 overflow-x-auto rounded-lg bg-blue-50 px-3 py-2">
                      {highlights[idx].image.map((file: File, i: number) => (
                        <div
                          key={i}
                          className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="h-full w-full rounded-md border object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = highlights[idx].image.filter(
                                (_: File, j: number) => j !== i,
                              );
                              setValue(`highlights.${idx}.image`, newFiles);
                            }}
                            className="absolute -top-2 -right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-lg ring-2 ring-white hover:bg-red-700"
                            title="Delete image"
                            tabIndex={0}
                            aria-label="Remove image"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          ))}
          <Button
            type="button"
            color="success"
            size="sm"
            onClick={() =>
              appendHighlight({ title: "", description: "", image: [] })
            }
            className="mt-2"
          >
            <PlusIcon className="h-4 w-4" /> Add Highlight
          </Button>
        </section>

        {/* Location Advantage Section */}
        <section className="mb-12 w-full p-0">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-blue-900">
            <MapPinIcon className="h-8 w-8 text-blue-600" /> Location Advantage
          </h2>
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Section Title
              </label>
              <TextInput
                {...register("location_section_title", {
                  required: "Location section title is required",
                })}
                icon={MapPinIcon}
                color={errors.location_section_title ? "failure" : "gray"}
                placeholder="Emami Aastha - Location Advantage"
              />
              {errors.location_section_title && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.location_section_title.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Section Subtitle
              </label>
              <TextInput
                {...register("location_section_subtitle", {
                  required: "Location section subtitle is required",
                })}
                icon={InformationCircleIcon}
                color={errors.location_section_subtitle ? "failure" : "gray"}
                placeholder="The perfect balance of convenience..."
              />
              {errors.location_section_subtitle && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.location_section_subtitle.message}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Map Embed URL
              </label>
              <TextInput
                {...register("map_embed_url", {
                  required: "Map embed URL is required",
                })}
                icon={LinkIcon}
                color={errors.map_embed_url ? "failure" : "gray"}
                placeholder="Enter Google Maps embed iframe link"
              />
              {errors.map_embed_url && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.map_embed_url.message}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              {locationCategoriesFields.map((field, idx) => (
                <div
                  key={field.id}
                  className="mb-4 grid grid-cols-1 items-end gap-6 border-b pb-2 md:grid-cols-3"
                >
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Category Name
                    </label>
                    <TextInput
                      {...register(`location_categories.${idx}.category`, {
                        required: "Category name is required",
                      })}
                      icon={TagIcon}
                      color={
                        errors.location_categories?.[idx]?.category
                          ? "failure"
                          : "gray"
                      }
                      placeholder="e.g., Necessities"
                    />
                    {errors.location_categories?.[idx]?.category && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.location_categories[idx]?.category?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">
                      Items (comma separated)
                    </label>
                    <TextInput
                      {...register(`location_categories.${idx}.items`, {
                        required: "Items are required",
                      })}
                      icon={CheckCircleIcon}
                      color={
                        errors.location_categories?.[idx]?.items
                          ? "failure"
                          : "gray"
                      }
                      placeholder="e.g., Hospitals, Schools, Parks"
                    />
                    {errors.location_categories?.[idx]?.items && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.location_categories[idx]?.items?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {idx > 0 && (
                      <Button
                        color="red"
                        outline
                        pill
                        size="sm"
                        className="px-6"
                        onClick={() => removeLocationCategory(idx)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {idx === locationCategoriesFields.length - 1 && (
                      <Button
                        type="button"
                        color="green"
                        size="sm"
                        pill
                        onClick={() =>
                          appendLocationCategory({ category: "", items: "" })
                        }
                      >
                        <PlusIcon className="h-4 w-4" /> Add Category
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {locationCategoriesFields.length === 0 && (
                <Button
                  type="button"
                  color="success"
                  size="sm"
                  onClick={() =>
                    appendLocationCategory({ category: "", items: "" })
                  }
                  className="mt-2"
                >
                  <PlusIcon className="h-4 w-4" /> Add Category
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Layout & Floorplan Section */}
        <section className="mb-12 w-full p-0">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-blue-900">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" /> Layout &
            Floor Plans
          </h2>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Description
            </label>
            <Textarea
              {...register("master_layout_description", {
                required: "Layout description is required",
              })}
              color={errors.master_layout_description ? "failure" : "gray"}
              placeholder="Enter description here..."
              rows={4}
            />
            {errors.master_layout_description && (
              <p className="mt-1 text-xs text-red-500">
                {errors.master_layout_description.message}
              </p>
            )}
          </div>
          {/* Header Row for Desktop */}
          <div className="hidden grid-cols-8 gap-4 px-2 pb-2 text-xs font-semibold text-gray-600 md:grid">
            <div className="col-span-2">Layout/Floor Name</div>
            <div>Image</div>
            <div>Carpet Area (sq.ft.)</div>
            <div>Saleable Area (sq.ft.)</div>
            <div>Car Parks</div>
            <div>remove</div>
          </div>
          {layoutFields.map((field, idx) => (
            <div
              key={field.id}
              className="mb-4 grid grid-cols-1 items-center gap-x-4 border-b border-gray-200 pb-4 md:grid-cols-8"
            >
              {/* Layout/Floor Name */}
              <div className="col-span-2">
                <TextInput
                  {...register(`layouts.${idx}.name`, {
                    required: "Layout name is required",
                  })}
                  icon={DocumentTextIcon}
                  color={errors.layouts?.[idx]?.name ? "failure" : "gray"}
                  placeholder="e.g. 3 BHK, 4 BHK, Master Plan"
                />
                {errors.layouts?.[idx]?.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.layouts[idx]?.name?.message}
                  </p>
                )}
              </div>
              {/* Image/FileInput */}
              <div className="col-span-2 flex flex-row items-center gap-2">
                <FileInput
                  multiple
                  accept="image/*"
                  color={errors.layouts?.[idx]?.image ? "failure" : "gray"}
                  onChange={(e) => {
                    const files = e.target.files
                      ? Array.from(e.target.files)
                      : [];
                    setValue(`layouts.${idx}.image`, files);
                    if (layoutsImageInputRefs.current[idx])
                      layoutsImageInputRefs.current[idx].value = "";
                  }}
                  ref={(el) => {
                    layoutsImageInputRefs.current[idx] = el;
                  }}
                />
                {layouts[idx].image.length > 0 && (
                  <div className="flex flex-row gap-2">
                    {layouts[idx].image.map((file, i) => (
                      <img
                        key={i}
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-16 w-16 rounded border object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
              {/* Carpet Area */}
              <div>
                <TextInput
                  {...register(`layouts.${idx}.carpet_area`, {
                    required: "Carpet area is required",
                  })}
                  icon={BuildingOffice2Icon}
                  color={
                    errors.layouts?.[idx]?.carpet_area ? "failure" : "gray"
                  }
                  placeholder="e.g. 1200"
                />
                {errors.layouts?.[idx]?.carpet_area && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.layouts[idx]?.carpet_area?.message}
                  </p>
                )}
              </div>
              {/* Saleable Area */}
              <div>
                <TextInput
                  {...register(`layouts.${idx}.saleable_area`, {
                    required: "Saleable area is required",
                  })}
                  icon={BuildingOffice2Icon}
                  color={
                    errors.layouts?.[idx]?.saleable_area ? "failure" : "gray"
                  }
                  placeholder="e.g. 1700"
                />
                {errors.layouts?.[idx]?.saleable_area && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.layouts[idx]?.saleable_area?.message}
                  </p>
                )}
              </div>
              {/* Car Parks */}
              <div>
                <TextInput
                  {...register(`layouts.${idx}.car_parks`, {
                    required: "Car parks are required",
                  })}
                  icon={UsersIcon}
                  color={errors.layouts?.[idx]?.car_parks ? "failure" : "gray"}
                  placeholder="e.g. 1"
                />
                {errors.layouts?.[idx]?.car_parks && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.layouts[idx]?.car_parks?.message}
                  </p>
                )}
              </div>
              {/* Remove Button */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={() => removeLayout(idx)}
                  size="sm"
                  pill
                  outline
                  className="px-6"
                  color={"red"}
                  tabIndex={0}
                  aria-label="Remove layout"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            color="green"
            size="sm"
            outline
            pill
            onClick={() =>
              appendLayout({
                name: "",
                image: [],
                carpet_area: "",
                saleable_area: "",
                car_parks: "",
              })
            }
            className="mt-2"
          >
            <PlusIcon className="h-4 w-4" /> Add Layout/Floor Type
          </Button>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Downloadable PDF Link
            </label>
            <TextInput
              {...register("download_pdf_url", {
                required: "PDF link is required",
              })}
              icon={DocumentTextIcon}
              color={errors.download_pdf_url ? "failure" : "gray"}
              placeholder="https://yourdomain.com/floorplan.pdf"
            />
            {errors.download_pdf_url && (
              <p className="mt-1 text-xs text-red-500">
                {errors.download_pdf_url.message}
              </p>
            )}
          </div>
        </section>

        {/* About Section */}
        <section className="mb-12 w-full p-0">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-blue-900">
            <UsersIcon className="h-8 w-8 text-blue-600" /> About Emami Section
          </h2>
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            {/* ABOUT/LEFT IMAGE */}
            <div className="flex flex-col items-start gap-4 md:flex-row">
              <div className="flex flex-col">
                <label className="mb-1 block text-base text-sm font-semibold text-gray-700">
                  Left Section - Image or Logo
                </label>
                <FileInput
                  multiple
                  accept="image/*"
                  color={errors.left_image ? "failure" : "gray"}
                  onChange={(e) => {
                    const files = e.target.files
                      ? Array.from(e.target.files)
                      : [];
                    setValue("left_image", files);
                    if (leftImageInputRef.current)
                      leftImageInputRef.current.value = "";
                  }}
                  ref={leftImageInputRef}
                />
              </div>
              {Array.isArray(leftImage) && leftImage.length > 0 && (
                <div className="scrollbar-thin scrollbar-thumb-blue-200 flex max-w-full flex-row items-center gap-2 overflow-x-auto rounded-lg bg-blue-50 px-3 py-2">
                  {leftImage.map((file: File, i: number) => (
                    <div
                      key={i}
                      className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-full w-full rounded-md border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = leftImage.filter(
                            (_: File, j: number) => j !== i,
                          );
                          setValue("left_image", newFiles);
                        }}
                        className="absolute -top-2 -right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-lg ring-2 ring-white hover:bg-red-700"
                        title="Delete image"
                        tabIndex={0}
                        aria-label="Remove image"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Left Section Title
              </label>
              <TextInput
                {...register("left_title", {
                  required: "Left section title is required",
                })}
                icon={InformationCircleIcon}
                color={errors.left_title ? "failure" : "gray"}
                placeholder="Read our Story"
              />
              {errors.left_title && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.left_title.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                About Emami Realty Title
              </label>
              <TextInput
                {...register("realty_title", {
                  required: "About Emami Realty title is required",
                })}
                icon={InformationCircleIcon}
                color={errors.realty_title ? "failure" : "gray"}
                placeholder="About Emami Realty"
              />
              {errors.realty_title && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.realty_title.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                About Emami Realty Description
              </label>
              <Textarea
                {...register("realty_description", {
                  required: "About Emami Realty description is required",
                })}
                color={errors.realty_description ? "failure" : "gray"}
                placeholder="Enter description here..."
                rows={3}
              />
              {errors.realty_description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.realty_description.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                About Emami Group Title
              </label>
              <TextInput
                {...register("group_title", {
                  required: "About Emami Group title is required",
                })}
                icon={UsersIcon}
                color={errors.group_title ? "failure" : "gray"}
                placeholder="About Emami Group"
              />
              {errors.group_title && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.group_title.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                About Emami Group Description
              </label>
              <Textarea
                {...register("group_description", {
                  required: "About Emami Group description is required",
                })}
                color={errors.group_description ? "failure" : "gray"}
                placeholder="Enter description here..."
                rows={3}
              />
              {errors.group_description && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.group_description.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Button Text
              </label>
              <TextInput
                {...register("cta_button_text", {
                  required: "Button text is required",
                })}
                icon={DocumentTextIcon}
                color={errors.cta_button_text ? "failure" : "gray"}
                placeholder="Read More"
              />
              {errors.cta_button_text && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.cta_button_text.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Button Link
              </label>
              <TextInput
                {...register("cta_button_link", {
                  required: "Button link is required",
                })}
                icon={LinkIcon}
                color={errors.cta_button_link ? "failure" : "gray"}
                placeholder="https://yourdomain.com/about"
              />
              {errors.cta_button_link && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.cta_button_link.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-center pt-8">
          <Button type="submit" size="md" disabled={mutation.isPending} pill>
            {mutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                {/* <Spinner size="sm" light /> */}
                Submitting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-6 w-6" />
                Submit Project
              </div>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
};
