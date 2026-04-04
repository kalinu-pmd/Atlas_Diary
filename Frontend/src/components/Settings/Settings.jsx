import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import {
  MdVisibility,
  MdVisibilityOff,
  MdPerson,
  MdLock,
  MdClose,
} from "react-icons/md";
import * as api from "../../api";
import { AUTH } from "../../constants/actionTypes";

export default function Settings() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.authData);
  const history = useHistory();
  const [name, setName] = useState(user?.result?.name || "");
  const [email, setEmail] = useState(user?.result?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bio, setBio] = useState(user?.result?.bio || "");
  const [location, setLocation] = useState(user?.result?.location || "");
  const [profileImage, setProfileImage] = useState(
    user?.result?.profileImage || user?.result?.imageUrl || ""
  );
  const [selectedPhotoName, setSelectedPhotoName] = useState("");
  const [loading, setLoading] = useState(false);
  const [settingsView, setSettingsView] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const photoInputRef = useRef(null);
  const [securityErrors, setSecurityErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleCancel = () => {
    history.push("/posts");
  };

  const handleRemovePhoto = () => {
    setProfileImage(user?.result?.profileImage || user?.result?.imageUrl || "");
    setSelectedPhotoName("");
    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
    toast.info("Selected photo removed.");
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(String(reader.result || ""));
      setSelectedPhotoName(file.name);
    };
    reader.onerror = () => {
      toast.error("Could not read the selected image.");
    };
    reader.readAsDataURL(file);
  };

  const passwordChecks = {
    minLength: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[@$!%*?&]/.test(newPassword),
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (settingsView === "profile") {
      if (!name.trim() || !email.trim()) {
        return toast.error("Name and email required");
      }
    }

    if (settingsView === "security") {
      const nextErrors = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };

      if (!currentPassword.trim()) {
        nextErrors.currentPassword = "Current password is required.";
      }
      if (!newPassword.trim()) {
        nextErrors.newPassword = "New password is required.";
      }
      if (newPassword.trim() && !Object.values(passwordChecks).every(Boolean)) {
        nextErrors.newPassword = "Password does not meet the required format.";
      }
      if (!confirmPassword.trim()) {
        nextErrors.confirmPassword = "Confirm password is required.";
      }
      if (
        newPassword.trim() &&
        confirmPassword.trim() &&
        newPassword !== confirmPassword
      ) {
        nextErrors.confirmPassword = "New password and confirm password do not match.";
      }

      setSecurityErrors(nextErrors);
      if (Object.values(nextErrors).some(Boolean)) {
        return;
      }
    }

    setLoading(true);
    try {
      if (settingsView === "profile") {
        const { data } = await api.editUser(user.result._id, {
          name: name.trim(),
          email: email.trim(),
          bio: bio.trim(),
          location: location.trim(),
          profileImage,
        });

        if (data?.user) {
          dispatch({
            type: AUTH,
            payload: {
              ...user,
              result: data.user,
            },
          });
        }
        toast.success("Profile updated");
      } else {
        await api.editUser(user.result._id, {
          password: newPassword.trim(),
          currentPassword: currentPassword.trim(),
        });
        toast.success("Password updated");
      }
      history.push("/posts");
    } catch (err) {
      console.error(err);
      const serverMessage =
        err?.response?.data?.message ||
        (settingsView === "profile" ? "Failed to update profile" : "Failed to update password");

      if (settingsView === "security") {
        const lowerMessage = String(serverMessage).toLowerCase();
        if (
          lowerMessage.includes("current password") ||
          lowerMessage.includes("incorrect password") ||
          lowerMessage.includes("wrong password") ||
          lowerMessage.includes("invalid password") ||
          lowerMessage.includes("invalid credentials") ||
          lowerMessage.includes("unauthorized")
        ) {
          setSecurityErrors((prev) => ({
            ...prev,
            currentPassword: "Current password is incorrect.",
          }));
        } else if (lowerMessage.includes("new password") || lowerMessage.includes("password")) {
          setSecurityErrors((prev) => ({ ...prev, newPassword: serverMessage }));
        }
      }

      toast.error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(175,250,1,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(47,107,79,0.10),_transparent_30%),#f7f6f2] py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-dark-green/70 mb-2">
            Account center
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-text-dark tracking-tight mb-2">
            Profile and Security
          </h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-[28px] border border-dark-green/10 bg-white/85 backdrop-blur-md shadow-[0_18px_50px_rgba(12,52,44,0.10)] overflow-hidden">
            <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-dark-green/10 bg-gradient-to-r from-off-white via-light-green/10 to-off-white">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSettingsView("profile")}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                      settingsView === "profile"
                        ? "bg-dark-green text-off-white border-dark-green shadow-sm"
                        : "bg-white/80 text-text-gray border-dark-green/10 hover:bg-light-green/20 hover:text-dark-green"
                    }`}
                  >
                    Profile Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsView("security")}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                      settingsView === "security"
                        ? "bg-dark-green text-off-white border-dark-green shadow-sm"
                        : "bg-white/80 text-text-gray border-dark-green/10 hover:bg-light-green/20 hover:text-dark-green"
                    }`}
                  >
                    Account Security
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-text-gray max-w-md sm:text-right">
                  {settingsView === "profile"
                    ? "Update the details people see on your profile and posts."
                    : "Change your password securely with current password verification."}
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {settingsView === "profile" && (
                <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] items-start">
                  <div className="rounded-2xl border border-dark-green/10 bg-gradient-to-br from-off-white to-light-green/10 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <MdPerson size={18} className="text-dark-green" />
                      <h2 className="text-lg font-extrabold text-text-dark">Profile Settings</h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-dark-green block mb-1.5">Name</label>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-dark-green/15 bg-white focus:outline-none focus:border-light-green hover:border-light-green transition-colors shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-dark-green block mb-1.5">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-dark-green/15 bg-white focus:outline-none focus:border-light-green hover:border-light-green transition-colors shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-dark-green block mb-1.5">Short bio</label>
                        <textarea
                          rows={4}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-dark-green/15 bg-white focus:outline-none focus:border-light-green hover:border-light-green transition-colors text-sm resize-y shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-dark-green block mb-1.5">Location</label>
                        <input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Tilaurakot, Nepal"
                          className="w-full px-4 py-3 rounded-xl border border-dark-green/15 bg-white focus:outline-none focus:border-light-green hover:border-light-green transition-colors text-sm shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dark-green/10 bg-white p-5 shadow-sm lg:sticky lg:top-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-dark-green to-light-green flex items-center justify-center text-white font-black text-lg overflow-hidden shadow-sm">
                        {profileImage ? (
                          <img src={profileImage} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{name?.charAt(0)?.toUpperCase() || "U"}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-dark">Profile picture</p>
                        <p className="text-xs text-text-gray">Choose a clear image for your account.</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-dashed border-dark-green/20 bg-off-white/80 p-4">
                      <label className="text-xs font-bold text-dark-green block mb-2">
                        Choose image
                      </label>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="block w-full text-sm text-text-gray file:mr-3 file:rounded-lg file:border-0 file:bg-dark-green file:px-4 file:py-2 file:text-sm file:font-bold file:text-off-white hover:file:bg-dark-green-hover"
                      />
                      {selectedPhotoName && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-light-green/20 border border-light-green/40 px-3 py-1.5 text-sm text-dark-green font-semibold">
                          <span className="truncate max-w-[200px] sm:max-w-[240px]">
                            {selectedPhotoName}
                          </span>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="inline-flex items-center justify-center rounded-full bg-white text-orange hover:text-orange-hover transition-colors"
                            aria-label="Remove selected photo"
                          >
                            <MdClose size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={!selectedPhotoName}
                      className={`mt-3 w-full rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                        selectedPhotoName
                          ? "border-orange/30 bg-orange/10 text-orange hover:bg-orange/15"
                          : "border-dark-green/10 bg-off-white text-text-gray cursor-not-allowed"
                      }`}
                    >
                      Remove selected photo
                    </button>

                    <div className="mt-5 rounded-xl bg-light-green/10 border border-light-green/30 p-4">
                      <p className="text-xs font-bold text-text-dark mb-2">Profile preview</p>
                      <div className="space-y-1 text-sm text-text-dark">
                        <p><span className="font-semibold text-dark-green">Name:</span> {name || "-"}</p>
                        <p><span className="font-semibold text-dark-green">Location:</span> {location || "-"}</p>
                        <p className="line-clamp-3"><span className="font-semibold text-dark-green">Bio:</span> {bio || "No bio added yet."}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsView === "security" && (
                <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr] items-start">
                  <div className="rounded-2xl border border-dark-green/10 bg-gradient-to-br from-off-white to-light-green/10 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <MdLock size={18} className="text-orange" />
                      <h2 className="text-lg font-extrabold text-text-dark">Account Security</h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-dark-green block mb-1.5">Current password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => {
                              setCurrentPassword(e.target.value);
                              setSecurityErrors((prev) => ({ ...prev, currentPassword: "" }));
                            }}
                            placeholder="Enter your current password"
                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors pr-11 bg-white shadow-sm ${
                              securityErrors.currentPassword
                                ? "border-red-500 focus:border-red-500"
                                : "border-dark-green/15 focus:border-light-green hover:border-light-green"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-green hover:text-light-green transition-colors"
                            tabIndex={-1}
                          >
                            {showCurrentPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                          </button>
                        </div>
                        {securityErrors.currentPassword && (
                          <p className="mt-1 text-xs text-red-600">{securityErrors.currentPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-dark-green block mb-1.5">New password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              setSecurityErrors((prev) => ({ ...prev, newPassword: "" }));
                            }}
                            placeholder="Enter new password"
                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors pr-11 bg-white shadow-sm ${
                              securityErrors.newPassword
                                ? "border-red-500 focus:border-red-500"
                                : "border-dark-green/15 focus:border-light-green hover:border-light-green"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-green hover:text-light-green transition-colors"
                            tabIndex={-1}
                          >
                            {showNewPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                          </button>
                        </div>
                        {securityErrors.newPassword && (
                          <p className="mt-1 text-xs text-red-600">{securityErrors.newPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-dark-green block mb-1.5">Confirm new password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setSecurityErrors((prev) => ({ ...prev, confirmPassword: "" }));
                            }}
                            placeholder="Confirm new password"
                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors pr-11 bg-white shadow-sm ${
                              securityErrors.confirmPassword
                                ? "border-red-500 focus:border-red-500"
                                : "border-dark-green/15 focus:border-light-green hover:border-light-green"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-green hover:text-light-green transition-colors"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                          </button>
                        </div>
                        {securityErrors.confirmPassword && (
                          <p className="mt-1 text-xs text-red-600">{securityErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dark-green/10 bg-white p-5 shadow-sm lg:sticky lg:top-6">
                    <p className="text-sm font-bold text-text-dark mb-3">Password rules</p>
                    <div className="grid grid-cols-1 gap-2">
                      <p className={`text-[11px] ${passwordChecks.minLength ? "text-dark-green" : "text-text-gray"}`}>
                        {passwordChecks.minLength ? "✓" : "•"} At least 8 characters
                      </p>
                      <p className={`text-[11px] ${passwordChecks.upper ? "text-dark-green" : "text-text-gray"}`}>
                        {passwordChecks.upper ? "✓" : "•"} One uppercase letter (A-Z)
                      </p>
                      <p className={`text-[11px] ${passwordChecks.lower ? "text-dark-green" : "text-text-gray"}`}>
                        {passwordChecks.lower ? "✓" : "•"} One lowercase letter (a-z)
                      </p>
                      <p className={`text-[11px] ${passwordChecks.number ? "text-dark-green" : "text-text-gray"}`}>
                        {passwordChecks.number ? "✓" : "•"} One number (0-9)
                      </p>
                      <p className={`text-[11px] ${passwordChecks.special ? "text-dark-green" : "text-text-gray"}`}>
                        {passwordChecks.special ? "✓" : "•"} One special character (@$!%*?&)
                      </p>
                    </div>

                    <div className="mt-5 rounded-xl bg-light-green/10 border border-light-green/30 p-4 text-xs text-text-dark leading-relaxed">
                      Keep your password strong and unique. Avoid reusing passwords from other sites.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 rounded-full font-bold text-sm transition-all duration-150 border border-dark-green/15 bg-white/80 text-dark-green hover:bg-light-green/20 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-150 shadow-sm ${
                loading
                  ? "bg-light-green/60 text-text-gray cursor-wait animate-pulse"
                  : "bg-dark-green hover:bg-dark-green-hover text-off-white hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              }`}
            >
              {loading
                ? "Updating..."
                : settingsView === "profile"
                  ? "Save Profile"
                  : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
