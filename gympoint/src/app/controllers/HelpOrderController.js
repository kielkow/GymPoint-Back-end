import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import HelpOrderAnswerMail from '../jobs/HelpOrderAnswerMail';
import Queue from '../../lib/Queue';

class HelpOrderController {
  async indexNoAnswer(req, res) {
    const { page = 1 } = req.query;

    const helporders = await HelpOrder.findAll({
      where: { answer: null },
      limit: 8,
      offset: (page - 1) * 8,
    });
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
    const { page = 1 } = req.query;

    const helporders = await HelpOrder.findAll({
      where: { student_id: req.params.id },
      limit: 10,
      offset: (page - 1) * 10,
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

    // Update helporder with the answer
    const helporder = await HelpOrder.findByPk(req.params.id);

    await helporder.update({ answer: req.body.answer, answer_at: new Date() });

    // Send email for student with the answer
    const student = await Student.findByPk(helporder.student_id);
    await Queue.add(HelpOrderAnswerMail.key, {
      helporder,
      student,
    });

    return res.json(helporder);
  }
}

export default new HelpOrderController();
