import express from "express";
import Feedback from "../models/Feedback.js";
import Wall from "../models/Wall.js";
import authMiddleware from "../middleware/authMiddleware.js";
import transporter from "../config/email.js";
import validator from "validator";
import sendEmail from "../config/email.js";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

const router = express.Router();

const feedbackLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { message: "Too many feedback submissions, please try again later" },
});

const validateQuestion = (question) => {
  if (!question || typeof question !== "string") return false;
  const trimmed = question.trim();
  return trimmed.length >= 3 && trimmed.length <= 1000;
};

const validateSlug = (slug) => {
  if (!slug || typeof slug !== "string") return false;
  const trimmed = slug.trim();
  return (
    trimmed.length >= 2 &&
    trimmed.length <= 50 &&
    /^[a-zA-Z0-9_-]+$/.test(trimmed)
  );
};

const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getClientIP = (req) => {
  const forwarded = req.headers["x-forwarded-for"] || req.headers["x-real-ip"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket && req.socket.remoteAddress
    ? req.socket.remoteAddress
    : "unknown";
};

router.get("/", (req, res) => {
  console.log("GET /api/feedback hit - Feedback API info");
  res.json({
    message: "Feedback API is working!",
    endpoints: {
      "POST /api/feedback": "Submit feedback",
      "GET /api/feedback/wall/:slug": "Get public feedback for wall",
      "POST /api/feedback/:id/react": "React to feedback",
    },
    status: "healthy",
  });
});

router.post("/", feedbackLimiter, async (req, res) => {
  try {
    const { question: rawQuestion, wallSlug: rawSlug } = req.body;
    const question = rawQuestion?.trim();
    const wallSlug = rawSlug?.trim()?.toLowerCase();

    console.log("Feedback submission:", {
      wallSlug,
      questionLength: question?.length,
    });

    if (!validateQuestion(question)) {
      return res.status(400).json({
        message: "Question must be between 3-1000 characters",
      });
    }

    if (!validateSlug(wallSlug)) {
      return res.status(400).json({ message: "Invalid wall slug format" });
    }
    const wall = await Wall.findOne({ slug: wallSlug }).populate("ownerId");

    if (!wall) {
      console.error(" Wall not found:", wallSlug);
      return res.status(404).json({ message: "Wall not found" });
    }

    console.log(" Wall found:", {
      wallId: wall._id,
      ownerId: wall.ownerId?._id,
      ownerEmail: wall.ownerId?.email,
    });

    const submitterIP = getClientIP(req);

    if (wall.ownerId?.blockedIps?.includes(submitterIP)) {
      return res.status(403).json({
        message: "You are blocked from submitting feedback to this wall.",
      });
    }

    if (req.user && Array.isArray(wall.ownerId.blockedUsers)) {
      const isBlocked = wall.ownerId.blockedUsers.some(
        (id) => id.toString() === req.user.id
      );
      if (isBlocked) {
        return res.status(403).json({
          message: "You are blocked from submitting feedback to this wall",
        });
      }
    }

    const feedback = new Feedback({
      question: validator.escape(question),
      wallId: wall._id,
      userId: req.user?.id || null,
      ipAddress: submitterIP,
    });

    await feedback.save();
    console.log(" Feedback saved:", feedback._id);

    res.status(201).json(feedback);

    const owner = wall.ownerId;

    console.log("Email notification check:");
    console.log("Owner exists:", !!owner);
    console.log("Owner ID:", owner?._id);
    console.log("Owner email:", owner?.email);
    console.log("Owner emailNotifications:", owner?.emailNotifications);
    console.log("newFeedback enabled:", owner?.emailNotifications?.newFeedback);
    console.log("Transporter ready:", !!transporter);

    if (owner?.email && owner?.emailNotifications?.newFeedback !== false) {
      const mailContent = {
        to: owner.email,
        subject: "New message on your Spillr wall",
        text: `Hi ${
          owner.name || "there"
        },\n\nYou just received a new message:\n\n"${question}"\n\nView your feedback: ${
          process.env.FRONTEND_URL
        }/dashboard`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              <h2 style="color: #000; margin-top: 0;">New Message Received! 📬</h2>
              <p>Hi <strong>${validator.escape(
                owner.name || "there"
              )}</strong>,</p>
              <p>You just received a new message on your Spillr wall:</p>
              <div style="background-color: #fff; padding: 15px; border-left: 4px solid #000; margin: 20px 0;">
                <p style="margin: 0; font-style: italic;">"${validator.escape(
                  question
                )}"</p>
              </div>
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/dashboard" 
                   style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 4px; margin: 10px 0;">
                  View Your Messages
                </a>
              </p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="font-size: 12px; color: #666;">
                You can disable these notifications in your 
                <a href="${
                  process.env.FRONTEND_URL
                }/settings" style="color: #000;">account settings</a>.
              </p>
            </div>
          </body>
          </html>
        `,
      };

      const emailResult = await sendEmail(mailContent);
      if (emailResult.success) {
        console.log("Notification email sent");
      } else {
        console.error("Failed to send notification email:", emailResult.error);
      }
    }
  } catch (err) {
    console.error("Feedback submission error:", err.message);
    res.status(500).json({ message: "Unable to submit feedback" });
  }
});

// Get feedback for owner
router.get("/owner/:slug", authMiddleware, async (req, res) => {
  try {
    const slug = req.params.slug.trim().toLowerCase();

    const wall = await Wall.findOne({ slug });
    if (!wall) {
      return res.status(404).json({ message: "Wall not found" });
    }

    if (wall.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { sort = "active", page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10)) || 1;
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10))) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    let filter = { wallId: wall._id };

    let sortOption = { createdAt: -1 };

    switch (sort) {
      case "answered":
        filter.isAnswered = true;
        filter.isArchived = false; 
        sortOption = { updatedAt: -1 };
        //console.log('Filtering for answered (non-archived)');
        break;
      case "archived":
        filter.isArchived = true; 
        sortOption = { updatedAt: -1 };
        //console.log(' Filtering for archived');
        break;
      case "active":
      default:
        filter.isAnswered = false;
        filter.isArchived = false; 
        sortOption = { createdAt: -1 };
       // console.log(' Filtering for active (unanswered, non-archived)');
        break;
    }


    const [feedbacks, totalFeedbacks] = await Promise.all([
      Feedback.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Feedback.countDocuments(filter),
    ]);

    const answeredCount = await Feedback.countDocuments({
      wallId: wall._id,
      isAnswered: true,
      isArchived:false,
    });
    const archivedCount = await Feedback.countDocuments({
      wallId: wall._id,
      isArchived: true,
    });
    const totalCount = await Feedback.countDocuments({ wallId: wall._id });
    const activeCount = await Feedback.countDocuments({
      wallId: wall._id,
      isAnswered: false,
      isArchived: false,
    });
    const answerRate = totalCount
      ? Math.round((answeredCount / totalCount) * 100)
      : 0;

    res.json({
      feedbacks,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalFeedbacks / limitNumber),
        totalFeedbacks,
        hasNextPage: pageNumber < Math.ceil(totalFeedbacks / limitNumber),
        hasPrevPage: pageNumber > 1,
      },
      stats: {
        total: totalCount,
        answered: answeredCount,
        archived: archivedCount,
        active: activeCount,
        answerRate,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Unable to fetch feedback" });
  }
});

router.post("/:id/answer", authMiddleware, async (req, res) => {
  try {
    const { answer: rawAnswer } = req.body;
    const answer = rawAnswer?.trim();

    if (!answer || answer.length < 1 || answer.length > 2000) {
      return res.status(400).json({
        message: "Answer must be between 1-2000 characters",
      });
    }

    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid feedback ID format" });
    }

    const feedback = await Feedback.findById(req.params.id).populate("wallId");
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (!feedback.wallId) {
      return res.status(404).json({ message: "Associated wall not found" });
    }

    if (feedback.wallId.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to answer this feedback",
      });
    }

    feedback.answer = validator.escape(answer);
    feedback.isAnswered = true;
    await feedback.save();

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: "Unable to answer feedback" });
  }
});

const reactLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 reactions per minute
  message: { message: "Too many reactions, slow down" },
});

router.post("/:id/react", reactLimiter, async (req, res) => {
  try {
    const { emoji } = req.body;

    if (!emoji || typeof emoji !== "string" || emoji.length > 10) {
      return res.status(400).json({ message: "Invalid emoji" });
    }

    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid feedback ID format" });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const current = feedback.reactions.get(emoji) || 0;

    if (current >= 1000) {
      return res
        .status(400)
        .json({ message: "Maximum reactions reached for this emoji" });
    }

    feedback.reactions.set(emoji, current + 1);
    await feedback.save();

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: "Unable to add reaction" });
  }
});

//  Public feedback with validation
router.get("/wall/:slug", async (req, res) => {
  try {
    const { slug: rawSlug } = req.params;
    const slug = rawSlug?.trim()?.toLowerCase();

    if (!validateSlug(slug)) {
      return res.status(400).json({ message: "Invalid wall slug format" });
    }
    const wall = await Wall.findOne({ slug });
    if (!wall) {
      return res.status(404).json({ message: "Wall not found" });
    }
    const page = Math.max(1, parseInt(req.query.page, 10)) || 1;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10))) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      wallId: wall._id,
      isAnswered: true,
      isArchived: false,
    };
   const [feedbacks, totalCount] = await Promise.all([
      Feedback.find(filter)
        .select("-__v -updatedAt")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Feedback.countDocuments(filter),
    ]);
   const totalPages = Math.ceil(totalCount / limit);
    res.json({
      feedbacks,
      pagination: {
        currentPage: page,
        totalPages,
        totalFeedbacks: totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error("Error fetching public feedback:", err);
    res.status(500).json({ message: "Unable to fetch feedback" });
  }
});




router.patch("/:id/archive", authMiddleware, async (req, res) => {
  try {
    const { archived } = req.body; 
    
    const feedback = await Feedback.findById(req.params.id).populate("wallId");
    
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (feedback.wallId.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    feedback.isArchived = archived !== undefined ? archived : true;
    await feedback.save();


    res.json({
      message: feedback.isArchived ? "Feedback archived" : "Feedback unarchived",
      feedback: {
        _id: feedback._id,
        isArchived: feedback.isArchived,
        isAnswered: feedback.isAnswered
      }
    });
  } catch (err) {
    console.error(" Archive feedback error:", err);
    res.status(500).json({ message: "Unable to update archive status" });
  }
});

export default router;
