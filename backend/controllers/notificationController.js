const Notification = require('../models/Notification');

exports.getUserNotifications = async (req, res) =>
{
    try
    {
        const { userId } = req.params;
        const { read, type, limit = 20, page = 1 } = req.query;

        const query = { recipient: userId };

        if (read !== undefined)
        {
            query.read = read === 'true';
        }

        if (type)
        {
            query.type = type;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('sender', 'name profilePicture');

        const total = await Notification.countDocuments(query);

        res.json({
            notifications,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error)
    {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

exports.markNotificationAsRead = async (req, res) =>
{
    try
    {
        const { notificationId } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );

        if (!notification)
        {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error)
    {
        res.status(500).json({ message: 'Error marking notification as read', error: error.message });
    }
};

exports.deleteNotification = async (req, res) =>
{
    try
    {
        const { notificationId } = req.params;
        const notification = await Notification.findByIdAndDelete(notificationId);

        if (!notification)
        {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error)
    {
        res.status(500).json({ message: 'Error deleting notification', error: error.message });
    }
};

exports.clearAllNotifications = async (req, res) =>
{
    try
    {
        const { userId } = req.params;
        await Notification.deleteMany({ recipient: userId });

        res.json({ message: 'All notifications cleared successfully' });
    } catch (error)
    {
        res.status(500).json({ message: 'Error clearing notifications', error: error.message });
    }
};