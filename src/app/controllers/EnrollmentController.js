import * as Yup from 'yup';
import { addMonths, parseISO, isBefore, format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';
import Student from '../models/Student';

import EnrollmentMail from '../jobs/EnrollmentMail';
import Queue from '../../lib/Queue';

class EnrollmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
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
      limit: 20,
      offset: (page - 1) * 20,
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

    if (!(await Plan.findByPk(req.body.plan_id))) {
      return res.status(400).json({ error: 'Plan not exists.' });
    }

    if (!(await Student.findByPk(req.body.student_id))) {
      return res.status(400).json({ error: 'Student not exists.' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const { name, email } = await Student.findByPk(student_id);

    const { duration, price, title } = await Plan.findByPk(plan_id);

    const planPrice = duration * price;

    const initialDate = parseISO(start_date);

    if (isBefore(initialDate, new Date())) {
      return res.status(400).json({ error: 'Past date are not permitted' });
    }

    const finalDate = addMonths(initialDate, duration);

    const formatedInitialDate = format(
      initialDate,
      "'dia' dd 'de' MMMM, 'de' yyyy",
      { locale: ptBR }
    );
    const formatedFinalDate = format(
      finalDate,
      "'dia' dd 'de' MMMM, 'de' yyyy",
      { locale: ptBR }
    );

    const enrollmentCreate = await Enrollment.create({
      student_id,
      plan_id,
      start_date: initialDate,
      end_date: finalDate,
      price: planPrice,
    });

    /**
     *  Notify email student enrollment
     */
    await Queue.add(EnrollmentMail.key, {
      name,
      email,
      planPrice,
      title,
      duration,
      formatedInitialDate,
      formatedFinalDate,
    });

    return res.json(enrollmentCreate);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;
    /**
    const enrollExist = await Enrollment.findByPk(req.params.id);
    if (!enrollExist) {
      return res.status(400).json({ error: 'EnrollExist not exists.' });
    }
    */

    if (!(await Enrollment.findByPk(req.params.id))) {
      return res.status(400).json({ error: 'EnrollExist not exists.' });
    }

    if (!(await Plan.findByPk(req.body.plan_id))) {
      return res.status(400).json({ error: 'Plan not exists.' });
    }

    if (!(await Student.findByPk(req.body.student_id))) {
      return res.status(400).json({ error: 'Student not exists.' });
    }

    const enroll = await Enrollment.findByPk(req.params.id);
    const { duration, price } = await Plan.findByPk(plan_id);

    const planPrice = duration * price;

    const initialDate = parseISO(start_date);

    if (isBefore(initialDate, new Date())) {
      return res.status(400).json({ error: 'Past date are not permitted' });
    }

    const finalDate = addMonths(initialDate, duration);

    const sucessEnroll = await enroll.update({
      student_id,
      plan_id,
      start_date: initialDate,
      end_date: finalDate,
      price: planPrice,
    });

    // return res.json({ student_id, plan_id, start_date });
    return res.json(sucessEnroll);
  }

  async delete(req, res) {
    if (!(await Enrollment.findByPk(req.params.id))) {
      return res.status(400).json({ error: 'Enroll not exists.' });
    }

    const enroll = await Enrollment.destroy({ where: { id: req.params.id } });

    if (!enroll) {
      return res.status(400).json({ error: 'Error deleting Enroll.' });
    }

    return res.json({ ok: 'Enroll deleted.' });
  }
}

export default new EnrollmentController();
