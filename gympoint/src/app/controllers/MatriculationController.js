import * as Yup from 'yup';
import { addMonths, parseISO } from 'date-fns';
import Matriculation from '../models/Matriculation';
import Plan from '../models/Plan';

class MatriculationController {
  async index(req, res) {
    const matriculations = await Matriculation.findAll({
      where: { canceled_at: null },
    });
    return res.json(matriculations);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Check if matriculation already exists
    const matriculationExists = await Matriculation.findOne({
      where: { student_id: req.body.student_id },
    });

    if (matriculationExists) {
      return res.status(400).json({ error: 'Student already registred' });
    }

    // Check if plan exists
    const plan = await Plan.findByPk(req.body.plan_id);

    if (!plan) return res.status(400).json({ error: 'Plan not found' });

    // Calculation price and end_date
    const price = plan.duration * plan.price;
    const end_date = addMonths(parseISO(req.body.start_date), plan.duration);

    // Create matriculation
    const matriculation = {
      student_id: req.body.student_id,
      plan_id: req.body.plan_id,
      start_date: req.body.start_date,
      end_date,
      price,
    };

    await Matriculation.create(matriculation);

    return res.json(matriculation);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { plan_id } = req.body;

    const matriculation = await Matriculation.findOne({
      where: { student_id: req.params.id },
    });

    if (!matriculation)
      return res.status(400).json({ error: 'Matriculation not found' });

    if (plan_id !== matriculation.plan_id) {
      const matriculationExists = await Matriculation.findOne({
        where: { plan_id },
      });

      if (matriculationExists) {
        return res.status(400).json({ error: 'Matriculation already exist' });
      }
    }

    const {
      student_id,
      start_date,
      end_date,
      price,
    } = await matriculation.update(req.body);

    return res.json({ student_id, plan_id, start_date, end_date, price });
  }

  async delete(req, res) {
    const matriculation = await Matriculation.findOne({
      where: { student_id: req.params.id },
    });

    matriculation.canceled_at = new Date();

    await matriculation.save();

    return res.send(matriculation);
  }
}

export default new MatriculationController();
