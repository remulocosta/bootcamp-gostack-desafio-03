import Mail from '../../lib/Mail';

class EnrollmentMail {
  get key() {
    return 'EnrollmentMail';
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
      template: 'enrollment',
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

export default new EnrollmentMail();
