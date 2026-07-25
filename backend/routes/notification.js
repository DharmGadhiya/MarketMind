import { Router } from "express";
import Notification from "../models/notification.js";

const router = Router();

/**
 * GET /api/notifications
 * Retrieve notifications for the logged-in user.
 */
router.get("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, msg: "Unauthenticated." });
  }

  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50) // limit to recent 50
      .lean();

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("[Notifications GET Error]:", error);
    return res.status(500).json({ success: false, msg: "Failed to fetch notifications." });
  }
});

/**
 * POST /api/notifications/read
 * Mark all notifications as read for the logged-in user.
 */
router.post("/read", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, msg: "Unauthenticated." });
  }

  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({
      success: true,
      msg: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("[Notifications Mark Read Error]:", error);
    return res.status(500).json({ success: false, msg: "Failed to mark notifications as read." });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification.
 */
router.delete("/:id", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, msg: "Unauthenticated." });
  }

  const { id } = req.params;

  try {
    const deletedNotification = await Notification.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!deletedNotification) {
      return res.status(404).json({ success: false, msg: "Notification not found." });
    }

    return res.status(200).json({
      success: true,
      msg: "Notification deleted.",
    });
  } catch (error) {
    console.error("[Notification DELETE Error]:", error);
    return res.status(500).json({ success: false, msg: "Failed to delete notification." });
  }
});

export default router;
