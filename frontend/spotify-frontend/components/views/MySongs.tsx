"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import EditSongModal from "../EditSongsModal";
import { Song } from "@/types";
import SongIcon from "../SongIcon";
import { ConfirmModal, SuccessModal, ErrorModal } from "../modals/Modals";

export default function MySongsPage() {
  const { user } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);
  
  // Modal states
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function loadSongs() {
    if (!user?._id) return;

    setLoading(true);
    try {
      const res = await api.get(`/songs?uploadedBy=${user._id}`);
      setSongs(res?.data as Song[]);
    } catch (e) {
      console.error("Failed to fetch songs:", e);
    }
    setLoading(false);
  }

  function handleDeleteClick(song: Song) {
    setSongToDelete(song);
    setShowConfirm(true);
  }

  async function confirmDelete() {
    if (!songToDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/songs/${songToDelete._id}`);
      setSongs(prev => prev.filter(song => song._id !== songToDelete._id));
      setShowSuccess(true);
      setSongToDelete(null);
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.response?.data?.error || "Failed to delete song. Please try again.");
      setShowError(true);
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    loadSongs();
  }, [user?._id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-white" />
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-semibold mb-4">My Uploaded Songs</h1>
      {songs?.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#B3B3B3] text-lg mb-2">You haven't uploaded any songs yet.</p>
          <p className="text-[#6A6A6A]">Start by uploading your first track!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {songs?.map((song, index) => (
            <div
              key={song?._id}
              className="bg-[#1f1f1f] rounded-xl relative p-4 flex flex-col gap-3 shadow hover:bg-[#252525] transition-colors"
            >
              <div className={`w-full aspect-square ${song.color ? `bg-gradient-to-br ${song.color}` : 'bg-[#282828]'} rounded-md flex items-center justify-center shadow-custom-md overflow-hidden relative`}>
                {song.coverImage ? (
                  <Image 
                    src={song.coverImage} 
                    alt={`${song.title}`} 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <SongIcon index={index} />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-lg truncate">{song?.title}</h2>
                <p className="text-sm text-gray-400 truncate">{song?.artist}</p>
                {song?.album && (
                  <p className="text-xs text-gray-500 truncate">{song?.album}</p>
                )}
              </div>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => setSelectedSong(song)}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-brand hover:bg-brand-hover transition-all hover:scale-105 flex-1"
                >
                  <Pencil size={18} /> Edit
                </button>

                <button
                  onClick={() => handleDeleteClick(song)}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-[#E22134] hover:bg-[#ff2d42] transition-all hover:scale-105 flex-1"
                >
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Song Modal */}
      {selectedSong && (
        <EditSongModal
          song={selectedSong}
          onClose={() => setSelectedSong(null)}
          onUpdated={(updated: Song) => {
            setSongs(prev =>
              prev.map(s => (s._id === updated._id ? updated : s))
            );
            setSelectedSong(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSongToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Song?"
        message={`Are you sure you want to delete "${songToDelete?.title}"? This action cannot be undone.`}
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="danger"
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Song Deleted!"
        message="The song has been successfully removed from your library."
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Delete Failed"
        message={errorMessage}
      />
    </div>
  );
}