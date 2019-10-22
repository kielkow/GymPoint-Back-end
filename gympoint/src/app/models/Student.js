import Sequelize, { Model } from 'sequelize';

class Student extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        age: Sequelize.INTEGER,
        weigth: Sequelize.FLOAT,
        heigth: Sequelize.FLOAT,
      },
      {
        sequelize,
      }
    );
  }
}

export default Student;
