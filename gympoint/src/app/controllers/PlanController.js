import * as Yup from 'yup';
import { Op } from 'sequelize';
import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const { page = 1 } = req.query;

    if (req.query.title) {
      const plans = await Plan.findAll({
        where: {
          title: {
            [Op.iRegexp]: req.query.title,
          },
          canceled_at: null,
        },
        order: ['id'],
        limit: 8,
        offset: (page - 1) * 8,
      });
      return res.json(plans);
    }

    const plans = await Plan.findAll({
      where: { canceled_at: null },
      order: ['id'],
      limit: 8,
      offset: (page - 1) * 8,
    });
    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .integer()
        .required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const planExists = await Plan.findOne({
      where: { title: req.body.title, canceled_at: null },
    });

    if (planExists) {
      return res.status(400).json({ error: 'Plan already exist' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({ id, title, duration, price });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number().integer(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title } = req.body;

    const plan = await Plan.findByPk(req.params.id);

    if (!plan) return res.status(400).json({ error: 'Plan not found' });

    if (title !== plan.title) {
      const planExists = await Plan.findOne({
        where: { title },
      });

      if (planExists) {
        return res.status(400).json({ error: 'Plan already exist' });
      }
    }

    const { id, duration, price } = await plan.update(req.body);

    return res.json({ id, title, duration, price });
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    plan.canceled_at = new Date();

    await plan.save();

    return res.json(plan);
  }
}

export default new PlanController();
