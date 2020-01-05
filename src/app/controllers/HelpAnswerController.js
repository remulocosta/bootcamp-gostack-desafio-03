import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import * as Yup from 'yup';

import Queue from '../../lib/Queue';
import paginate from '../../util/dbPagination';
import AnswerMail from '../jobs/AnswerMail';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpAnswerController {
  async index(req, res) {
    const { page = 1, limit = 5 } = req.query;
    const { id } = req.params;

    const helpOrder = await HelpOrder.findAndCountAll({
      order: ['id'],
      //  where: { answer: null, id },
      where: id ? { answer: null, id } : { answer: null },
      attributes: ['id', 'question', 'created_at', 'answer', 'answer_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
      limit,
      offset: (page - 1) * limit,
    });

    return res.json(paginate(helpOrder, limit, page));
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const { answer } = req.body;

    const helpAnswer = await HelpOrder.findByPk(id);
    if (!helpAnswer) {
      return res.status(400).json({ error: 'Help order not exists.' });
    }

    const helpOrder = await HelpOrder.findOne({
      where: { id },
      attributes: ['id', 'question'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    const successAnswer = await helpAnswer.update({
      answer,
      answer_at: new Date(),
    });

    /**
     *  Notify email student answered
     */
    await Queue.add(AnswerMail.key, {
      name: helpOrder.student.name,
      email: helpOrder.student.email,
      question: helpOrder.question,
      answer,
      answer_at: format(new Date(), "'dia' dd 'de' MMMM, 'de' yyyy", {
        locale: ptBR,
      }),
    });

    return res.json(successAnswer);
  }
}

export default new HelpAnswerController();
