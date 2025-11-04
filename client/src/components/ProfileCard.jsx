import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "../hooks/useUser";
import { useAuth } from "../hooks/useAuth";
import { FaCheckCircle, FaShareAlt } from "react-icons/fa";
import { getImageUrl, getInitials } from "../utils/imageHelper";

const ProfileCard = () => {

  const decodeHTML = (str = "") => {
  if (!str || typeof str !== "string") return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};
  const { profile, loading, updateProfile } = useUser();
  const { user } = useAuth();
  const [imageKey, setImageKey] = useState(Date.now());

  const sharedLink = useMemo(() => {
    const username = profile?.username || user?.username;
    if (!username) return window.location.origin;
    return `${window.location.origin}/wall/${username}`;
  }, [profile?.username, user?.username]);

  const avatarUrl = useMemo(() => {
    const imagePath = profile?.profilePicture || user?.profilePicture;
    if (!imagePath) return null;

    const baseUrl = getImageUrl(imagePath);
    return baseUrl;
  }, [profile?.profilePicture, user?.profilePicture]);

  
  const [imageError, setImageError] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const isVerified = profile?.isVerified || false;

  React.useEffect(() => {
    setImageError(false);
    setImageKey(Date.now());
  }, [avatarUrl]);

 const userName = decodeHTML(profile?.name || user?.name || "User");
const userBio = decodeHTML(profile?.bio || "");


  const [isEditing, setIsEditing] = useState(false);
  const [tempBio, setTempBio] = useState(userBio);

  useEffect(() => {
    setTempBio(userBio);
  }, [userBio]);

  const handleSaveBio = useCallback(async () => {
    if (tempBio === userBio) return setIsEditing(false);
    const result = await updateProfile({ bio: tempBio });
    if (result) setIsEditing(false);
  }, [tempBio, userBio, updateProfile]);

  const handleShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sharedLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [sharedLink]);

  if (loading && !profile) {
    return (
      <div className="p-2">
        <div
          className="w-full bg-white border border-black shadow-[4px_4px_0_0_#000] rounded-none p-4 animate-pulse"
          style={{ fontFamily: "Space Grotesk" }}
        >
          <div className="h-40 w-full bg-gray-200 rounded-none mb-3"></div>
          <div className="h-5 w-3/4 mx-auto bg-gray-200 rounded-none mb-2"></div>
          <div className="h-4 w-1/2 mx-auto bg-gray-200 rounded-none"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border-2 border-black  ">
      <div
        className="flex items-center justify-center w-56 h-56 bg-gray-100 overflow-hidden mx-auto  border-2 border-black mt-4"
        style={{ fontFamily: "Space Grotesk" }}
      >
        {avatarUrl && !imageError ? (
          <img
            key={avatarUrl}
            src={`${avatarUrl}?v=${imageKey}`}
            alt={`${userName}'s avatar`}
            className="object-cover w-full h-full"
            loading="eager"
            onError={(e) => {
              //console.error("Image failed to load:", e.target.src);
              setImageError(true);
            }}
            onLoad={() => {
              //console.log('Image loaded successfully');
            }}
          />
        ) : (
          <span
            className="text-4xl font-bold text-gray-700"
            style={{ fontFamily: "Space Grotesk" }}
          >
            {getInitials(userName)}
          </span>
        )}
      </div>

      <div className="p-3 space-y-3 text-center">
        <div className="flex flex-col items-center justify-center gap-1">
          <h3
            className="font-bold text-base text-gray-900"
            style={{ fontFamily: "Space Grotesk" }}
          >
            {userName} 
          </h3>
          <span className="text-sm text-gray-500">
            @{profile?.username || user?.username || "username"}{" "}
          </span>
          {isVerified && (
            <FaCheckCircle className="h-4 w-4 text-blue-500 mt-1" />
          )}
        </div>
        {userBio && <p className="text-md text-gray-700">{userBio}</p>}



        <div className="pt-2 border-t border-gray-200 flex flex-row justify-center gap-4">
          <button
            onClick={handleShareLink}
            className="flex items-center justify-center gap-1 text-xs font-semibold text-gray-700 hover:text-black"
          >
            <FaShareAlt
              className="h-4 w-4 text-black"
              style={{ fontFamily: "Space Grotesk" }}
            />
            {copySuccess ? "Copied!" : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
