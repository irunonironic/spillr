import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useOwnerFeedback, useFeedbackAnswer } from "../hooks/useFeedback";
import toast from "react-hot-toast";
import {
  MessageCircle,
  Reply,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import ProfileCard from "./ProfileCard";

export default function FeedbackManagement() {
  const { user } = useAuth();
  const feedbackIdentifier = user?.username || user?.slug;

  const {
    feedbacks,
    pagination,
    filters,
    loading,
    error,
    stats,
    updateFilters,
    changePage,
    refetch,
  } = useOwnerFeedback(feedbackIdentifier);

  const {
    formData: answerFormData,
    errors: answerErrors,
    loading: answerLoading,
    handleChange: handleAnswerChange,
    handleSubmit: submitAnswer,
    resetForm: resetAnswerForm,
  } = useFeedbackAnswer();

  const [showAnswerForm, setShowAnswerForm] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    let intervalId = null;
    if (filters.sort === "active") {
      intervalId = setInterval(() => {
        refetch();
      }, 30000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [filters.sort]);

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastUpdate(new Date());
    } catch (err) {
      toast.error("Failed to refresh");
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleAnswerSubmit = async (feedbackId) => {
    try {
      await submitAnswer(feedbackId, () => {
        setShowAnswerForm(null);
        resetAnswerForm();
      });
    } catch (err) {
      console.error("Answer submission error:", err);
      toast.error("Failed to post response");
    }
  };

  const getStatusBadge = (feedback) => {
    if (feedback.isAnswered)
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-white border border-black text-black">
          <CheckCircle className="w-3 h-3" />
          Answered
        </span>
      );

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-yellow-100 border border-black text-black">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };

  const decodeHTML = (str) => {
    const parser = new DOMParser();
    return parser.parseFromString(str, "text/html").body.textContent;
  }


  if (loading && !feedbacks.length)
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl border-2 border-black shadow-[6px_6px_0_0_#000] bg-white p-6 sm:p-8">
          <div className="text-center">
            <MessageCircle className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl font-bold mb-2">
              Error Loading Feedback
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-black text-black font-semibold bg-white hover:bg-gray-100 text-sm sm:text-base"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-3 py-4 sm:px-4">
        {/* LEFT SIDEBAR */}
        <aside className="lg:col-span-3 w-full ">
          <div className="lg:sticky lg:top-20 w-full ">
            <div className="border-2 border-black shadow-[6px_6px_0_0_#000] bg-white overflow-hidden w-full flex  flex-col p-3 sm:p-5 lg:p-6">
              {/* Profile Card */}
              <div className="mb-6 ">
                <ProfileCard />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
                <div className="p-3 border-2 border-black bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold">
                      Total
                    </span>
                    <span className="text-base sm:text-lg font-bold">
                      {stats?.total ?? 0}
                    </span>
                  </div>
                </div>
                <div className="p-3 border-2 border-black bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold">
                      Answered
                    </span>
                    <span className="text-base sm:text-lg font-bold">
                      {stats?.answered ?? 0}
                    </span>
                  </div>
                </div>
                <div className="p-3 border-2 border-black bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold">
                      Pending
                    </span>
                    <span className="text-base sm:text-lg font-bold">
                      {stats?.active ?? 0}
                    </span>
                  </div>
                </div>
                <div className="p-3 border-2 border-black bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold">
                      Answer rate
                    </span>
                    <span className="text-base sm:text-lg font-bold">
                      {Math.round((stats?.answerRate || 0) * 100) / 100}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-9">
          <div className="border-2 border-black shadow-[6px_6px_0_0_#000] bg-white overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-6 border-b-2 border-black gap-4">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold">Messages</h1>
                <p className="text-xs sm:text-sm text-gray-600"></p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {[
                  { key: "active", label: "Active", count: stats?.active ?? 0 },
                  {
                    key: "answered",
                    label: "Answered",
                    count: stats?.answered ?? 0,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => updateFilters({ sort: tab.key, page: 1 })}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-2 border-black whitespace-nowrap ${filters.sort === tab.key
                      ? "bg-black text-white"
                      : "bg-white text-black"
                      }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="p-2 border-2 border-black bg-white hover:bg-gray-50 disabled:opacity-50"
                  title="Refresh now"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
            {/* Body */}
            <div className="p-2 sm:p-6">
              {/* If no feedback */}
              {feedbacks.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <MessageCircle className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold mb-2">
                    {filters.search
                      ? "No matching feedback found"
                      : "No feedback yet"}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {filters.search
                      ? "Try adjusting your search terms or filters"
                      : "Feedback will appear here once people start submitting"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-6">
                  {feedbacks.map((feedback) => (
                    <article
                      key={feedback._id}
                      className="border-2 border-black bg-white p-3 sm:p-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1 w-full">
                          {/* Header row: status + date */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3">
                            {getStatusBadge(feedback)}
                            <div className="text-xs text-gray-600">
                              {new Date(
                                feedback.createdAt
                              ).toLocaleDateString()}{" "}
                              •{" "}
                              {new Date(
                                feedback.createdAt
                              ).toLocaleTimeString()}
                            </div>
                          </div>

                          {/* Question */}
                          <div className="bg-gray-50 sm:px-4 sm:py-2">
                            <p className="text-sm sm:text-base text-gray-900">
                              {decodeHTML(feedback.question)}
                            </p>
                          </div>

                          {/* Answer */}
                          {feedback.answer && (
                            <div className="mt-2 sm:mt-4 bg-blue-50 p-2 sm:p-4 border-black">
                              <p className="text-sm sm:text-base text-gray-900">
                                {decodeHTML(feedback.answer)}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-700 mt-2">
                                Your response •{" "}
                                {new Date(
                                  feedback.updatedAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row sm:flex-col items-center w-full sm:w-auto">
                          {!feedback.isAnswered && (
                            <button
                              onClick={() =>
                                setShowAnswerForm((s) =>
                                  s === feedback._id ? null : feedback._id
                                )
                              }
                              className="  bg-white "
                              title="Reply"
                            >
                              <Reply className="w-5 sm:w-6 h-5 sm:h-6 mx-auto" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Inline Answer Form */}
                      {showAnswerForm === feedback._id && (
                        <div className="mt-3 sm:mt-4 border-2 border-black p-3 sm:p-4 bg-gray-50">
                          <h4 className="font-bold mb-2 text-sm sm:text-base">
                            Write your response
                          </h4>
                          <textarea
                            placeholder="Type your response..."
                            value={answerFormData.answer}
                            onChange={handleAnswerChange}
                            rows={4}
                            className="w-full px-3 py-2 border-2 border-black resize-none text-sm sm:text-base"
                          />

                          <div className="mt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                            <button
                              onClick={() => {
                                setShowAnswerForm(null);
                                resetAnswerForm();
                              }}
                              className="px-3 sm:px-4 py-2 border-2 border-black bg-white text-sm sm:text-base"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleAnswerSubmit(feedback._id)}
                              disabled={
                                answerLoading || !answerFormData.answer?.trim()
                              }
                              className="px-3 sm:px-4 py-2 border-2 border-black bg-black text-white text-sm sm:text-base"
                            >
                              {answerLoading ? "Posting..." : "Post Response"}
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  ))}

                  {/* Pagination */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-6">
                    <div className="text-xs sm:text-sm text-gray-600">
                      Showing page {filters.page} of{" "}
                      {pagination?.totalPages ?? 1}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          changePage(Math.max(1, filters.page - 1))
                        }
                        disabled={filters.page <= 1}
                        className="p-2 border-2 border-black bg-white"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          changePage(
                            Math.min(
                              pagination?.totalPages ?? 1,
                              filters.page + 1
                            )
                          )
                        }
                        disabled={filters.page >= (pagination?.totalPages ?? 1)}
                        className="p-2 border-2 border-black bg-white"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>{" "}
          </div>
        </main>
      </div>
    </div>
  );
}
