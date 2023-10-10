module.exports = function (sequelize, DataType) {
  const Plan = sequelize.define('Plan', {
    planId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    planName: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    startDate: {
      type: DataType.DATE
    },
    endDate: {
      type: DataType.DATE
    },
    property: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('property')) : this.getDataValue('property')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('property', JSON.stringify(value)) : this.setDataValue('property', value)
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
    remarks: {
      type: DataType.STRING
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'plan_mst'
  }
  )

  Plan.associate = function (models) {
    // models.Plan.hasMany(models.PlanCharge, {
    //   foreignKey: 'planId',
    //   as: 'planCharges'
    // })
    // models.Plan.belongsTo(models.User, {
    //   foreignKey: 'createdBy',
    //   as: 'createdByName'
    // })
    // models.Plan.belongsTo(models.User, {
    //   foreignKey: 'updatedBy',
    //   as: 'updatedByName'
    // })
    // models.Plan.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'status',
    //   as: 'statusDesc'
    // })
    // models.Plan.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'serviceType',
    //   as: 'serviceTypeDesc'
    // })
    // models.Plan.hasMany(models.PlanUsage, {
    //   foreignKey: 'planId',
    //   as: 'planUsage'
    // })
  }
  return Plan
}
