
module.exports = function (sequelize, DataTypes) {
  const AddonMst = sequelize.define('AddonMst', {
    addonId: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    addonName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    serviceType: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    volumeAllowed: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    multipleSelection: {
      type: DataTypes.STRING,
      allowNull: true
    },
    property: {
      type: (sequelize.options.dialect === 'mssql') ? DataTypes.STRING : DataTypes.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('property')) : this.getDataValue('property')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('property', JSON.stringify(value)) : this.setDataValue('property', value)
      }
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    remarks: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    underscored: true,
    tableName: 'addon_mst',
    timestamps: true,
    indexes: [
      {
        name: 'addon_mst_pk',
        unique: true,
        fields: [
          { name: 'addon_id' }
        ]
      }
    ]
  })

  AddonMst.associate = function (models) {
    models.AddonMst.hasMany(models.AddonCharge, {
      foreignKey: 'addonId',
      as: 'addonCharges'
    })

    models.AddonMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.AddonMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceType',
      as: 'serviceTypeDesc'
    })
    models.AddonMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'multipleSelection',
      as: 'multipleSelectionDesc'
    })
    models.AddonMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'volumeAllowed',
      as: 'volumeAllowedDesc'
    })
    models.AddonMst.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByUser'
    })
    models.AddonMst.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByUser'
    })
  }
  return AddonMst
}
