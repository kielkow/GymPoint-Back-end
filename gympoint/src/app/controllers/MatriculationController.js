import * as Yup from 'yup';
import { addMonths, parseISO, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import { zonedTimeToUtc } from 'date-fns-tz';
import Matriculation from '../models/Matriculation';
import Plan from '../models/Plan';
import Student from '../models/Student';

import Mail from '../../lib/Mail';

class MatriculationController {
  async index(req, res) {
    const matriculations = await Matriculation.findAll({
      where: { canceled_at: null },
      order: ['id'],
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

    // Calculated price and end_date
    const price = plan.duration * plan.price;
    const end_date = addMonths(
      zonedTimeToUtc(parseISO(req.body.start_date), 'America/Sao_Paulo'),
      plan.duration
    );

    // Create matriculation
    const matriculation = {
      student_id: req.body.student_id,
      plan_id: req.body.plan_id,
      start_date: zonedTimeToUtc(
        parseISO(req.body.start_date),
        'America/Sao_Paulo'
      ),
      end_date,
      price,
    };

    await Matriculation.create(matriculation);

    // Send email for student
    const student = await Student.findByPk(req.body.student_id);

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Matricula cadastrada',
      text: 'Você foi matriculado na GymPoint!',
      template: 'matriculation',
      context: {
        student: student.name,
        plan: plan.title,
        start_date: format(
          matriculation.start_date,
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
        end_date: format(
          matriculation.end_date,
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
        price: matriculation.price,
      },
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
      start_date: req.body.start_date,
      end_date,
      price,
    });

    return res.json(matriculation);
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
