import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';
import Student from '../models/Student';
import Plan from '../models/Plan';

class MatriculationMail {
  get key() {
    return 'MatriculationMail';
  }

  async handle({ data }) {
    const { matriculation } = data;

    console.log('Fila executada');

    const student = await Student.findByPk(matriculation.student_id);
    const plan = await Plan.findByPk(matriculation.plan_id);

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
  }
}

export default new MatriculationMail();
