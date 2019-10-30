module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('students', 'matriculation_id', {
      type: Sequelize.INTEGER,
      references: { model: 'matriculations', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('students', 'matriculation_id');
  },
};
