import * as Yup from 'yup';
import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';
import Student from '../models/Student';

class EnrollmentController {
  async index(req, res) {
    const enroll = await Enrollment.findAll({
      order: ['id'],
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
      ],
    });
    return res.json(enroll);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const planExists = await Plan.findByPk(req.body.plan_id);

    if (!planExists) {
      return res.status(400).json({ error: 'Plan not exists.' });
    }

    const studentExists = await Student.findByPk(req.body.student_id);

    if (!studentExists) {
      return res.status(400).json({ error: 'Student not exists.' });
    }

    const planPrice = planExists.duration * planExists.price;

    return res.json({ Valor: planPrice });
  }
}

export default new EnrollmentController();
