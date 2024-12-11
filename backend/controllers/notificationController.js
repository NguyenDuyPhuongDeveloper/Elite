const Notification = require('../models/Notification');

// Create a new notification
exports.createNotification = async (req, res) =>
{
    const { recipient, sender, type, content, relatedEntity, priority, expiresAt } = req.body;

    try
    {
        const notification = new Notification({
            recipient,
            sender,
            type,
            content,
            relatedEntity,
            priority,
            expiresAt,
        });

        await notification.save();
        res.status(201).json({ success: true, data: notification });
    } catch (error)
    {
        console.error('Error creating notification:', error);
        res.status(500).json({ success: false, message: 'Failed to create notification.', error });
    }
};

// Get notifications for a user
exports.getNotifications = async (req, res) =>
{
    const { recipientId } = req.params;
    const { unreadOnly, limit = 20, page = 1 } = req.query;

    try
    {
        const query = { recipient: recipientId };
        if (unreadOnly === 'true')
        {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Notification.countDocuments(query);

        res.status(200).json({
            success: true,
            data: notifications,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        });
    } catch (error)
    {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications.', error });
    }
};

// Mark a notification as read
exports.markAsRead = async (req, res) =>
{
    const { notificationId } = req.params;

    try
    {
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );

        if (!notification)
        {
            return res.status(404).json({ success: false, message: 'Notification not found.' });
        }

        res.status(200).json({ success: true, data: notification });
    } catch (error)
    {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, message: 'Failed to mark notification as read.', error });
    }
};

// Delete a notification
exports.deleteNotification = async (req, res) =>
{
    const { notificationId } = req.params;

    try
    {
        const notification = await Notification.findByIdAndDelete(notificationId);

        if (!notification)
        {
            return res.status(404).json({ success: false, message: 'Notification not found.' });
        }

        res.status(200).json({ success: true, message: 'Notification deleted successfully.' });
    } catch (error)
    {
        console.error('Error deleting notification:', error);
        res.status(500).json({ success: false, message: 'Failed to delete notification.', error });
    }
};

// Clear all notifications for a user
exports.clearAllNotifications = async (req, res) =>
{
    const { recipientId } = req.params;

    try
    {
        const result = await Notification.deleteMany({ recipient: recipientId });

        res.status(200).json({
            success: true,
            message: `${ result.deletedCount } notifications cleared successfully.`,
        });
    } catch (error)
    {
        console.error('Error clearing notifications:', error);
        res.status(500).json({ success: false, message: 'Failed to clear notifications.', error });
    }
};
