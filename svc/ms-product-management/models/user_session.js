module.exports = function (sequelize, DataType) {
  const UserSession = sequelize.define('UserSession', {
    sessionId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    accessToken: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('accessToken') ? JSON.parse(this.getDataValue('accessToken')) : this.getDataValue('accessToken') : this.getDataValue('accessToken')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('accessToken', JSON.stringify(value)) : this.setDataValue('accessToken', value)
      }
    },
    userId: {
      type: DataType.INTEGER
    },
    payload: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('payload') ? JSON.parse(this.getDataValue('payload')) : this.getDataValue('payload') : this.getDataValue('payload')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('payload', JSON.stringify(value)) : this.setDataValue('payload', value)
      }
    },
    createdBy: {
      type: DataType.INTEGER
    },
    createdAt: {
      type: DataType.DATE
    },
    updatedBy: {
      type: DataType.INTEGER
    },
    updatedAt: {
      type: DataType.DATE
    },
    permissions: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('permissions') ? JSON.parse(this.getDataValue('permissions')) : this.getDataValue('permissions') : this.getDataValue('permissions')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('permissions', JSON.stringify(value)) : this.setDataValue('permissions', value)
      }
    },
    currRole: {
      type: DataType.STRING
    },
    currDept: {
      type: DataType.STRING
    },
    currRoleId: {
      type: DataType.INTEGER
    },
    currDeptId: {
      type: DataType.INTEGER
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'user_session'
  })

  UserSession.associate = function (models) {
    models.UserSession.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    })
  }
  return UserSession
}
