import Mail from '../../lib/Mail';

class MatriculationMail {
  get key() {
    return 'HelpOrderAnswerMail';
  }

  async handle({ data }) {
    const { helporder, student } = data;

    console.log('Fila HelpOrderAnswerMail executada');

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Resposta da pergunta',
      text: 'Resposta para sua pergunta!',
      template: 'helpOrderAnswer',
      context: {
        student: student.name,
        question: helporder.question,
        answer: helporder.answer,
      },
    });
  }
}

export default new MatriculationMail();
