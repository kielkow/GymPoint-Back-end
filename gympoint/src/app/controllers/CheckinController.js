import { startOfWeek, endOfWeek } from 'date-fns';
import isWithinInterval from 'date-fns/isWithinInterval';
import Checkin from '../models/Checkin';
// import Student from '../models/Student';

class CheckinController {
  async index(req, res) {
    const checkins = await Checkin.findAll({
      where: { student_id: req.params.id },
    });
    return res.json(checkins);
  }

  async store(req, res) {
    // Validation Date and count checkins
    const today = new Date();
    const startWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endWeek = endOfWeek(today, { weekStartsOn: 1 });

    if (isWithinInterval(today, { start: startWeek, end: endWeek })) {
      const allCheckins = await Checkin.count({
        where: { student_id: req.params.id },
      });

      if (allCheckins >= 5)
        return res.status(401).json({ error: 'All checkins used' });
    }

    // Create checkin
    const checkin = await Checkin.create({ student_id: req.params.id });

    return res.json(checkin);
  }
}

export default new CheckinController();
