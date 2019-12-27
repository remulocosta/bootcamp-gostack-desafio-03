import { subDays } from 'date-fns';
import { Op } from 'sequelize';
import paginate from '../../util/dbPagination';
import * as Yup from 'yup';

import Checkin from '../models/Checkin';
import Registration from '../models/Registration';
import Student from '../models/Student';

class CheckinController {
  async index(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (!(await Student.findByPk(req.params.id))) {
      return res.status(400).json({ error: 'Student not exists.' });
    }

    const { page = 1, limit = 7} = req.query;
    const offset = (page - 1) * limit;
    const { id } = req.params;

    const checkin = await Checkin.findAndCountAll({
      where: { student_id: id },
      order: ['id'],
      limit,
      offset,
    });

    return res.json(paginate(checkin, limit, page));
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (!(await Student.findByPk(req.params.id))) {
      return res.status(400).json({ error: 'Student not exists.' });
    }
    const { id } = req.params;

    const registration = await Registration.findOne({
      where: {
        student_id: id,
        start_date: { [Op.lte]: new Date() },
        end_date: { [Op.gte]: new Date() },
      },
    });

    if (!registration) {
      return res.status(400).json({ error: 'No valid registration found.' });
    }

    const checkDays = await Checkin.findAndCountAll({
      where: {
        student_id: id,
        created_at: { [Op.gte]: subDays(new Date(), 7) },
      },
    });

    if (checkDays.count >= 5) {
      return res
        .status(400)
        .json({ error: 'You can have only 5 checkins in the past 7 days' });
    }
    const successCheckin = await Checkin.create({ student_id: id });
    return res.json({ successCheckin });
  }
}

export default new CheckinController();
