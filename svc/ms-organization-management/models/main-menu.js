module.exports = function (sequelize, DataType) {
  const Mainmenu = sequelize.define('Mainmenu', {
    menuId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    moduleName: {
      type: DataType.STRING
    },
    menuName: {
      type: DataType.STRING
    },
    screenName: {
      type: DataType.STRING
    },
    icon: {
      type: DataType.STRING
    },
    props: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('props') ? JSON.parse(this.getDataValue('props')) : this.getDataValue('props') : this.getDataValue('props')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('props', JSON.stringify(value)) : this.setDataValue('props', value)
      }
    },
    url: {
      type: DataType.STRING
    },
    moduleIcon: {
      type: DataType.STRING
    },
    links: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('links') ? JSON.parse(this.getDataValue('links')) : this.getDataValue('links') : this.getDataValue('links')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('links', JSON.stringify(value)) : this.setDataValue('links', value)
      }
    }
  },
  {
    timestamps: false,
    underscored: true,
    tableName: 'meta_menu_configuration'
  }
  )

  return Mainmenu
}
