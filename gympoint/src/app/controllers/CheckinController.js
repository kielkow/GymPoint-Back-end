import { startOfWeek, endOfWeek } from 'date-fns';
import { Op } from 'sequelize';
import Checkin from '../models/Checkin';

class CheckinController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const checkins = await Checkin.findAll({
      where: { student_id: req.params.id },
      limit: 8,
      offset: (page - 1) * 8,
    });
    return res.json(checkins);
  }

  async store(req, res) {
    // Validation Date and count checkins
    const today = new Date();
    const allCheckins = await Checkin.count({
      where: {
        student_id: req.params.id,
        created_at: {
          [Op.between]: [
            startOfWeek(today, { weekStartsOn: 1 }),
            endOfWeek(today),
          ],
        },
      },
    });

    if (allCheckins >= 5)
      return res.status(401).json({ error: 'All checkins used' });

    // Create checkin
    const checkin = await Checkin.create({ student_id: req.params.id });

    return res.json(checkin);
  }
}

export default new CheckinController();
