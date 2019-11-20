import Mail from '../../lib/Mail';

class AnswerMail {
  get key() {
    return 'AnswerMail';
  }

  async handle({ data }) {
    const { name, email, question, answer, answer_at } = data;

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'help order answered',
      template: 'answer',
      context: {
        studentName: name,
        question,
        answer,
        answer_at,
      },
    });
  }
}

export default new AnswerMail();
