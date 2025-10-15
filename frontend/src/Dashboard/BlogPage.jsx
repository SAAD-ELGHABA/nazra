import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  ImagePlus,
  Upload,
  Trash2,
  Save,
  Edit3,
  Check,
  X,
} from "lucide-react";

function BlogPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const newImages = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => e.preventDefault();

  const toggleImageSelection = (img) => {
    setSelectedImages((prev) =>
      prev.includes(img)
        ? prev.filter((i) => i !== img)
        : [...prev, img]
    );
  };

  const removeImage = (img) => {
    setImages((prev) => prev.filter((i) => i !== img));
    setSelectedImages((prev) => prev.filter((i) => i !== img));
  };

  const handleSubmit = () => {
    const blogData = {
      title,
      content,
      images: images.map((img) => img.file),
    };
    console.log("📰 Submitting Blog Article:", blogData);
  };

  return (
    <div className="min-h-screen bg-white text-black px-8 py-10 flex justify-center">
      <div className="w-full max-w-5xl space-y-10">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
          <h1 className="md:text-3xl font-semibold flex items-center gap-2">
            <Edit3 className="w-3 h-3 md:w-6 md:h-6 text-black" />
            Blog Editor
          </h1>

          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white font-medium rounded-lg shadow hover:bg-neutral-800 active:scale-95 transition-all duration-150"
          >
            <Save className="w-4 h-4" />
            Publish
          </button>
        </div>

        <div className="space-y-2">
          <label className=" font-medium text-neutral-600">
            Article Title
          </label>
          <input
            type="text"
            placeholder="Enter the article title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-neutral-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none placeholder-neutral-400 text-sm shadow-sm"
          />
        </div>

        <div className="border border-neutral-300 rounded-xl shadow-sm overflow-hidden">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            placeholder="Write your article content..."
            className="text-black min-h-[220px]"
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ImagePlus className="w-5 h-5" /> Image Gallery
          </h2>

          <div
            className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-black/70 transition cursor-pointer bg-neutral-50/30"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current.click()}
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
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
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
                    className="w-full h-40 object-cover cursor-pointer"
                    onClick={() => toggleImageSelection(img)}
                  />

                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition`}
                  >
                    {isSelected ? (
                      <Check className="w-8 h-8 text-white" />
                    ) : (
                      <Trash2
                        onClick={() => removeImage(img)}
                        className="w-6 h-6 text-white cursor-pointer hover:text-red-400 transition"
                      />
                    )}
                  </div>

                  <button
                    onClick={() => removeImage(img)}
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
    </div>
  );
}

export default BlogPage;
