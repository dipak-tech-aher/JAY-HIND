
module.exports = function (sequelize, DataTypes) {
  const BillableDetails = sequelize.define('BillableDetails', {
    billableId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    customerId: {
      type: DataTypes.INTEGER
    },
    accountId: {
      type: DataTypes.INTEGER
    },
    serviceId: {
      type: DataTypes.INTEGER
    },
    bankAccountNo: {
      type: DataTypes.STRING
    },
    ifscCode: {
      type: DataTypes.STRING
    },
    billingGroup: {
      type: DataTypes.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    billFrequency: {
      type: DataTypes.STRING
    },
    billDeliveryMode: {
      type: DataTypes.STRING
    },
    billingType: {
      type: DataTypes.STRING
    },
    currency: {
      type: DataTypes.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    numberOfCopies: {
      type: DataTypes.INTEGER
    },
    billCycleGroup: {
      type: DataTypes.STRING
    },
    createdDeptId: {
      type: DataTypes.INTEGER
    },
    createdRoleId: {
      type: DataTypes.INTEGER
    },
    tranId: {
      type: DataTypes.STRING
    },
    billableUuid: {
      type: DataTypes.STRING
    },
    createdBy: {
      type: DataTypes.INTEGER
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedBy: {
      type: DataTypes.INTEGER
    },
    updatedAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'billable_details',
    timestamps: true,
    underscored: true
  })

  BillableDetails.associate = function (models) {
    models.BillableDetails.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByUser'
    })
    models.BillableDetails.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByUser'
    })
    models.BillableDetails.belongsTo(models.BusinessEntity, {
      foreignKey: 'billingGroup',
      as: 'billGroupDesc'
    })
    models.BillableDetails.belongsTo(models.BusinessEntity, {
      foreignKey: 'currency',
      as: 'currencyDesc'
    })
  }
  return BillableDetails
}
