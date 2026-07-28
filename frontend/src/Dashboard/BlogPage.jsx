import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  ImagePlus,
  Upload,
  Trash2,
  Save,
  Check,
  X,
  LoaderCircle,
} from "lucide-react";
import { uploadMultipleImagesToCloudinary } from "../utils/cloudinary";
import { createBlogArticle, deleteBlog, updateBlogArticle } from "../api/api";
import { toast } from "sonner";
import Blog from "../pages/Blog";
import AdminPageContainer from "@/components/admin/page/AdminPageContainer";
import AdminPageHeader from "@/components/admin/page/AdminPageHeader";
import AdminConfirmDialog from "@/components/admin/forms/AdminConfirmDialog";
import { useAdminPageMeta } from "@/context/AdminPageContext";
import { DASHBOARDBLOG, DASHBOARDHOME } from "@/constant/routerConstants";

const MAX_BLOG_IMAGES = 20;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

function BlogPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]); // both existing + new images
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useAdminPageMeta({
    title: "Blog",
    breadcrumbs: [
      { label: "Overview", href: DASHBOARDHOME },
      { label: "Blog", href: DASHBOARDBLOG },
    ],
  });

  useEffect(() => {
    window.scrollTo({top:0,behavior:"smooth"})
    setTitle("");
    setContent("");
    setImages([]);
    setSelectedImages([]);
    if (blog) {
      setTitle(blog.title || "");
      setContent(blog.content || "");
      setImages((blog.images || []).map((img) => ({ ...img, isExisting: true })));
    }
  }, [blog]);

  const handleFiles = (files) => {
    if (isSubmittingRef.current || isLoading) return;

    const selectedFiles = Array.from(files || []);
    if (images.length + selectedFiles.length > MAX_BLOG_IMAGES) {
      toast.error(`An article can contain at most ${MAX_BLOG_IMAGES} images.`);
      return;
    }

    const invalidType = selectedFiles.find(
      (file) => !ALLOWED_IMAGE_TYPES.includes(file.type),
    );
    if (invalidType) {
      toast.error(
        `${invalidType.name} is not supported. Use JPEG, PNG, WebP, GIF, or AVIF.`,
      );
      return;
    }

    const invalidSize = selectedFiles.find(
      (file) => file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES,
    );
    if (invalidSize) {
      toast.error(
        `${invalidSize.name} must be larger than 0 bytes and no more than 10 MB.`,
      );
      return;
    }

    const newImages = selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isExisting: false, 
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (isSubmittingRef.current || isLoading) return;
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => e.preventDefault();

  const toggleImageSelection = (img) => {
    if (isSubmittingRef.current || isLoading) return;
    setSelectedImages((prev) =>
      prev.includes(img) ? prev.filter((i) => i !== img) : [...prev, img]
    );
  };

  const removeImage = (img) => {
    if (isSubmittingRef.current || isLoading) return;
    setImages((prev) => prev.filter((i) => i !== img));
    setSelectedImages((prev) => prev.filter((i) => i !== img));
  };

const handleSubmit = async () => {
  if (isSubmittingRef.current || isLoading) return;
  if(!title.trim() || !content.trim() || images?.length === 0){
    toast.info("You Must Fill up some data !!")
    return ;
  }

  if (images.length > MAX_BLOG_IMAGES) {
    toast.error(`An article can contain at most ${MAX_BLOG_IMAGES} images.`);
    return;
  }

  const pendingImages = images.filter((img) => !img.isExisting);
  const invalidPendingImage = pendingImages.find(
    (img) =>
      !img.file ||
      !ALLOWED_IMAGE_TYPES.includes(img.file.type) ||
      img.file.size <= 0 ||
      img.file.size > MAX_IMAGE_SIZE_BYTES,
  );
  const invalidStoredImage = images
    .filter((img) => img.isExisting)
    .find((img) => !img.url || !img.public_id);
  if (invalidPendingImage || invalidStoredImage) {
    toast.error(
      "One or more images are invalid. Use JPEG, PNG, WebP, GIF, or AVIF images up to 10 MB.",
    );
    return;
  }

  try {
    isSubmittingRef.current = true;
    setIsLoading(true);

    let uploadedImages = [];
    if (pendingImages.length > 0) {
      uploadedImages = await uploadMultipleImagesToCloudinary(
        pendingImages.map((img) => img.file),
        "blog",
        {
          onUploaded: (uploadedImage, index) => {
            const pendingImage = pendingImages[index];
            setImages((currentImages) =>
              currentImages.map((image) =>
                image === pendingImage
                  ? { ...uploadedImage, isExisting: true }
                  : image,
              ),
            );
          },
        },
      );
    }

    const finalImages = [
      ...images
        .filter((img) => img.isExisting)
        .map(({ url, public_id }) => ({ url, public_id })),
      ...uploadedImages,
    ];

    setImages(finalImages.map((image) => ({ ...image, isExisting: true })));
    setSelectedImages([]);

    const blogData = {
      title: title.trim(),
      content,
      images: finalImages,
    };

    let response;
    if (blog?._id) {
      response = await updateBlogArticle(blog._id, blogData);
    } else {
      response = await createBlogArticle(blogData);
    }

    if (response.status >= 200 && response.status < 302) {
      toast.success(response?.data?.message || "Blog saved successfully!");
      setBlog(response?.data?.blog || null);
      setRefreshKey((value) => value + 1);
    }
  } catch (error) {
    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        "An error occurred while saving the blog.",
    );
  } finally {
    isSubmittingRef.current = false;
    setIsLoading(false);
  }
};

const onDelete = (article) => {
  setDeleteTarget(article);
};

const confirmDelete = async () => {
  if (!deleteTarget?._id) return;
  setIsDeleting(true);
  try {
    const response = await deleteBlog(deleteTarget._id);
    toast.success(response?.data?.message || "Article deleted");
    if (blog?._id === deleteTarget._id) setBlog(null);
    setRefreshKey((value) => value + 1);
    setDeleteTarget(null);
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to delete the article.");
  } finally {
    setIsDeleting(false);
  }
};

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Blog"
        description="Create and manage NAZRA editorial content."
        primaryAction={
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white font-medium rounded-lg shadow hover:bg-neutral-800 active:scale-95 transition-all duration-150"
          >
            {isLoading ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {blog?._id ? "Update" : "Publish"}
          </button>
        }
      />
      <div className="mx-auto w-full max-w-5xl space-y-8">

        <div className="space-y-2">
          <label htmlFor="article-title" className="font-medium text-neutral-600">Article Title</label>
          <input
            id="article-title"
            type="text"
            placeholder="Enter the article title..."
            value={title}
            onChange={(e) => {
              if (!isSubmittingRef.current) setTitle(e.target.value);
            }}
            disabled={isLoading}
            className="w-full border border-neutral-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none placeholder-neutral-400 text-sm shadow-sm"
          />
        </div>

        <div className="border border-neutral-300 rounded-xl shadow-sm overflow-hidden">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={(value) => {
              if (!isSubmittingRef.current) setContent(value);
            }}
            readOnly={isLoading}
            placeholder="Write your article content..."
            className="text-black min-h-[220px]"
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ImagePlus className="w-5 h-5" /> Image Gallery
          </h2>

          <button
            type="button"
            className="w-full border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-black/70 transition cursor-pointer bg-neutral-50/30"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => {
              if (!isSubmittingRef.current) fileInputRef.current?.click();
            }}
            disabled={isLoading}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="w-7 h-7 text-neutral-400" />
              <p className="text-neutral-500">
                Drag & drop images or{" "}
                <span className="text-black font-medium underline underline-offset-2">
                  click to upload
                </span>
              </p>
            </div>
          </button>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            aria-label="Choose article images"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={isLoading}
          />
        </div>

        {images.length > 0 && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {images.map((img) => {
              const isSelected = selectedImages.includes(img);
              return (
                <div
                  key={img.url}
                  className={`relative border border-neutral-200 rounded-xl overflow-hidden shadow-sm group hover:shadow-md transition-all ${
                    isSelected ? "ring-2 ring-black" : ""
                  }`}
                >
                  <img
                    src={img.url}
                    alt="preview"
                    className={`w-full h-40 object-cover ${
                      isLoading ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                    onClick={() => toggleImageSelection(img)}
                    aria-disabled={isLoading}
                  />

                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition`}
                  >
                    {isSelected ? (
                      <Check className="w-8 h-8 text-white" />
                    ) : (
                      <Trash2 className="w-6 h-6 text-white" aria-hidden="true" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeImage(img)}
                    aria-label="Remove article image"
                    disabled={isLoading}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 transition"
                  >
                    <X className="w-4 h-4 text-black" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-full">
        <Blog isAdmin={true} setBlog={setBlog} onDelete={onDelete} refreshKey={refreshKey}/>
      </div>
      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete article?"
        description={`“${deleteTarget?.title || "This article"}” will be removed from the blog.`}
        confirmLabel="Delete article"
        onConfirm={confirmDelete}
        loading={isDeleting}
        destructive
      />
    </AdminPageContainer>
  );
}

export default BlogPage;
