import { format } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Notification from '../schemas/Notification';

class HelpOrderController {
  async index(req, res) {
    const { id } = req.params;
    const { page = 1 } = req.query;

    const helpOrder = await HelpOrder.findAll({
      where: { student_id: id },
      attributes: ['id', 'question', 'created_at', 'answer', 'answer_at'],
      limit: 20,
      offset: (page - 1) * 20,
    });
    return res.json(helpOrder);
  }

  async store(req, res) {
    const { id } = req.params;
    const { question } = req.body;

    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    if (!(await Student.findByPk(id))) {
      return res.status(400).json({ error: 'Student not exists.' });
    }

    const helpOrderCreate = await HelpOrder.create({
      student_id: id,
      question,
    });

    const student = await Student.findByPk(id);
    const formattedDate = format(new Date(), "dd 'de' MMMM', às' H:mm'h'", {
      locale: pt,
    });

    /**
     * Notificar academia
     * Notify Gyn
     */
    await Notification.create({
      content: `Novo Pedidos de auxílio, de ${student.name} em ${formattedDate}`,
      helporder: helpOrderCreate.id,
      student: student.id,
    });

    return res.json(helpOrderCreate);
  }
}

export default new HelpOrderController();
