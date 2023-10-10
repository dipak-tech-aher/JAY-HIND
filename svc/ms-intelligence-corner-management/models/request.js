module.exports = function (sequelize, DataType) {
  const Request = sequelize.define('Request', {
    requestId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    requestNo: {
      type: DataType.STRING
    },
    requestStatus: {
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
    entityType: {
      type: DataType.STRING
    },
    entityValue: {
      type: DataType.STRING
    },
    requestDate: {
      type: DataType.DATE
    },
    // requestCategory: {
    //   type: DataType.STRING
    // },
    // requestSource: {
    //   type: DataType.STRING
    // },
    // requestCause: {
    //   type: DataType.STRING
    // },
    requestType: {
      type: DataType.STRING
    },
    requestChannel: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    requestPriority: {
      type: DataType.STRING
    },
    assignedDate: {
      type: DataType.DATE
    },
    edof: {
      type: DataType.DATE
    },
    requestDescription: {
      type: DataType.STRING
    },
    requestStatusReason: {
      type: DataType.STRING
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
    slaCode: {
      type: DataType.STRING
    },
    slaLastAlertDate: {
      type: DataType.DATE
    },
    requestStatementId: {
      type: DataType.INTEGER
    },
    requestStatement: {
      type: DataType.STRING
    },
    requestUuid: {
      type: DataType.STRING
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    },
    tranId: {
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
    }
  },
    {
      timestamps: true,
      underscored: true,
      tableName: 'request_hdr'
    }
  )
  Request.associate = function (models) {
    models.Request.hasMany(models.RequestTxn, {
      foreignKey: 'requestId',
      as: 'txnDetails'
    })

    models.Request.belongsTo(models.BusinessEntity, {
      foreignKey: 'requestType',
      as: 'requestTypeDesc'
    })
    models.Request.belongsTo(models.BusinessEntity, {
      foreignKey: 'requestStatus',
      as: 'currStatusDesc'
    })
    models.Request.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'userId'
    })
    models.Request.belongsTo(models.User, {
      foreignKey: 'currUser',
      as: 'currUserDetails'
    })
    // models.Request.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'requestCategory',
    //   as: 'categoryDesc'
    // })
    models.Request.belongsTo(models.BusinessEntity, {
      foreignKey: 'requestPriority',
      as: 'priorityDesc'
    })
    // models.Request.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'requestCause',
    //   as: 'RequestCauseDesc'
    // })
    models.Request.belongsTo(models.BusinessEntity, {
      foreignKey: 'requestChannel',
      as: 'channleDescription'
    })
    models.Request.belongsTo(models.BusinessUnit, {
      foreignKey: 'currEntity',
      as: 'departmentDetails'
    })
    models.Request.belongsTo(models.BusinessEntity, {
      foreignKey: 'slaCode',
      as: 'slaDescription'
    })
    models.Request.belongsTo(models.BusinessEntity, {
      foreignKey: 'contactPreference',
      as: 'cntPreferDescription'
    })
    models.Request.belongsTo(models.Role, {
      foreignKey: 'currRole',
      as: 'roleDetails'
    })
  }
  return Request
}
