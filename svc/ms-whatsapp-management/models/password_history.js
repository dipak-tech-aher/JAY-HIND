module.exports = function (sequelize, DataType) {
  const PwdHistory = sequelize.define('PwdHistory', {
    histId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    histInsertedDate: {
      type: DataType.DATE
    },
    userId: {
      type: DataType.BIGINT
    },
    oldPassword: {
      type: DataType.STRING
    },
    // newPassword: {
    //   type: DataType.STRING
    // },
    pwdChangedBy: {
      type: DataType.BIGINT
    }
  }, {
    tableName: 'pwd_history',
    timestamps: false,
    underscored: true
  })
  PwdHistory.associate = function (models) {
    models.PwdHistory.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    })
  }

  return PwdHistory
}
