"use client";

import { useState } from "react";
import { createUserByAdmin } from "@/lib/actions/user.actions";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUserModal({ onClose, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      toast.error("Please fill all fields");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    const result = await createUserByAdmin({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
    });

    setLoading(false);

    if (result.success) {
      toast.success("User created successfully");
      onSuccess();
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-10 w-[650px] shadow-2xl">
        <h2 className="text-2xl font-semibold text-center mb-8">
          Create new user
        </h2>

        {/* Full Name */}
        <input
          placeholder="Full name"
          className="w-full create-user-input mb-5"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        {/* Email */}
        <input
          placeholder="Email"
          className="w-full create-user-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password + Role side by side */}
        <div className="grid grid-cols-2 gap-5 ">
          <input
            type="password"
            placeholder="Password"
            className="create-user-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <select
            className="create-user-input"
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "user")}
          >
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Confirm Password */}
        <input
          type="password"
          placeholder="Confirm password"
          className="w-full create-user-input"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 transition "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-brand text-white hover:bg-blue transition duration-200"
          >
            {loading ? "Creating..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
