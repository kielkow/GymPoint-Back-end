import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';

class HelpOrderController {
  async indexNoAnswer(req, res) {
    const helporders = await HelpOrder.findAll({ where: { answer: null } });
    return res.json(helporders);
  }

  async storeQuestion(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const question = await HelpOrder.create({
      student_id: req.params.id,
      question: req.body.question,
    });

    return res.json(question);
  }

  async indexStudentQuestions(req, res) {
    const helporders = await HelpOrder.findAll({
      where: { student_id: req.params.id },
    });
    return res.json(helporders);
  }

  async storeAnswer(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const helporder = await HelpOrder.findByPk(req.params.id);

    await helporder.update({ answer: req.body.answer, answer_at: new Date() });

    return res.json(helporder);
  }
}

export default new HelpOrderController();
