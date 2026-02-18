import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import * as api from "../../api";

export default function Settings() {
  const user = useSelector((state) => state.auth.authData);
  const history = useHistory();
  const [name, setName] = useState(user?.result?.name || "");
  const [email, setEmail] = useState(user?.result?.email || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return toast.error("Name and email required");
    setLoading(true);
    try {
      const id = user?.result?._id || (user?.result?.googleId ?? null);
      await api.editUser(user.result._id, {
        name: name.trim(),
        email: email.trim(),
        ...(password.trim() ? { password } : {}),
      });
      toast.success("Profile updated");
      history.push("/posts");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-off-white py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-off-white border border-dark-green rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-text-dark mb-3">Account Settings</h2>
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-dark-green">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded border border-dark-green focus:outline-none" />

            <label className="text-xs font-semibold text-dark-green">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded border border-dark-green focus:outline-none" />

            <label className="text-xs font-semibold text-dark-green">New Password <span className="text-text-gray">(leave blank to keep)</span></label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded border border-dark-green focus:outline-none" />

            <div className="flex gap-3 justify-end mt-2">
              <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-light-green hover:bg-light-green-hover font-bold">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
