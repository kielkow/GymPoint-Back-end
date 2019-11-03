import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class MatriculationMail {
  get key() {
    return 'MatriculationMail';
  }

  async handle({ data }) {
    const { matriculation, student, plan } = data;

    console.log('Fila MatriculationMail executada');

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Matricula cadastrada',
      text: 'Você foi matriculado na GymPoint!',
      template: 'matriculation',
      context: {
        student: student.name,
        plan: plan.title,
        start_date: format(
          parseISO(matriculation.start_date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
        end_date: format(
          parseISO(matriculation.end_date),
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
