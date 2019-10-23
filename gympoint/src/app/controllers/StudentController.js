import * as Yup from 'yup';
import Student from '../models/Student';

class StudentController {
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
      id: Yup.number()
        .integer()
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

    const { id, email } = req.body;

    const student = await Student.findOne({ where: { id } });

    if (!student) return res.status(400).json({ error: 'Student not found' });

    const studentExists = await Student.findOne({ where: { email } });

    if (!(id === studentExists.id)) {
      return res.status(400).json({ error: 'Student already exists' });
    }

    const { name, age, weigth, heigth } = await student.update(req.body);

    return res.json({ name, email, age, weigth, heigth });
  }
}

export default new StudentController();
