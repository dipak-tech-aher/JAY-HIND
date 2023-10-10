module.exports = function (sequelize, DataType) {
  const Interaction = sequelize.define('Interaction', {
    intxnId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    intxnNo: {
      type: DataType.STRING
    },
    intxnStatus: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    currEntity: {
      type: DataType.STRING
    },
    currRole: {
      type: DataType.STRING
    },
    currUser: {
      type: DataType.STRING
    },
    intxnCategory: {
      type: DataType.STRING
    },
    intxnType: {
      type: DataType.STRING
    },
    serviceCategory: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    intxnCause: {
      type: DataType.STRING
    },
    customerId: {
      type: DataType.INTEGER
    },
    profileId: {
      type: DataType.INTEGER
    },
    accountId: {
      type: DataType.INTEGER
    },
    serviceId: {
      type: DataType.INTEGER
    },
    requestId: {
      type: DataType.INTEGER
    },
    requestStatement: {
      type: DataType.STRING
    },
    intxnPriority: {
      type: DataType.STRING
    },
    intxnChannel: {
      type: DataType.STRING
    },
    helpdeskId: {
      type: DataType.INTEGER
    },
    chatId: {
      type: DataType.INTEGER
    },
    assignedDate: {
      type: DataType.DATE
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    },
    intxnDescription: {
      type: DataType.STRING
    },
    responseSolution: {
      type: DataType.STRING
    },
    childIntxn: {
      type: DataType.INTEGER
    },
    edoc: {
      type: DataType.DATE
    },
    intxnStatusReason: {
      type: DataType.STRING
    },
    intxnFamily: {
      type: DataType.STRING
    },
    intxnMode: {
      type: DataType.STRING
    },
    intxnRefNo: {
      type: DataType.STRING
    },
    slaCode: {
      type: DataType.STRING
    },
    slaLastAlertDate: {
      type: DataType.DATE
    },
    contactPreference: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('contactPreference')) : this.getDataValue('contactPreference')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('contactPreference', JSON.stringify(value)) : this.setDataValue('contactPreference', value)
      }
    },
    tranId: {
      type: DataType.STRING
    },
    intxnUuid: {
      type: DataType.STRING
    },
    customerUuid: {
      type: DataType.STRING
    },
    accountUuid: {
      type: DataType.STRING
    },
    serviceUuid: {
      type: DataType.STRING
    },
    createdBy: {
      type: DataType.INTEGER,
      references: {
        model: 'User',
        key: 'code'
      }
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
    isResolvedBy: {
      type: DataType.STRING
    },
    rcResolution: {
      type: DataType.STRING
    },
    productId: {
      type: DataType.INTEGER
    },
    formDetails: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('formDetails')) : this.getDataValue('formDetails')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('formDetails', JSON.stringify(value)) : this.setDataValue('formDetails', value)
      }
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'interaction'
  }
  )
  Interaction.associate = function (models) {
    models.Interaction.hasMany(models.InteractionTxn, {
      foreignKey: 'intxnId',
      as: 'txnDetails'
    })

    models.Interaction.belongsTo(models.BusinessEntity, {
      foreignKey: 'intxnType',
      as: 'srType'
    })

    models.Interaction.belongsTo(models.BusinessEntity, {
      foreignKey: 'intxnCategory',
      as: 'intxnCategoryDesc'
    })

    models.Interaction.belongsTo(models.BusinessEntity, {
      foreignKey: 'intxnStatus',
      as: 'currStatusDesc'
    })
    models.Interaction.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'userId'
    })
    models.Interaction.belongsTo(models.User, {
      foreignKey: 'currUser',
      as: 'currUserDetails'
    })

    models.Interaction.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceType',
      as: 'serviceTypeDesc'
    })
    models.Interaction.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceCategory',
      as: 'categoryDescription'
    })
    models.Interaction.belongsTo(models.BusinessEntity, {
      foreignKey: 'intxnPriority',
      as: 'priorityDescription'
    })

    models.Interaction.belongsTo(models.BusinessEntity, {
      foreignKey: 'intxnCause',
      as: 'interactionCauseDescription'
    })

    models.Interaction.belongsTo(models.BusinessEntity, {
      foreignKey: 'intxnChannel',
      as: 'channleDescription'
    })

    models.Interaction.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customerDetails'
    })
    // models.Interaction.belongsTo(models.Profile, {
    //   foreignKey: 'profileId',
    //   as: 'profileDetails'
    // })
    models.Interaction.belongsTo(models.BusinessUnit, {
      foreignKey: 'currEntity',
      as: 'departmentDetails'
    })
    models.Interaction.belongsTo(models.BusinessEntity, {
      foreignKey: 'slaCode',
      as: 'slaDescription'
    })
    models.Interaction.belongsTo(models.BusinessEntity, {
      foreignKey: 'contactPreference',
      as: 'cntPreferDescription'
    })

    models.Interaction.belongsTo(models.Role, {
      foreignKey: 'currRole',
      as: 'roleDetails'
    })
    // models.Interaction.belongsTo(models.KnowledgeBase, {
    //   foreignKey: 'requestId',
    //   as: 'statementDetails'
    // })
    // models.Interaction.belongsTo(models.Helpdesk, {
    //   foreignKey: 'helpdeskId',
    //   as: 'helpdeskDetails'
    // })
  }
  return Interaction
}
