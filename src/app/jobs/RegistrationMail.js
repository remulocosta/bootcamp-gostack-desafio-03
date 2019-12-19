import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const {
      name,
      email,
      planPrice,
      title,
      duration,
      formatedInitialDate,
      formatedFinalDate,
    } = data;

    const defMount = duration > 1 ? 'meses' : 'mês';

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'Matricula realizada',
      template: 'registration',
      context: {
        studentName: name,
        planName: `${title} ( ${duration} ${defMount} ).`,
        planPrice,
        initialDate: formatedInitialDate,
        finalDate: formatedFinalDate,
      },
    });
  }
}

export default new RegistrationMail();
