import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUser,
  usePasswordChange,
  useAccountDeletion,
} from "../hooks/useUser";
import {
  User,
  Lock,
  Bell,
  Trash2,
  Upload,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Images,
} from "lucide-react";
import Footer from "./Footer";
import { getImageUrl } from "../utils/imageHelper";
import toast from "react-hot-toast";
import ImageCropperModal from "./ImageCropperModal";

const UserSettings = () => {
  const navigate = useNavigate();
  const {
    profile,
    loading,
    updateProfile,
    uploadProfilePicture,
    updateNotifications,
    reloadProfile,
  } = useUser(true);

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const {
    formData: passwordData,
    errors: passwordErrors,
    loading: passwordLoading,
    success: passwordSuccess,
    handleChange: handlePasswordChange,
    handleSubmit: handlePasswordSubmit,
    resetForm: resetPasswordForm,
  } = usePasswordChange();

  const {
    loading: deletionLoading,
    success: deletionSuccess,
    error: deletionError,
    requestDeletion,
    resetState: resetDeletionState,
  } = useAccountDeletion();

  const [activeTab, setActiveTab] = useState("profile");
  const [previewImage, setPreviewImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    bio: "",
  });
  const [notifications, setNotifications] = useState({
    newFeedback: false,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);


 useEffect(() => {
  if (profile) {
    setProfileData({
      name: decodeHTML(profile.name || ""),
      username: profile.username || "",
      bio: decodeHTML(profile.bio || ""),
    });
    setNotifications({
      newFeedback: profile.emailNotifications?.newFeedback ?? false,
    });
  }
}, [profile]);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "danger", label: "Delete Account", icon: AlertTriangle },
  ];

 const decodeHTML = (str = "") => {
  if (typeof str !== "string") return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};


  const handleProfileChange = (field) => (e) => {
    setProfileData((prev) => ({ ...prev, [field]: e.target.value }));
  };

const handleProfilePictureChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.error("Please select an image file");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error("File must be under 5MB");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    setSelectedFile(file);
    setCropImageSrc(reader.result);
    setShowCropper(true);
  };
  reader.readAsDataURL(file);
};

const handleCropConfirm = async (blob) => {
  setShowCropper(false);
  setUploadingImage(true);

  try {
    // Convert blob -> File for Cloudinary
    const croppedFile = new File([blob], selectedFile.name, { type: "image/jpeg" });
    await uploadProfilePicture(croppedFile); // ⬅️ your existing Cloudinary upload
    await reloadProfile();
    setImageTimestamp(Date.now());
  } catch (err) {
    console.error("Crop upload failed:", err);
  } finally {
    setUploadingImage(false);
    setCropImageSrc(null);
    setSelectedFile(null);
  }
};

// Get display image with cache busting
const displayImage = previewImage || 
  (profile?.profilePicture ? `${getImageUrl(profile.profilePicture)}?t=${imageTimestamp}` : null);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateProfile({
        name: profileData.name,
        username: profileData.username,
        bio: profileData.bio,
      });
      await reloadProfile();
     // alert('Profile updated successfully!');
    } catch (err) {
     // alert('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      await updateNotifications({ newFeedback: notifications.newFeedback });
      //alert('Notification settings updated!');
    } catch (err) {
     // alert('Failed to update settings');
    } finally {
      setSavingNotifications(false);
    }
  };
const performAccountDeletion = async () => {
  try {
    await requestDeletion(deletePassword); 
    toast.success("Account deleted successfully!");
    setShowDeleteModal(false);
    setDeletePassword("");
    setDeleteConfirmText("");
  } catch (err) {
    toast.error("Failed to delete account.");
  }
};

const handleDeleteAccountNow = () => {
    toast((t) => (
      <div className="flex flex-col gap-4 w-70">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-gray-900 font-bold text-base">
            Delete your account?
          </p>
        </div>
        
        <p className="text-sm text-gray-600">
          This will permanently delete all your data. This action cannot be undone.
        </p>

        <input
          type="password"
          placeholder="Enter your password"
          id={`delete-password-${t.id}`}
          className="w-full px-3 py-2 border-2 border-black shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-1 focus:ring-black"
        />
        
        <input
          type="text"
          placeholder="Type DELETE to confirm"
          id={`delete-confirm-${t.id}`}
          className="w-full px-3 py-2 border-2 border-black shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-1 focus:ring-black"
        />

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 border-2 border-black shadow-[3px_3px_0_0_#000] hover:bg-gray-300 transition font-medium"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white border-2 border-black shadow-[3px_3px_0_0_#000] hover:bg-red-500 transition font-medium"
            onClick={async () => {
              const passwordInput = document.getElementById(`delete-password-${t.id}`);
              const confirmInput = document.getElementById(`delete-confirm-${t.id}`);
              const password = passwordInput?.value || '';
              const confirmText = confirmInput?.value || '';

              if (!password) {
                toast.error("Please enter your password");
                return;
              }

              if (confirmText !== "DELETE") {
                toast.error("You must type DELETE to confirm");
                return;
              }

              toast.dismiss(t.id);

              try {
                await requestDeletion(password);
                toast.success("Account deleted successfully!", {
                  duration: 2000,
                });
                setTimeout(() => {
                  window.location.href = "/";
                }, 2000);
              } catch (err) {
                toast.error(err.message || "Failed to delete account");
              }
            }}
          >
            Delete Account
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: "top-center",
      style: {
        border: "4px solid #000",
        boxShadow: "6px 6px 0 0 #000",
        borderRadius: "0px",
        padding: "24px",
        background: "#fafafa",
        maxWidth: "500px",
      },
    });
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "Space Grotesk" }}
    >
      <div className="bg-yellow-200 border-b-2 border-black">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Account Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your account preferences
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-black text-white font-light shadow-[3px_3px_0_0_#000] hover:bg-yellow-200 hover:text-black transition"
          >
            Go Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white  shadow-elegant border-1 shadow-card  shadow-[6px_4px_0_0_#000] border p-4 space-y-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === id
                      ? "bg-black rounded-none text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:rounded-none"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 shadow-card  shadow-[6px_4px_0_0_#000] ">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white  shadow-sm border ">
                <div className="p-6 border-b-2 ">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Profile Information
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Update your profile details
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden border-2 border-black">
                        {displayImage ? (
                          <img
                            key={imageTimestamp}
                            src={displayImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image load error:', e.target.src);
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <User className="w-8 h-8 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors">
                        <Upload className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Profile Photo
                      </h3>
                      <p className="text-sm text-gray-500">
                        JPG, PNG or WebP. Max 5MB.
                      </p>
                      {uploadingImage && (
                        <p className="text-sm text-blue-500 mt-1">
                          Uploading...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                       value={decodeHTML(profileData.name) || ""}
                      onChange={handleProfileChange("name")}
                      className="flex h-12 w-full  shadow-card  shadow-[2px_2px_0_0_#000] border border-input bg-input  pl-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="Your username"
                      value={profileData.username}
                      onChange={handleProfileChange("username")}
                      className="flex h-12 w-full  shadow-card  shadow-[2px_2px_0_0_#000] border border-input bg-input  pl-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      placeholder="Tell people about yourself..."
                      value={decodeHTML(profileData.bio) || ""}
                      onChange={handleProfileChange("bio")}
                      rows={4}
                      className="w-full px-3 py-2 border border  shadow-card  shadow-[2px_2px_0_0_#000] border border-input bg-input  pl-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <div className="flex justify-end text-sm">
                      <span className="text-gray-500">
                        {profileData.bio.length}/500
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="w-40 h-12 bg-yellow-200 shadow-card  shadow-[4px_4px_0_0_#000] disabled:bg-gray-900 disabled:text-white text-black font-medium  transition-colors cursor-pointer hover:border hover:border-2"
                  >
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
{activeTab === "security" && (
              <div className="bg-white shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                  <p className="text-gray-600 mt-1">Manage your password</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                  <h3 className="font-medium text-gray-900">Change Password</h3>
                  {passwordSuccess && (
                    <div className="text-green-600 px-4 py-3 text-sm bg-green-50">
                      Password updated successfully!
                    </div>
                  )}

                  {passwordErrors.submit && (
                    <div className="text-red-500 px-4 py-3 text-sm bg-red-50">
                      {passwordErrors.submit}
                    </div>
                  )}

                  {/* Password fields - keeping them as they were */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.old ? "text" : "password"}
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange("oldPassword")}
                        className="flex h-12 w-full shadow-[2px_2px_0_0_#000] border border-input bg-input pl-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((p) => ({ ...p, old: !p.old }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange("newPassword")}
                        className="flex h-12 w-full shadow-[2px_2px_0_0_#000] border border-input bg-input pl-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">8+ chars with uppercase, lowercase, number</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange("confirmPassword")}
                        className="flex h-12 w-full shadow-[2px_2px_0_0_#000] border border-input bg-input pl-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-40 h-12 bg-yellow-200 shadow-[4px_4px_0_0_#000] disabled:bg-gray-900 disabled:text-white text-black font-medium transition-colors cursor-pointer hover:border hover:border-2"
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}
            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-white shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Notifications
                  </h2>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Email notifications
                      </h4>
                      <p className="text-sm text-gray-600">
                        Get notified when someone sends a message
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.newFeedback}
                        onChange={(e) =>
                          setNotifications((prev) => ({
                            ...prev,
                            newFeedback: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <button
                    onClick={handleSaveNotifications}
                    disabled={savingNotifications}
                    className="w-40 h-12 bg-yellow-200 shadow-card  shadow-[4px_4px_0_0_#000] disabled:bg-gray-900 disabled:text-white text-black font-medium  transition-colors cursor-pointer hover:border hover:border-2"
                  >
                    {savingNotifications ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </div>
            )}


 {activeTab === "danger" && (
              <div className="bg-white shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h2 className="text-xl font-semibold text-red-900">Delete Account</h2>
                  </div>
                  <p className="text-red-700 mt-1">Irreversible actions</p>
                </div>

                <div className="p-6">
                  <div className="border-2 border-red-200 p-6 bg-red-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
                    <p className="text-gray-600 mb-4">This will permanently delete:</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
                      <li>Your profile and personal information</li>
                      <li>All your feedback walls</li>
                      <li>All feedback received and sent</li>
                      <li>All reactions and engagement data</li>
                    </ul>
                    <button
                      onClick={handleDeleteAccountNow}
                      className="px-6 py-2 bg-red-600 text-white h-12 shadow-[4px_4px_0_0_#000] font-medium transition-colors cursor-pointer hover:border hover:border-2 hover:border-black flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {showCropper && cropImageSrc && (
  <ImageCropperModal
    imageSrc={cropImageSrc}
    onCancel={() => setShowCropper(false)}
    onConfirm={handleCropConfirm}
  />
)}

      </div>
      <Footer />
    </div>
  );
};

export default UserSettings;