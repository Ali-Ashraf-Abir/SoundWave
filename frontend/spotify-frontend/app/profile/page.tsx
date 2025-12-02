"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, changePassword, deleteAccount } from "@/lib/auth";
import { User, Mail, Camera, Lock, LogOut, Trash2, Save, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout, token, refreshUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    profileImage: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || "",
      });
    }
  }, [loading, user, router]);
  console.log(user)
  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleUpdateProfile = async () => {
    if (!token) return;
    setIsUpdating(true);

    try {
      await updateProfile(form);
      await refreshUser();
      showMessage("success", "Profile updated successfully!");
    } catch (err: any) {
      showMessage("error", err.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!token) return;
    
    if (passwordForm.newPassword.length < 6) {
      showMessage("error", "New password must be at least 6 characters");
      return;
    }

    setIsUpdating(true);

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      showMessage("success", "Password changed successfully!");
    } catch (err: any) {
      showMessage("error", err.message || "Failed to change password");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!token) return;
    setIsUpdating(true);

    try {
      await deleteAccount();
      logout();
      router.push("/");
    } catch (err: any) {
      showMessage("error", err.message || "Failed to delete account");
      setIsUpdating(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <div className="bg-secondary border-b border-divider">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href='/home'><h1 className="text-xl font-bold text-brand cursor-pointer">Home</h1></Link>
          <h1 className="text-2xl font-bold text-primary">Account Settings</h1>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex items-center gap-2 px-4 py-2 text-secondary hover:text-primary
                     transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Message Banner */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
            message.type === "success" 
              ? "bg-success/10 border-success" 
              : "bg-error/10 border-error"
          }`}>
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${message.type === "success" ? "text-success" : "text-error"}`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-secondary rounded-2xl p-6 mb-6 shadow-custom-lg border border-default">
          <div className="flex items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-3xl font-bold text-black shadow-custom-md">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase()
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-button rounded-full flex items-center justify-center shadow-custom-md hover:bg-primary-hover transition-colors">
                <Camera className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-primary mb-1">{user.name}</h2>
              <p className="text-secondary mb-3">{user.email}</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                  Premium Member
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-secondary rounded-2xl shadow-custom-lg border border-default overflow-hidden">
          <div className="flex border-b border-divider">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === "profile"
                  ? "text-primary bg-tertiary border-b-2 border-primary"
                  : "text-secondary hover:text-primary hover:bg-tertiary/50"
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === "security"
                  ? "text-primary bg-tertiary border-b-2 border-primary"
                  : "text-secondary hover:text-primary hover:bg-tertiary/50"
              }`}
            >
              Security
            </button>
          </div>

          <div className="p-6">
            {activeTab === "profile" ? (
              <div className="space-y-6">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-lg bg-elevated text-primary 
                               border border-default outline-none 
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-lg bg-elevated text-primary 
                               border border-default outline-none 
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Profile Image URL */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Profile Image URL
                  </label>
                  <div className="relative">
                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={form.profileImage}
                      onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-lg bg-elevated text-primary 
                               border border-default outline-none 
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                  className="w-full bg-brand text-black font-bold py-3 rounded-lg 
                           hover:bg-primary-hover hover-lift
                           disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-custom-md hover:shadow-custom-lg
                           transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Change Password Section */}
                <div className="pb-6 border-b border-divider">
                  <h3 className="text-lg font-semibold text-primary mb-4">Change Password</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 rounded-lg bg-elevated text-primary 
                                   border border-default outline-none 
                                   focus:border-primary focus:ring-2 focus:ring-primary/20
                                   transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 rounded-lg bg-elevated text-primary 
                                   border border-default outline-none 
                                   focus:border-primary focus:ring-2 focus:ring-primary/20
                                   transition-all duration-200"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleChangePassword}
                      disabled={isUpdating}
                      className="w-full bg-button text-black font-bold py-3 rounded-lg 
                               hover:bg-primary-hover hover-lift
                               disabled:opacity-50 disabled:cursor-not-allowed
                               shadow-custom-md hover:shadow-custom-lg
                               transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Delete Account Section */}
                <div>
                  <h3 className="text-lg font-semibold text-error mb-2">Danger Zone</h3>
                  <p className="text-sm text-secondary mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-6 py-3 bg-error/10 text-error font-semibold rounded-lg 
                               border border-error hover:bg-error hover:text-white
                               transition-all duration-200 flex items-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete Account
                    </button>
                  ) : (
                    <div className="bg-error/10 border border-error rounded-lg p-4">
                      <p className="text-sm text-error mb-4 font-medium">
                        Are you absolutely sure? This action cannot be undone.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={isUpdating}
                          className="flex-1 px-4 py-2 bg-error text-white font-semibold rounded-lg 
                                   hover:bg-error/90 transition-colors disabled:opacity-50"
                        >
                          Yes, Delete Forever
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 px-4 py-2 bg-tertiary text-primary font-semibold rounded-lg 
                                   hover:bg-elevated transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}