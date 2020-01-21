import Sequelize from 'sequelize';

import User from '../app/models/User';
import File from '../app/models/File';
import Student from '../app/models/Student';
import Plan from '../app/models/Plan';
import Matriculation from '../app/models/Matriculation';
import Checkin from '../app/models/Checkin';
import HelpOrder from '../app/models/HelpOrder';

import databaseConfig from '../config/database';

const models = [User, File, Student, Plan, Matriculation, Checkin, HelpOrder];

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
