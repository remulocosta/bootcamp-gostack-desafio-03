import * as Yup from 'yup';
import { subDays } from 'date-fns';
import { Op } from 'sequelize';
import Checkin from '../models/Checkin';
import Student from '../models/Student';
import Enrollment from '../models/Enrollment';

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

    const { id } = req.params;
    const checkin = await Checkin.findAndCountAll({
      where: { student_id: id },
      order: ['id'],
    });

    return res.json(checkin);
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

    const enroll = await Enrollment.findOne({
      where: {
        student_id: id,
        start_date: { [Op.lte]: new Date() },
        end_date: { [Op.gte]: new Date() },
      },
    });

    if (!enroll) {
      return res.status(400).json({ error: 'No valid enrollment found.' });
    }

    const checkDays = await Checkin.findAndCountAll({
      where: {
        student_id: id,
        created_at: { [Op.gte]: subDays(new Date(), 7) },
      },
    });

    if (checkDays.count > 5) {
      return res
        .status(400)
        .json({ error: 'You can have only 5 checkins in the past 7 days' });
    }
    const successCheckin = await Checkin.create({ student_id: id });
    return res.json({ successCheckin });
  }
}

export default new CheckinController();
