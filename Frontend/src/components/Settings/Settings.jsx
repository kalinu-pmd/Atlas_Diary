import React, { useState } from "react";
import { useSelector } from "react-redux";
import FileBase from "react-file-base64";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { MdVisibility, MdVisibilityOff, MdPerson, MdLock } from "react-icons/md";
import * as api from "../../api";

export default function Settings() {
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
  const [loading, setLoading] = useState(false);
  const [settingsView, setSettingsView] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [securityErrors, setSecurityErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
        await api.editUser(user.result._id, {
          name: name.trim(),
          email: email.trim(),
          bio: bio.trim(),
          location: location.trim(),
          profileImage,
        });
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
    <div className="min-h-screen bg-off-white py-12">
      <div className="max-w-md mx-auto px-4">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-off-white border border-dark-green rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSettingsView("profile")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    settingsView === "profile"
                      ? "bg-dark-green text-off-white border-dark-green"
                      : "bg-off-white text-text-gray border-dark-green/10 hover:bg-light-green/20 hover:text-dark-green"
                  }`}
                >
                  Profile Settings
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsView("security")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    settingsView === "security"
                      ? "bg-dark-green text-off-white border-dark-green"
                      : "bg-off-white text-text-gray border-dark-green/10 hover:bg-light-green/20 hover:text-dark-green"
                  }`}
                >
                  Account Security
                </button>
              </div>
              <p className="text-[11px] text-text-gray max-w-[240px] sm:text-right">
                {settingsView === "profile"
                  ? "Update your public profile details shown across your account."
                  : "Change your password securely. Fill all password fields to update it."}
              </p>
            </div>

            {settingsView === "profile" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <MdPerson size={16} className="text-dark-green" />
                  <h2 className="text-lg font-bold text-text-dark">Profile Settings</h2>
                </div>

              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-dark-green block mb-1">Name</label>
                <input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full px-3 py-2 rounded-md border border-dark-green focus:outline-none focus:border-light-green hover:border-light-green transition-colors" 
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-dark-green block mb-1">Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full px-3 py-2 rounded-md border border-dark-green focus:outline-none focus:border-light-green hover:border-light-green transition-colors" 
                />
              </div>

              {/* Short bio */}
              <div>
                <label className="text-xs font-semibold text-dark-green block mb-1">Short bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-dark-green focus:outline-none focus:border-light-green hover:border-light-green transition-colors text-sm resize-y"
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-semibold text-dark-green block mb-1">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Tilaurakot, Nepal"
                  className="w-full px-3 py-2 rounded-md border border-dark-green focus:outline-none focus:border-light-green hover:border-light-green transition-colors text-sm"
                />
              </div>

              {/* Profile picture */}
              <div>
                <label className="text-xs font-semibold text-dark-green block mb-2">Profile picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-light-green text-white flex items-center justify-center text-lg font-bold overflow-hidden border-2 border-dark-green">
                    {profileImage ? (
                      <img src={profileImage} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{name?.charAt(0)?.toUpperCase() || "U"}</span>
                    )}
                  </div>
                  <FileBase
                    type="file"
                    multiple={false}
                    onDone={({ base64 }) => setProfileImage(base64)}
                  />
                </div>
              </div>
              </div>
            )}

            {settingsView === "security" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MdLock size={16} className="text-orange" />
                  <h2 className="text-lg font-bold text-text-dark">Account Security</h2>
                </div>

              {/* Current password */}
              <div>
                <label className="text-xs font-semibold text-dark-green block mb-1">Current password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setSecurityErrors((prev) => ({ ...prev, currentPassword: "" }));
                    }}
                    placeholder="Enter your current password"
                    className={`w-full px-3 py-2 rounded-md border focus:outline-none transition-colors pr-10 ${
                      securityErrors.currentPassword
                        ? "border-red-500 focus:border-red-500"
                        : "border-dark-green focus:border-light-green hover:border-light-green"
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

              {/* New password */}
              <div>
                <label className="text-xs font-semibold text-dark-green block mb-1">New password <span className="text-text-gray text-xs font-normal">(leave blank to keep current)</span></label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setSecurityErrors((prev) => ({ ...prev, newPassword: "" }));
                    }}
                    placeholder="Enter new password"
                    className={`w-full px-3 py-2 rounded-md border focus:outline-none transition-colors pr-10 ${
                      securityErrors.newPassword
                        ? "border-red-500 focus:border-red-500"
                        : "border-dark-green focus:border-light-green hover:border-light-green"
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

              {/* Confirm new password */}
              <div>
                <label className="text-xs font-semibold text-dark-green block mb-1">Confirm new password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setSecurityErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    placeholder="Confirm new password"
                    className={`w-full px-3 py-2 rounded-md border focus:outline-none transition-colors pr-10 ${
                      securityErrors.confirmPassword
                        ? "border-red-500 focus:border-red-500"
                        : "border-dark-green focus:border-light-green hover:border-light-green"
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

              <div className="rounded-lg border border-dark-green/20 bg-light-green/10 p-3">
                <p className="text-xs font-semibold text-text-dark mb-2">Password must include:</p>
                <div className="grid grid-cols-1 gap-1">
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
              </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex gap-3 justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 rounded-md font-bold text-sm transition-all duration-150 ${
                loading
                  ? "bg-light-green/60 text-text-gray cursor-wait animate-pulse"
                  : "bg-light-green hover:bg-light-green-hover text-text-dark hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              }`}
            >
              {loading
                ? "Updating..."
                : settingsView === "profile"
                  ? "Update"
                  : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
