module.exports = function (sequelize, DataType) {
  const ChatMenu = sequelize.define('ChatMenu', {
    menuId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    menuName: {
      type: DataType.STRING
    },
    jsonString: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('jsonString')) : this.getDataValue('jsonString')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('jsonString', JSON.stringify(value)) : this.setDataValue('jsonString', value)
      }
    },
    status: {
      type: DataType.STRING
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    },
    tranId: {
      type: DataType.STRING,
      allowNull: false
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
    }
  }, {
    tableName: 'cc_chat_menu',
    timestamps: true,
    underscored: true
  })

  return ChatMenu
}
