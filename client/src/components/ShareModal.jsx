// client/src/components/ShareModal.jsx
import React, { useState, useRef, useEffect } from "react";
import { X, Copy } from "lucide-react";
import html2canvas from "html2canvas";
import ShareFeedbackCard from "./ShareFeedbackCard";
import toast from "react-hot-toast";

const ShareModal = ({ feedback, userProfile, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageBlob, setImageBlob] = useState(null);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    // Simpler scroll lock - just prevent scrolling without changing position
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    generateImage();
  }, []);

  const generateImage = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#fefce8",
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      canvas.toBlob((blob) => {
        setImageBlob(blob);
        setIsGenerating(false);
      }, "image/png");
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast.error("Failed to generate image");
      setIsGenerating(false);
    }
  };

  const handleCopyImage = async () => {
    if (!imageBlob) {
      toast.error("Please wait for image to generate");
      return;
    }

    try {
      const clipboardItem = new ClipboardItem({ "image/png": imageBlob });
      await navigator.clipboard.write([clipboardItem]);

      setCopied(true);
      toast.success("Image copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy image. Try downloading instead.");
    }
  };

  const handleDownload = () => {
    if (!imageBlob) {
      toast.error("Please wait for image to generate");
      return;
    }

    const url = URL.createObjectURL(imageBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `spillr-feedback-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Image downloaded!");
  };

  return (
    <div
      className="fixed top-0 left-0 w-[100vw] h-[100vh] flex items-center justify-center bg-black/60 backdrop-blur-sm z-9999 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-black shadow-[8px_8px_0_0_#000] w-full max-w-2xl max-h-[90vh] overflow-y-auto sm:scale-100 scale-90"
        style={{
          margin: "0 auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b-2 border-black bg-yellow-200 sticky top-0 z-10">
          <h2
            className="text-lg sm:text-xl font-bold"
            style={{ fontFamily: "Space Grotesk" }}
          >
            Share Feedback
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-yellow-300 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Preview */}
          <div className="mb-6">
            <div className="text-xs sm:text-sm font-semibold mb-3 text-gray-600">
              PREVIEW
            </div>
            <div className="border-2 border-black shadow-[4px_4px_0_0_#000] overflow-hidden">
              <div
                ref={cardRef}
                className="w-full"
                style={{
                  background: "linear-gradient(135deg, #FFFBEB, #FEF3C7)",
                }}
              >
                <div className="inline-block min-w-full">
                  <ShareFeedbackCard
                    feedback={feedback}
                    userProfile={userProfile}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 sm:hidden">
              Scroll horizontally to see full preview
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-6">
            <button
              onClick={handleCopyImage}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-black bg-white hover:bg-gray-100 disabled:opacity-50 transition-colors"
              style={{ fontFamily: "Space Grotesk" }}
            >
              <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Copy Image</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-black bg-white hover:bg-gray-100 disabled:opacity-50 transition-colors"
              style={{ fontFamily: "Space Grotesk" }}
            >
              <span>⬇</span>
              <span>Download Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
