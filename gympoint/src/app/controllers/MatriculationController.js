import * as Yup from 'yup';
import { Op } from 'sequelize';
import { addMonths, parseISO } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import Matriculation from '../models/Matriculation';
import Plan from '../models/Plan';
import Student from '../models/Student';
import MatriculationMail from '../jobs/MatriculationMail';
import Queue from '../../lib/Queue';

class MatriculationController {
  async index(req, res) {
    const { page = 1 } = req.query;

    if (req.query.student_name) {
      const matriculations = await Matriculation.findAll({
        attributes: [
          'id',
          'student_id',
          'student_name',
          'plan_id',
          'plan_name',
          'start_date',
          'end_date',
          'price',
          'active',
        ],
        where: {
          student_name: {
            [Op.iRegexp]: req.query.student_name,
          },
          canceled_at: null,
        },
        order: ['id'],
        limit: 8,
        offset: (page - 1) * 8,
      });
      return res.json(matriculations);
    }

    const matriculations = await Matriculation.findAll({
      attributes: [
        'id',
        'student_id',
        'student_name',
        'plan_id',
        'plan_name',
        'start_date',
        'end_date',
        'price',
        'active',
      ],
      where: { canceled_at: null },
      order: ['id'],
      limit: 8,
      offset: (page - 1) * 8,
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
      where: { student_id: req.body.student_id, canceled_at: null },
    });

    if (matriculationExists) {
      return res.status(400).json({ error: 'Student already registred' });
    }

    // Check if plan exists
    const plan = await Plan.findByPk(req.body.plan_id);

    if (!plan) return res.status(400).json({ error: 'Plan not found' });

    // Check if student exists
    const student = await Student.findByPk(req.body.student_id);

    if (!student) return res.status(400).json({ error: 'Student not found' });

    // Calculated price and end_date
    const price = plan.duration * plan.price;
    const end_date = addMonths(
      zonedTimeToUtc(parseISO(req.body.start_date), 'America/Sao_Paulo'),
      plan.duration
    );

    // Create matriculation
    const matriculation = {
      student_id: req.body.student_id,
      student_name: student.name,
      plan_id: req.body.plan_id,
      plan_name: plan.title,
      start_date: zonedTimeToUtc(
        parseISO(req.body.start_date),
        'America/Sao_Paulo'
      ),
      end_date,
      price,
    };

    await Matriculation.create(matriculation);

    // Send email for student
    await Queue.add(MatriculationMail.key, {
      matriculation,
      student,
      plan,
    });

    return res.json(matriculation);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Check if matriculation exists
    const matriculation = await Matriculation.findOne({
      where: { id: req.params.id },
    });

    if (!matriculation)
      return res.status(400).json({ error: 'Matriculation not found' });

    // Calculation price and end_date
    const plan = await Plan.findByPk(req.body.plan_id);

    if (!plan) return res.status(400).json({ error: 'Plan not found' });

    const price = plan.duration * plan.price;
    const end_date = addMonths(parseISO(req.body.start_date), plan.duration);

    // Update matriculation
    await matriculation.update({
      plan_id: req.body.plan_id,
      plan_name: plan.title,
      start_date: req.body.start_date,
      end_date,
      price,
    });

    return res.json(matriculation);
  }

  async delete(req, res) {
    const matriculation = await Matriculation.findByPk(req.params.id);

    matriculation.canceled_at = new Date();

    try {
      await matriculation.save();
      return res.json(matriculation);
    } catch (err) {
      return res.json({ error: err });
    }
  }
}

export default new MatriculationController();
