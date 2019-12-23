import User from '../models/User';
import Notification from '../schemas/Notification';

class NotificationController {
  async index(req, res) {
    /**
     * Check if userId is a Administrator
     */
    const checkIsProvider = await User.findOne({
      where: { id: req.userId, admin_user: true },
    });

    if (!checkIsProvider) {
      return res
        .status(400)
        .json({ error: 'Only Administrator can load notifications' });
    }

    /**
     *  Busca notificações
     */
    const notifications = await Notification.find({})
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    return res.json(notification);
  }
}

export default new NotificationController();
