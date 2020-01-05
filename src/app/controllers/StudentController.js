import { Op } from 'sequelize';
import * as Yup from 'yup';

import paginate from '../../util/dbPagination';
import File from '../models/File';
import Student from '../models/Student';

class StudentsController {
  async index(req, res) {
    const { page = 1, limit = 7, q } = req.query;
    const offset = (page - 1) * limit;

    const options = {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
      order: ['id'],
      attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
      limit,
      offset,
    };

    if (q) {
      options.where = { name: { [Op.iLike]: `%${q}%` } };
    }

    const students = await Student.findAndCountAll(options);

    return res.json(paginate(students, limit, page));
  }

  async show(req, res) {
    const { id } = req.params;

    if (!id || !id.match(/^-{0,1}\d+$/))
      return res.status(400).json({ err: 'Student id not provided' });

    const options = {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
      where: { id },
      attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
    };

    const student = await Student.findOne(options);

    if (!student) {
      return res.status(404).json({ err: 'Student not found' });
    }

    return res.json(student);
  }

  async store(req, res) {
    // Cria esquema de campos para validação.
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number().required(),
      weight: Yup.number().required(),
      height: Yup.number().required(),
    });

    // Valida campos, retorna erro caso não valide os campos.
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // verilfica se ja existe e-mail cadastrado.
    const studentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    // se encontra o e-mail cadastrado, retorna mensagem de Estudante existent.
    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists.' });
    }

    // Envia campos para o banco de dados e retorna valores persistidos.
    const { id, name, email, age, weight, height } = await Student.create(
      req.body
    );

    // retorna valores cadastrados.
    return res.json({
      id,
      name,
      email,
      age,
      weight,
      height,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number().required(),
      weight: Yup.number().required(),
      height: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email } = req.body;

    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist!' });
    }

    if (email !== student.email) {
      const studentExists = await Student.findOne({ where: { email } });

      if (studentExists) {
        return res.status(400).json({ error: 'Email already exists.' });
      }
    }

    await student.update(req.body);

    const { id, name, age, weight, height, avatar } = await Student.findByPk(
      student.id,
      {
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['id', 'path', 'url'],
          },
        ],
      }
    );

    return res.json({
      id,
      name,
      email,
      age,
      weight,
      height,
      avatar,
    });
  }

  async delete(req, res) {
    const { id } = req.params;
    if (!id || !id.match(/^-{0,1}\d+$/))
      return res.status(400).json({ error: 'Student id not provided' });

    const student = await Student.findByPk(id);
    await student.destroy();

    return res.json({
      msg: `Student - ${student.name}<${student.email}> deleted successfully`,
    });
  }
}

export default new StudentsController();
