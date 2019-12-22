import { addMonths, parseISO, isBefore, format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import * as Yup from 'yup';

import Queue from '../../lib/Queue';
import RegistrationMail from '../jobs/RegistrationMail';
import Plan from '../models/Plan';
import Registration from '../models/Registration';
import Student from '../models/Student';

class RegistrationController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const registration = await Registration.findAll({
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
    return res.json(registration);
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

    const registrationCreate = await Registration.create({
      student_id,
      plan_id,
      start_date: initialDate,
      end_date: finalDate,
      price: planPrice,
    });

    /**
     *  Notify email student registration
     */
    await Queue.add(RegistrationMail.key, {
      name,
      email,
      planPrice,
      title,
      duration,
      formatedInitialDate,
      formatedFinalDate,
    });

    return res.json(registrationCreate);
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
    const registrationExist = await Registration.findByPk(req.params.id);
    if (!registrationExist) {
      return res.status(400).json({ error: 'RegistrationExist not exists.' });
    }
    */

    if (!(await Registration.findByPk(req.params.id))) {
      return res.status(400).json({ error: 'Registration not exists.' });
    }

    if (!(await Plan.findByPk(req.body.plan_id))) {
      return res.status(400).json({ error: 'Plan not exists.' });
    }

    if (!(await Student.findByPk(req.body.student_id))) {
      return res.status(400).json({ error: 'Student not exists.' });
    }

    const registration = await Registration.findByPk(req.params.id);
    const { duration, price } = await Plan.findByPk(plan_id);

    const planPrice = duration * price;

    const initialDate = parseISO(start_date);

    if (isBefore(initialDate, new Date())) {
      return res.status(400).json({ error: 'Past date are not permitted' });
    }

    const finalDate = addMonths(initialDate, duration);

    const sucessRegistration = await registration.update({
      student_id,
      plan_id,
      start_date: initialDate,
      end_date: finalDate,
      price: planPrice,
    });

    // return res.json({ student_id, plan_id, start_date });
    return res.json(sucessRegistration);
  }

  async delete(req, res) {
    if (!(await Registration.findByPk(req.params.id))) {
      return res.status(400).json({ error: 'Registration not exists.' });
    }

    const registration = await Registration.destroy({
      where: { id: req.params.id },
    });

    if (!registration) {
      return res.status(400).json({ error: 'Error deleting Registration.' });
    }

    return res.json({ ok: 'Registration deleted.' });
  }
}

export default new RegistrationController();
