import * as Yup from 'yup';
import { startOfWeek, endOfWeek } from 'date-fns';
import isWithinRange from 'date-fns/isWithinInterval';
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
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .integer()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Validation Date and count checkins
    const today = new Date();
    const startWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endWeek = endOfWeek(today, { weekStartsOn: 1 });

    if (isWithinRange(today, startWeek, endWeek)) {
      const allCheckins = await Checkin.findAll({
        where: { student_id: req.params.id },
      });

      if (allCheckins >= 5)
        return res.status(401).json({ error: 'All checkins used' });
    }

    // Create checkin
    const checkin = await Checkin.create(req.body);

    return res.json(checkin);
  }
}

export default new CheckinController();
