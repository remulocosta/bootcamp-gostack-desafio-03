import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpAnswerController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const helpOrder = await HelpOrder.findAll({
      order: ['id'],
      where: { answer: null },
      attributes: ['id', 'question', 'created_at', 'answer', 'answer_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
      ],
      limit: 20,
      offset: (page - 1) * 20,
    });
    return res.json(helpOrder);
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

    const successAnswer = await helpAnswer.update({
      answer,
      answer_at: new Date(),
    });

    return res.json(successAnswer);
  }
}

export default new HelpAnswerController();
