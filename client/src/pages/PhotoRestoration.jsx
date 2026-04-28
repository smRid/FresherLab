import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";

const restorationOptions = [
  {
    value: "scratch_removal",
    label: "Scratch & Crease Remover",
    description: "Remove scratches and creases from old photos."
  },
  {
    value: "colorize",
    label: "Black & White to Color",
    description: "Colorize black & white vintage photos."
  },
  {
    value: "deblur",
    label: "Blur to Sharp Detail Enhancer",
    description: "Enhance sharpness and detail in blurred images."
  },
  {
    value: "face_repair",
    label: "Face Clarity & Repair",
    description: "Repair and enhance face clarity for vintage portraits."
  }
];

const PhotoRestoration = () => {
  const [selectedType, setSelectedType] = useState(restorationOptions[0].value);
  const [file, setFile] = useState(null);
  const [restoredUrl, setRestoredUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setRestoredUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select an image file.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("restoration_type", selectedType);
    try {
      const { data } = await axios.post("/api/ai/restore-photo", formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "Content-Type": "multipart/form-data"
        }
      });
      if (data.success) {
        setRestoredUrl(data.content);
        toast.success("Photo restored successfully!");
      } else {
        toast.error(data.message || "Restoration failed.");
      }
    } catch {
      toast.error("Error restoring photo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Photo Restoration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-2">Choose Restoration Type:</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            {restorationOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            {restorationOptions.find(opt => opt.value === selectedType)?.description}
          </p>
        </div>
        <div>
          <label className="block font-semibold mb-2">Upload Photo:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Restoring..." : "Restore Photo"}
        </button>
      </form>
      {restoredUrl && (
        <div className="mt-6 text-center">
          <h3 className="font-semibold mb-2">Restored Photo:</h3>
          <img src={restoredUrl} alt="Restored" className="mx-auto rounded shadow max-h-96" />
          <a href={restoredUrl} target="_blank" rel="noopener noreferrer" className="block mt-2 text-blue-600 underline">Download</a>
        </div>
      )}
    </div>
  );
};

export default PhotoRestoration;
