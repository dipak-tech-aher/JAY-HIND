module.exports = function (sequelize, DataType) {
  const Helpdesk = sequelize.define('Helpdesk', {
    helpdeskId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    pendingWith: {
      type: DataType.STRING
    },
    complitionDate: {
      type: DataType.DATE
    },
    helpdeskNo: {
      type: DataType.STRING
    },
    helpdeskSubject: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    statusChngDate: {
      type: DataType.DATE
    },
    helpdeskSource: {
      type: DataType.STRING
    },
    helpdeskCategory: {
      type: DataType.STRING
    },
    helpdeskType: {
      type: DataType.STRING
    },
    priority: {
      type: DataType.STRING
    },
    userCategory: {
      type: DataType.STRING
    },
    userCategoryValue: {
      type: DataType.STRING
    },
    mailId: {
      type: DataType.STRING
    },
    phoneNo: {
      type: DataType.INTEGER
    },
    contactId: {
      type: DataType.INTEGER
    },
    contactPreference: {
      type: DataType.STRING
    },
    helpdeskContent: {
      type: DataType.STRING
    },
    helpdeskEmail: {
      type: DataType.STRING
    },
    currDept: {
      type: DataType.INTEGER
    },
    currRole: {
      type: DataType.INTEGER
    },
    currUser: {
      type: DataType.INTEGER
    },
    ivrNo: {
      type: DataType.STRING
    },
    referenceId: {
      type: DataType.STRING
    },
    helpdeskUuid: {
      type: DataType.STRING
    },
    helpdeskIdJira: {
      type: DataType.STRING
    },
    project: {
      type: DataType.STRING
    },
    selfassignedAt: {
      type: DataType.DATE
    },
    messageDateTime: {
      type: DataType.DATE
    },
    userName: {
      type: DataType.STRING
    },
    cancelReason: {
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
    severity: {
      type: DataType.STRING
    }
  },
    {
      tableName: 'helpdesk',
      timestamps: true,
      underscored: true
    })

  Helpdesk.associate = function (models) {
    models.Helpdesk.hasMany(models.HelpdeskTxn, {
      foreignKey: 'helpdeskId',
      as: 'txnDetails'
    })
    models.Helpdesk.hasMany(models.Interaction, {
      foreignKey: 'helpdeskId',
      as: 'helpdeskInteractionDetails'
    })
    models.Helpdesk.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByDetails'
    })
    models.Helpdesk.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByDetails'
    })

    models.Helpdesk.belongsTo(models.User, {
      foreignKey: 'currUser',
      as: 'assignedAgentDetails'
    })

    models.Helpdesk.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })

    models.Helpdesk.belongsTo(models.BusinessEntity, {
      foreignKey: 'helpdeskType',
      as: 'helpdeskTypeDesc'
    })

    models.Helpdesk.belongsTo(models.BusinessEntity, {
      foreignKey: 'severity',
      as: 'severityDesc'
    })

    models.Helpdesk.belongsTo(models.BusinessEntity, {
      foreignKey: 'priority',
      as: 'priorityDesc'
    })
    models.Helpdesk.belongsTo(models.BusinessEntity, {
      foreignKey: 'project',
      as: 'projectDesc'
    })

    models.Helpdesk.belongsTo(models.BusinessEntity, {
      foreignKey: 'helpdeskSource',
      as: 'helpdeskSourceDesc'
    })

    models.Helpdesk.belongsTo(models.BusinessUnit, {
      foreignKey: 'currDept',
      as: 'currDeptDesc'
    })

    models.Helpdesk.belongsTo(models.Role, {
      foreignKey: 'currRole',
      as: 'currRoleDesc'
    })

    models.Helpdesk.belongsTo(models.BusinessEntity, {
      foreignKey: 'userCategory',
      as: 'userCategoryDesc'
    })

    models.Helpdesk.belongsTo(models.Contact, {
      sourceKey: 'contactId',
      foreignKey: 'contactId',
      as: 'contactDetails'
    })
  }
  return Helpdesk
}
