import { addMonths, parseISO, isBefore, format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Op } from 'sequelize';
import * as Yup from 'yup';

import Queue from '../../lib/Queue';
import paginate from '../../util/dbPagination';
import RegistrationMail from '../jobs/RegistrationMail';
import Plan from '../models/Plan';
import Registration from '../models/Registration';
import Student from '../models/Student';

class RegistrationController {
  async index(req, res) {
    const { page = 1, limit = 7, q } = req.query;
    const offset = (page - 1) * limit;

    const options = {
      order: ['id'],
      attributes: ['id', 'start_date', 'end_date', 'price', 'active'],
      include: [
        {
          model: Student,
          as: 'student',
          where: q ? { name: { [Op.iLike]: `%${q}%` } } : {},
          attributes: ['id', 'name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title'],
        },
      ],
      limit,
      offset,
    };

    const registration = await Registration.findAndCountAll(options);

    return res.json(paginate(registration, limit, page));
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

    /**
     * valida campos do corpo da requisição
     */
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    /**
     * desestrutura campos do corpo da requisição
     */
    const { student_id, plan_id, start_date } = req.body;

    /**
     * Verifica se existe a matricula
     */
    if (!(await Registration.findByPk(req.params.id))) {
      return res.status(400).json({ error: 'Registration not exists.' });
    }

    /**
     * Verifica se existe o plano
     */
    if (!(await Plan.findByPk(req.body.plan_id))) {
      return res.status(400).json({ error: 'Plan not exists.' });
    }

    /**
     * Verifica se existe o aluno
     */
    if (!(await Student.findByPk(req.body.student_id))) {
      return res.status(400).json({ error: 'Student not exists.' });
    }

    /**
     * busca dados da matricula
     */
    const registration = await Registration.findByPk(req.params.id);

    /**
     * busca dados do plano
     */
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
