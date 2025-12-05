"use client";

import { useState, ChangeEvent } from "react";
import { api } from "@/lib/api";
import Image from "next/image";
import { Song } from "@/types";
import SongIcon from "./SongIcon";
import { SuccessModal, ErrorModal, ConfirmModal } from "../components/modals/Modals";

interface EditSongModalProps {
  song: Song;
  onClose: () => void;
  onUpdated: (s: Song) => void;
}

export default function EditSongModal({ song, onClose, onUpdated }: EditSongModalProps) {
  const [form, setForm] = useState({
    title: song.title,
    artist: song.artist,
    album: song.album || "",
    genre: song.genre || "",
  });

  const [coverPreview, setCoverPreview] = useState<string | undefined>(song.coverImage);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  
  // Modal states
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hasChanges = 
    form.title !== song.title ||
    form.artist !== song.artist ||
    form.album !== (song.album || "") ||
    form.genre !== (song.genre || "") ||
    coverFile !== null;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleCover(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  }

  function handleClose() {
    if (hasChanges) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  }

  async function saveChanges() {
    setSaving(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("artist", form.artist);
      formData.append("album", form.album);
      formData.append("genre", form.genre);

      if (coverFile) formData.append("coverImage", coverFile);

      const res = await api.put(`/songs/${song._id}`, formData);
      onUpdated(res.data as Song);
      setShowSuccess(true);
      
      // Auto-close after showing success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || "Failed to update song");
      setShowError(true);
    }

    setSaving(false);
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div 
          className="bg-[#2b2b2b] w-full max-w-md rounded-xl p-5 text-white relative animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-4">Edit Song</h2>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col justify-center items-center w-full">
              {coverPreview ? (
                <Image
                  src={coverPreview}
                  alt="cover preview"
                  width={300}
                  height={300}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-[300px] h-[300px] bg-primary flex flex-col gap-[20px] justify-center items-center rounded-lg">
                  <div>No Image Found</div>
                  <SongIcon index={2} />
                </div>
              )}
            </div>

            <label className="cursor-pointer">
              <div className="bg-[#1a1a1a] px-3 py-2 rounded text-center hover:bg-[#252525] transition-colors">
                Choose Cover Image
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleCover} 
                className="hidden"
              />
            </label>

            {["title", "artist", "album", "genre"].map((field) => (
              <input
                key={field}
                name={field}
                value={(form as any)[field]}
                onChange={handleChange}
                className="bg-[#1a1a1a] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#1DB954] transition-all"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              />
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={saveChanges}
              disabled={saving || !hasChanges}
              className="px-4 py-2 bg-[#1DB954] rounded hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Song Updated!"
        message="Your changes have been saved successfully."
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Update Failed"
        message={errorMessage}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={onClose}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to close without saving?"
        confirmText="Discard"
        cancelText="Keep Editing"
        variant="warning"
      />
    </>
  );
}