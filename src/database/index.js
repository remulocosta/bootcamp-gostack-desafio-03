import Sequelize from 'sequelize';

import Checkin from '../app/models/Checkin';
import File from '../app/models/File';
import HelpOrder from '../app/models/HelpOrder';
import Plan from '../app/models/Plan';
import Registration from '../app/models/Registration';
import Student from '../app/models/Student';
import User from '../app/models/User';
import databaseConfig from '../config/database';

const models = [User, Student, Plan, Registration, Checkin, HelpOrder, File];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

}

export default new Database();
