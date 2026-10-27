
import React, {
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";

import axios from "axios";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Calendar,
  Lock,
  Edit,
  X,
} from "lucide-react";

import { profileStyles } from "../assets/dummystyle";
import {
  toast,
  ToastContainer,
} from "react-toastify";
import { getToken, clearToken, API_URL } from "../utils/auth";

const BASE_URL = API_URL;

Modal.setAppElement("#root");

// ===============================
// Password Input Component
// ===============================

const PasswordInput = memo(
  ({
    name,
    label,
    value,
    error,
    showField,
    onToggle,
    onChange,
    disabled,
  }) => {
    return (
      <div>
        <label className={profileStyles.passwordLabel}>
          {label}
        </label>

        <div className={profileStyles.passwordContainer}>
          <input
            type={showField ? "text" : "password"}
            name={name}
            value={value}
            onChange={onChange}
            className={`${profileStyles.inputWithError} ${
              error
                ? "border-red-300"
                : "border-gray-200"
            }`}
            placeholder={`Enter ${label.toLowerCase()}`}
            disabled={disabled}
          />

          <button
            type="button"
            onClick={onToggle}
            className={profileStyles.passwordToggle}
            disabled={disabled}
          >
            {showField ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {error && (
          <p className={profileStyles.errorText}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

// ===============================
// Profile Component
// ===============================

const Profile = ({
   initialUser,
  onUpdateProfile,
  onLogout,
}) => {
  const navigate = useNavigate();

  // ===============================
  // User State
  // ===============================

  const [user, setUser] = useState(
    initialUser || {
      name: "",
      email: "",
      joinDate: "",
    }
  );

  const [tempUser, setTempUser] = useState(
    initialUser || {
      name: "",
      email: "",
      joinDate: "",
    }
  );

  const [editMode, setEditMode] = useState(false);

  // ===============================
  // Password State
  // ===============================

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordErrors, setPasswordErrors] =
    useState({});

  const [loading, setLoading] = useState(false);

  // ===============================
  // Get Auth Token
  // ===============================

  const getAuthtoken = useCallback(() => {
    return getToken();
  }, []);

  // ===============================
  // Common API Request
  // ===============================

  const handleApirequest = useCallback(
    async (method, endpoint, data = null) => {
      const token = getAuthtoken();

      if (!token) {
        navigate("/login");
        return null;
      }

      try {
        setLoading(true);

        const config = {
          method,
          url: `${BASE_URL}${endpoint}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        if (data !== null) {
          config.data = data;
        }

        const response = await axios(config);

        return response.data;
      } catch (error) {
        console.error(
          `${method} ${endpoint} error:`,
          error
        );

        if (error.response?.status === 401) {
          clearToken();
          navigate("/login");
        }

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [getAuthtoken, navigate]
  );

  // ===============================
  // Fetch Current User
  // ===============================

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await handleApirequest(
          "get",
          "/user/getuser"
        );

        if (data) {
          const userData = data.user || data;

          setUser(userData);
          setTempUser(userData);
        }
      } catch (error) {
        console.error(
          "Fetch user error:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to fetch user data"
        );
      }
    };

    fetchUserData();
  }, [handleApirequest]);

  // ===============================
  // Input Change
  // ===============================

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    setTempUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // ===============================
  // Password Input Change
  // ===============================

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setPasswordErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }, []);

  // ===============================
  // Password Visibility
  // ===============================

  const togglePasswordVisibility = useCallback(
    (field) => {
      setShowPassword((prev) => ({
        ...prev,
        [field]: !prev[field],
      }));
    },
    []
  );

  // ===============================
  // Save Profile
  // ===============================

  const saveData = async () => {
    try {
      const data = await handleApirequest(
        "put",
        "/user/userupdate",
        tempUser
      );

      if (data) {
        const updatedUser =
          data.user || data;

        setUser(updatedUser);
        setTempUser(updatedUser);

        setEditMode(false);

        onUpdateProfile?.(updatedUser);

        toast.success(
          "Profile updated successfully!"
        );
      }
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    }
  };

  // ===============================
  // Cancel Edit
  // ===============================

  const handleCancelEdit = useCallback(() => {
    setTempUser(user);
    setEditMode(false);
  }, [user]);

  // ===============================
  // Password Validation
  // ===============================

  const validatePassword = useCallback(() => {
    const errors = {};

    if (!passwordData.current) {
      errors.current =
        "Current password is required";
    }

    if (!passwordData.new) {
      errors.new =
        "New password is required";
    } else if (passwordData.new.length < 8) {
      errors.new =
        "Password must be at least 8 characters";
    }

    if (!passwordData.confirm) {
      errors.confirm =
        "Please confirm your password";
    } else if (
      passwordData.new !== passwordData.confirm
    ) {
      errors.confirm =
        "Passwords do not match";
    }

    setPasswordErrors(errors);

    return Object.keys(errors).length === 0;
  }, [passwordData]);

  // ===============================
  // Password Submit
  // ===============================

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    try {
      const pwRes = await handleApirequest(
        "put",
        "/user/passwordupdate",
        {
          currentpassword:
            passwordData.current,

          newpassword:
            passwordData.new,
        }
      );

      // Backend invalidates old tokens on password change and returns a fresh one
      if (pwRes?.token) setToken(pwRes.token);

      toast.success(
        "Password updated successfully!"
      );

      closePasswordModal();

    } catch (error) {
      console.error(
        "Password update error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update password"
      );
    }
  };

  // ===============================
  // Logout
  // ===============================

  const handleLogout = useCallback(() => {
    clearToken();

    onLogout?.();

    navigate("/login");
  }, [onLogout, navigate]);

  // ===============================
  // Close Password Modal
  // ===============================

  const closePasswordModal = useCallback(() => {
    if (loading) {
      return;
    }

    setShowPasswordModal(false);

    setPasswordData({
      current: "",
      new: "",
      confirm: "",
    });

    setPasswordErrors({});

    setShowPassword({
      current: false,
      new: false,
      confirm: false,
    });
  }, [loading]);

  // ===============================
  // User Display Values
  // ===============================

  const userName =
    user?.name || "User";

  const userEmail =
    user?.email || "No email";

  const joinDate =
    user?.joinDate
      ? new Date(
          user.joinDate
        ).toLocaleDateString()
      : "Not available";

  // ===============================
  // JSX
  // ===============================

  return (
    <div className={profileStyles.container}>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className={profileStyles.mainContainer}>

        {/* ================= HEADER ================= */}

        <div className={profileStyles.header}>

          <div className={profileStyles.avatar}>
            <User className="w-12 h-12 text-white" />
          </div>

          <h1 className={profileStyles.userName}>
            {userName}
          </h1>

          <p className={profileStyles.userEmail}>
            {userEmail}
          </p>

        </div>

        {/* ================= CONTENT ================= */}

        <div className={profileStyles.content}>

          <div className={profileStyles.grid}>

            {/* ================= PERSONAL INFORMATION ================= */}

            <div className={profileStyles.card}>

              <div className="flex justify-between items-center mb-6">

                <h2 className={profileStyles.cardTitle}>

                  <User
                    className={profileStyles.icon}
                  />

                  Personal Information

                </h2>

                {!editMode && (
                  <button
                    onClick={() =>
                      setEditMode(true)
                    }
                    className={profileStyles.editButton}
                    disabled={loading}
                  >
                    {loading
                      ? "Loading ..."
                      : "Edit"}
                  </button>
                )}

              </div>

              {/* ================= NAME ================= */}

              {editMode ? (

                <div className="space-y-4">

                  <div>

                    <label className={profileStyles.label}>
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={tempUser.name || ""}
                      onChange={handleInputChange}
                      className={profileStyles.input}
                      disabled={loading}
                    />

                  </div>

                  {/* Email box */}

                  <div>

                    <label className={profileStyles.label}>
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={tempUser.email || ""}
                      onChange={handleInputChange}
                      className={profileStyles.input}
                      disabled={loading}
                    />

                  </div>

                  <div className="flex gap-3 pt-4">

                    <button
                      onClick={saveData}
                      className={profileStyles.buttonPrimary}
                      disabled={loading}
                    >
                      {loading
                        ? "Saving"
                        : "Save changes"}
                    </button>

                    <button
                      onClick={handleCancelEdit}
                      className={profileStyles.buttonSecondary}
                      disabled={loading}
                    >
                      Cancel
                    </button>

                  </div>

                </div>

              ) : (

                <div className="space-y-4">

                  <div>

                    <p className={profileStyles.label}>
                      Full Name
                    </p>

                    <p className="font-medium text-gray-800">
                      {user.name}
                    </p>

                  </div>

                  <div>

                    <p className={profileStyles.label}>
                      Email Address
                    </p>

                    <p className="font-medium text-gray-800">
                      {user.email}
                    </p>

                  </div>

                </div>

              )}

            </div>
<div className={profileStyles.card}>

  <h2 className={profileStyles.cardTitle}>
    <Lock className={profileStyles.icon} />
    Account Security
  </h2>

  <div className="space-y-4 mt-5">

    <div className={profileStyles.securityItem}>

      <div>
        <p className={profileStyles.securityText}>
          Password
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowPasswordModal(true)}
        className={profileStyles.changeButton}
        disabled={loading}
      >
        Change
      </button>

    </div>

  </div>

  <button
    type="button"
    onClick={handleLogout}
    className={profileStyles.logoutButton}
    disabled={loading}
  >
    {loading ? "processing ..." : "Logout"}
  </button>

</div>

          </div>

        </div>


         {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onRequestClose={closePasswordModal}
        contentLabel="Change Password"
        className="modal"
        overlayClassName="modal-overlay"
        // Prevent unnecessary re-renders
        shouldCloseOnOverlayClick={!loading}
        shouldCloseOnEsc={!loading}
      >
        <div className={profileStyles.modalContent}>
          <div className={profileStyles.modalHeader}>
            <h3 className={profileStyles.modalTitle}>Change Password</h3>
            <button
              onClick={closePasswordModal}
              className="text-gray-500 hover:text-gray-800 disabled:opacity-50"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <PasswordInput
              name="current"
              label="Current Password"
              value={passwordData.current}
              error={passwordErrors.current}
              showField={showPassword.current}
              onToggle={() => togglePasswordVisibility('current')}
              onChange={handlePasswordChange}
              disabled={loading}
            />

            <PasswordInput
              name="new"
              label="New Password"
              value={passwordData.new}
              error={passwordErrors.new}
              showField={showPassword.new}
              onToggle={() => togglePasswordVisibility('new')}
              onChange={handlePasswordChange}
              disabled={loading}
            />

            <PasswordInput
              name="confirm"
              label="Confirm New Password"
              value={passwordData.confirm}
              error={passwordErrors.confirm}
              showField={showPassword.confirm}
              onToggle={() => togglePasswordVisibility('confirm')}
              onChange={handlePasswordChange}
              disabled={loading}
            />

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className={profileStyles.buttonPrimary}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={closePasswordModal}
                className={profileStyles.buttonSecondary}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>


      </div>

    </div>
  );
};

export default Profile;
