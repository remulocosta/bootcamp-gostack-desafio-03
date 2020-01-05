import { Op } from 'sequelize';
import * as Yup from 'yup';

import paginate from '../../util/dbPagination';
import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const { page = 1, limit = 5, q } = req.query;

    const options = {
      where: q
        ? { deleted_at: null, title: { [Op.iLike]: `%${q}%` } }
        : { deleted_at: null },
      attributes: ['id', 'title', 'duration', 'price'],
      order: ['id'],
      limit,
      offset: (page - 1) * limit,
    };

    const plans = await Plan.findAndCountAll(options);

    return res.json(paginate(plans, limit, page));
  }

  async show(req, res) {
    const { id } = req.params;

    const options = {
      where: { id },
      attributes: ['id', 'title', 'duration', 'price'],
    };

    const plans = await Plan.findOne(options);

    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const planExists = await Plan.findOne({
      where: { title: req.body.title },
    });

    if (planExists) {
      return res.status(400).json({ error: 'Plan already exists.' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist!' });
    }

    if (plan.title !== req.body.title) {
      const plantitleExists = await Plan.findOne({
        where: { title: req.body.title },
      });
      if (plantitleExists) {
        return res.status(400).json({ error: 'Plan title already Exists' });
      }
    }

    const { id, title, duration, price } = await plan.update(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async delete(req, res) {
    // Method to delete record
    /* const plan = await Plan.destroy({
      where: { id: req.params.id },
    }); */

    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist!' });
    }

    plan.deleted_at = new Date();

    await plan.save();

    return res.json({ ok: 'Plan deleted.' });
  }
}

export default new PlanController();
