import * as Yup from 'yup';
import { Op } from 'sequelize';
import Student from '../models/Student';

class StudentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    if (req.query.name) {
      const students = await Student.findAll({
        where: {
          name: {
            [Op.iRegexp]: req.query.name,
          },
        },
        order: ['id'],
        limit: 8,
        offset: (page - 1) * 8,
      });
      return res.json(students);
    }

    const students = await Student.findAll({
      order: ['id'],
      limit: 8,
      offset: (page - 1) * 8,
    });
    return res.json(students);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider: Yup.bool()
        .oneOf([true], 'Field must be checked')
        .required(),
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .integer()
        .required(),
      weigth: Yup.number().required(),
      heigth: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exist' });
    }

    const { id, name, email, age, weigth, heigth } = await Student.create(
      req.body
    );

    return res.json({ id, name, email, age, weigth, heigth });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      provider: Yup.bool()
        .oneOf([true], 'Field must be checked')
        .required(),
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number().integer(),
      weigth: Yup.number(),
      heigth: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email } = req.body;

    const student = await Student.findByPk(req.params.id);

    if (!student) return res.status(400).json({ error: 'Student not found' });

    if (email !== student.email) {
      const studentExists = await Student.findOne({
        where: { email },
      });

      if (studentExists) {
        return res.status(400).json({ error: 'Student already exist' });
      }
    }

    const { name, age, weigth, heigth } = await student.update(req.body);

    return res.json({ name, email, age, weigth, heigth });
  }
}

export default new StudentController();
