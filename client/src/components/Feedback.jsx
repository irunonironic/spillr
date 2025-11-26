import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../hooks/useAuth";
import { useOwnerFeedback, useFeedbackAnswer } from "../hooks/useFeedback";
import {
  MessageCircle,
  Reply,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Trash2,
  ArchiveRestore,
} from "lucide-react";
import ProfileCard from "./ProfileCard";
import ShareModal from "./ShareModal";
import { Share2 } from "lucide-react";
import { FeedbackListSkeleton } from "./SkeletonLoaders";


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
    archiveFeedback,
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
  const [initialLoad, setInitialLoad] = useState(true);
  const [shareFeedback, setShareFeedback] = useState(null);

  useEffect(() => {
    if (filters.sort === "active" && !initialLoad) {
      const intervalId = setInterval(() => {
        refetch();
      }, 30000);
      return () => clearInterval(intervalId);
    }
  }, [filters.sort, refetch, initialLoad]);

  useEffect(() => {
    if (!loading && feedbacks.length >= 0) {
      setInitialLoad(false);
    }
  }, [loading, feedbacks]);

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await refetch();
      await new Promise((resolve) => setTimeout(resolve, 300)); 
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleAnswerSubmit = useCallback(
    async (feedbackId) => {
      try {
        await submitAnswer(feedbackId, () => {
          setShowAnswerForm(null);
          resetAnswerForm();
          refetch();
        });
      } catch (err) {
        console.error("Answer submission error:", err);
      }
    },
    [submitAnswer, resetAnswerForm, refetch],
  );

  const handleArchiveToggle = useCallback(
    async (feedbackId, currentlyArchived) => {
      try {
        await archiveFeedback(feedbackId, !currentlyArchived);
        refetch();
      } catch (err) {
        console.error("Archive toggle error:", err);
      }
    },
    [archiveFeedback, refetch],
  );

  const getStatusBadge = useCallback((feedback) => {
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
  }, []);

  const decodeHTML = useCallback((str) => {
    const parser = new DOMParser();
    return parser.parseFromString(str, "text/html").body.textContent;
  }, []);

  const emptyState = useMemo(() => {
    const messages = {
      active: {
        title: "No pending messages",
        subtitle: "New messages will appear here",
      },
      answered: {
        title: "No answered messages",
        subtitle: "Answered messages will appear here",
      },
      archived: {
        title: "No archived messages",
        subtitle: "Archived messages will appear here",
      },
    };

    const current = messages[filters.sort] || messages.active;

    return (
      <div className="text-center py-12 sm:py-16">
        <MessageCircle className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4" />
        <h3 className="text-lg sm:text-xl font-bold mb-2">{current.title}</h3>
        <p className="text-sm sm:text-base text-gray-600">{current.subtitle}</p>
      </div>
    );
  }, [filters.sort]);

  if (error && initialLoad) {
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
  }

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-3 py-4 sm:px-4">
        <aside className="lg:col-span-3 w-full">
          <div className="lg:sticky lg:top-20 w-full">
            <div className="border-2 border-black shadow-[6px_6px_0_0_#000] bg-white overflow-hidden w-full flex flex-col p-3 sm:p-5 lg:p-6">
              <div className="mb-6">
               <ProfileCard />

              </div>

     {loading ? (
  <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
    {[1,2,3,4].map((i) => (
      <div key={i} className="p-3 border-2 border-black bg-white animate-pulse">
        <div className="flex items-center justify-between">
          <span className="h-3 w-20 bg-gray-200 block rounded" />
          <span className="h-5 w-10 bg-gray-300 block rounded" />
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
    <div className="p-3 border-2 border-black bg-white">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-semibold">Total</span>
        <span className="text-base sm:text-lg font-bold">
          {stats?.total ?? 0}
        </span>
      </div>
    </div>

    <div className="p-3 border-2 border-black bg-white">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-semibold">Answered</span>
        <span className="text-base sm:text-lg font-bold">
          {stats?.answered ?? 0}
        </span>
      </div>
    </div>

    <div className="p-3 border-2 border-black bg-white">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-semibold">Pending</span>
        <span className="text-base sm:text-lg font-bold">
          {stats?.active ?? 0}
        </span>
      </div>
    </div>

    <div className="p-3 border-2 border-black bg-white">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-semibold">Answer rate</span>
        <span className="text-base sm:text-lg font-bold">
          {Math.round((stats?.answerRate || 0) * 100) / 100}%
        </span>
      </div>
    </div>
  </div>
)}

            </div>
          </div>
        </aside>

        <main className="lg:col-span-9">
          <div className="border-2 border-black shadow-[6px_6px_0_0_#000] bg-white overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-6 border-b-2 border-black gap-4">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold">Messages</h1>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {[
                  { key: "active", label: "Active", count: stats?.active ?? 0 },
                  {
                    key: "answered",
                    label: "Answered",
                    count: stats?.answered ?? 0,
                  },
                  {
                    key: "archived",
                    label: "Archived",
                    count: stats?.archived ?? 0,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => updateFilters({ sort: tab.key, page: 1 })}
                    className={`px-3 sm:px-3 py-1 text-xs sm:text-sm font-semibold border-2 border-black whitespace-nowrap ${
                      filters.sort === tab.key
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
                  title={isRefreshing ? "Refreshing..." : "Refresh now"}
                >
                  <RefreshCw
                    className={`w-3 h-2  ${isRefreshing ? "animate-spin" : ""} scale-150`} strokeWidth={3}
                  />
                </button>
              </div>
            </div>

            <div className="p-2 sm:p-6">
              {loading ? (
  <FeedbackListSkeleton />
) : feedbacks.length === 0 ? (
  emptyState
) : (
  <div className="space-y-2 sm:space-y-6">

                  {feedbacks.map((feedback) => (
                    <article
                      key={feedback._id}
                      className="border-2 border-black bg-white p-3 sm:p-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1 w-full">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3">
                            {getStatusBadge(feedback)}
                            <div className="text-xs text-gray-600">
                              {new Date(
                                feedback.createdAt,
                              ).toLocaleDateString()}{" "}
                            </div>
                          </div>
                          <div className="bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 rounded">
                            <p className="text-sm sm:text-base text-gray-900">
                              {decodeHTML(feedback.question)}
                            </p>
                          </div>

                          {feedback.answer && (
                            <div className="mt-2 sm:mt-4 p-3 sm:p-4 rounded border-l-4">
                              <p className="text-sm sm:text-base text-gray-900">
                                {decodeHTML(feedback.answer)}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-700 mt-2">
                                Your response •{" "}
                                {new Date(
                                  feedback.updatedAt,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className=" items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => setShareFeedback(feedback)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            title="Share this feedback"
                          >
                            <Share2 className="w-5 sm:w-6 h-5 sm:h-6  hover:text-gray-700 text-black" />
                          </button>

                          {!feedback.isAnswered && (
                            <button
                              onClick={() =>
                                setShowAnswerForm((s) =>
                                  s === feedback._id ? null : feedback._id,
                                )
                              }
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                              title="Reply to this message"
                            >
                              <Reply className="w-5 sm:w-6 h-5 sm:h-6" />
                            </button>
                          )}

                          {filters.sort === "archived" ? (
                            <button
                              onClick={() =>
                                handleArchiveToggle(feedback._id, true)
                              }
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                              title="Restore from archive"
                            >
                              <ArchiveRestore className="w-5 sm:w-6 h-5 sm:h-6 text-black hover:text-gray-700" />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleArchiveToggle(feedback._id, false)
                              }
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                              title="Move to archive"
                            >
                              <Trash2 className="w-5 sm:w-6 h-5 sm:h-6 text-black hover:text-gray-800" />
                            </button>
                          )}
                        </div>
                      </div>

                      {showAnswerForm === feedback._id && (
                        <div className="mt-3 sm:mt-4 border-2 border-black p-3 sm:p-4 bg-gray-50 rounded">
                          <h4 className="font-bold mb-2 text-sm sm:text-base">
                            Write your response
                          </h4>
                          <textarea
                            placeholder="Type your response..."
                            value={answerFormData.answer}
                            onChange={handleAnswerChange}
                            rows={4}
                            className="w-full px-3 py-2 border-2 border-black resize-none text-sm sm:text-base focus:outline-none focus:ring-1"
                          />

                          {answerErrors.answer && (
                            <p className="text-red-500 text-xs mt-1">
                              {answerErrors.answer}
                            </p>
                          )}

                          <div className="mt-3 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                            <button
                              onClick={() => {
                                setShowAnswerForm(null);
                                resetAnswerForm();
                              }}
                              className="px-3 sm:px-4 py-2 border-2 border-black bg-white text-sm sm:text-base hover:bg-gray-100 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleAnswerSubmit(feedback._id)}
                              disabled={
                                answerLoading || !answerFormData.answer?.trim()
                              }
                              className="px-3 sm:px-4 py-2 border-2 border-black bg-black text-white text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                            >
                              {answerLoading ? "Posting..." : "Post Response"}
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  ))}

                  {pagination?.totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-6 border-t-2 border-gray-200 pt-4">
                      <div className="text-xs sm:text-sm text-gray-600">
                        Showing page {filters.page} of{" "}
                        {pagination?.totalPages ?? 1}
                        {pagination?.totalFeedbacks > 0 &&
                          ` (${pagination.totalFeedbacks} total)`}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            changePage(Math.max(1, filters.page - 1))
                          }
                          disabled={filters.page <= 1}
                          className="p-2 border-2 border-black bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                          title="Previous page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            changePage(
                              Math.min(
                                pagination?.totalPages ?? 1,
                                filters.page + 1,
                              ),
                            )
                          }
                          disabled={
                            filters.page >= (pagination?.totalPages ?? 1)
                          }
                          className="p-2 border-2 border-black bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                          title="Next page"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      {shareFeedback &&
        createPortal(
          <ShareModal
            feedback={shareFeedback}
            userProfile={user}
            onClose={() => setShareFeedback(null)}
          />,
          document.body,
        )}
    </div>
  );
}
