import { getAvatarUrl } from "../utils/imageHelper";

const ShareFeedbackCard = ({ feedback, userProfile }) => {
  const decodeHTML = (str = "") => {
    if (!str || typeof str !== "string") return "";
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  };
  const userName = userProfile?.name || userProfile?.username || "User";

  const avatarUrl = getAvatarUrl(userProfile?.profilePicture, userName, 64);

  return (
    <div
      className="w-full "
      style={{
        minHeight: "265px",
        padding: "32px",
        fontFamily: "Space Grotesk, sans-serif",
        background: "linear-gradient(135deg, #FEF08A, #f9ebb1f0)",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
        }}
      >
        <div>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>{userName}</div>
          <div style={{ fontSize: "12px", color: "#4B5563" }}>
            @{userProfile?.username || "spillr"}
          </div>
        </div>

        <div
          className="font-['Fasthin',cursive] font-semibold tracking-wider"
          style={{ fontSize: "24px", flexShrink: 0 }}
        >
          Spillr
        </div>
      </div>

      {/* Content Box */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "2px solid #000",
          boxShadow: "4px 4px 0 #000",
          padding: "20px",
          marginBottom: "14px",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{ fontSize: "10px", color: "#6B7280", fontWeight: "600" }}
          >
            QUESTION
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#111827",
              marginTop: "4px",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {decodeHTML(feedback.question)}
          </div>
        </div>

        {feedback.answer && (
          <>
            <div
              style={{ borderTop: "2px solid #E5E7EB", margin: "16px 0" }}
            ></div>
            <div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#6B7280",
                  fontWeight: "600",
                }}
              >
                ANSWER
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#1F2937",
                  marginTop: "4px",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {decodeHTML(feedback.answer)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          color: "#4B5563",
          gap: "8px",
        }}
      >
        <span style={{ flexShrink: 1 }}>Anonymous messaging on Spillr</span>
        <span style={{ flexShrink: 0 }}>spillr.live</span>
      </div>
    </div>
  );
};

export default ShareFeedbackCard;
