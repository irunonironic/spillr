import { useState, useCallback, useEffect, useRef } from "react";
import { feedbackService } from "../services/feedbackService.js";

export const useFeedbackSubmission = (wallSlug) => {
  const [formData, setFormData] = useState({ question: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const validation = feedbackService.validateQuestion(formData.question);
    if (!validation.isValid) {
      setErrors({ question: validation.error });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({ question: value });
    if (errors.question) setErrors({});
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await feedbackService.submit({
        question: formData.question,
        wallSlug,
      });
      setSuccess(true);
      setFormData({ question: "" });
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({ question: "" });
    setErrors({});
    setSuccess(false);
  }, []);

  return {
    formData,
    errors,
    loading,
    success,
    handleChange,
    handleSubmit,
    resetForm,
    characterCount: formData.question.length,
    maxCharacters: 1000,
  };
};

export const usePublicFeedback = (wallSlug) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeedback = useCallback(async () => {
    if (!wallSlug) return;
    try {
      setLoading(true);
      setError(null);
      const data = await feedbackService.getPublic(wallSlug);
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [wallSlug]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const addReaction = useCallback(async (feedbackId, emoji) => {
    try {
      const updatedFeedback = await feedbackService.react(feedbackId, emoji);
      setFeedbacks((prev) =>
        prev.map((f) => (f._id === feedbackId ? updatedFeedback : f))
      );
    } catch (error) {
      console.error("Reaction error:", error);
    }
  }, []);

  return {
    feedbacks,
    loading,
    error,
    refetch: fetchFeedback,
    addReaction,
  };
};

export const useOwnerFeedback = (slug) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalFeedbacks: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [stats, setStats] = useState({
    total: 0,
    answered: 0,
    archived: 0,
    active: 0,
    answerRate: 0,
  });
  const [filters, setFilters] = useState({
    sort: "active",
    page: 1,
    limit: 10,
    search: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const lastFetchParamsRef = useRef(null);

  const fetchFeedback = useCallback(async () => {
    if (!slug) return;
    
    // Create params string for comparison
    const currentParams = JSON.stringify({ slug, ...filters });
    
    // Prevent duplicate fetches with same params
    if (isFetchingRef.current && currentParams === lastFetchParamsRef.current) {
      console.log('⏭️ Skipping duplicate feedback fetch');
      return;
    }
    
    try {
      isFetchingRef.current = true;
      lastFetchParamsRef.current = currentParams;
      setLoading(true);
      setError(null);
      
      const data = await feedbackService.getForOwner(slug, filters);
      setFeedbacks(data.feedbacks || []);
      setPagination(data.pagination || {});
      setStats(data.stats || {
        total: 0,
        answered: 0,
        archived: 0,
        active: 0,
        answerRate: 0,
      });
      hasFetchedRef.current = true;
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [slug, filters.sort, filters.page, filters.limit, filters.search]);

  // Only fetch once on mount or when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFeedback();
    }, 100); // Small debounce to batch rapid changes
    
    return () => clearTimeout(timeoutId);
  }, [slug, filters.sort, filters.page, filters.limit, filters.search]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
  }, []);

  const changePage = useCallback((newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  }, []);

  const answerFeedback = useCallback(async (feedbackId, answer) => {
    try {
      const updatedFeedback = await feedbackService.answer(feedbackId, answer);
      setFeedbacks((prev) =>
        prev.map((f) => (f._id === feedbackId ? updatedFeedback : f))
      );
      return updatedFeedback;
    } catch (error) {
      throw error;
    }
  }, []);

  const archiveFeedback = useCallback(
    async (feedbackId, archived = true) => {
      try {
        await feedbackService.archive(feedbackId, archived);
        
        // Remove from current list if moving to different state
        if (archived && filters.sort !== "archived") {
          // Moving TO archive from active/answered
          setFeedbacks((prev) => prev.filter((f) => f._id !== feedbackId));
        } else if (!archived && filters.sort === "archived") {
          // Moving FROM archive to active/answered
          setFeedbacks((prev) => prev.filter((f) => f._id !== feedbackId));
        } else {
          // Refresh to get updated state
          fetchFeedback();
        }
      } catch (error) {
        throw error;
      }
    },
    [filters.sort, fetchFeedback]
  );

  return {
    feedbacks,
    pagination,
    filters,
    loading,
    error,
    stats,
    fetchFeedback,
    updateFilters,
    changePage,
    refetch: fetchFeedback,
    answerFeedback,
    archiveFeedback,
  };
};

// FIXED: Export useFeedbackAnswer
export const useFeedbackAnswer = () => {
  const [formData, setFormData] = useState({ answer: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const validation = feedbackService.validateAnswer(formData.answer);
    if (!validation.isValid) {
      setErrors({ answer: validation.error });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({ answer: value });
    if (errors.answer) setErrors({});
  };

  const handleSubmit = async (feedbackId, onSuccess) => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      const result = await feedbackService.answer(feedbackId, formData.answer);
      if (onSuccess) onSuccess(result);
      setFormData({ answer: "" });
      return result;
    } catch (error) {
      setErrors({ submit: error.message });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({ answer: "" });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    resetForm,
    characterCount: formData.answer.length,
    maxCharacters: 2000,
  };
};