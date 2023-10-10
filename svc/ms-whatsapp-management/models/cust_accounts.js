module.exports = function (sequelize, DataType) {
  const CustAccounts = sequelize.define('CustAccounts', {
    accountId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    accountCategory: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    accountClass: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    accountPriority: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    accountLevel: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    customerId: {
      type: DataType.BIGINT
    },
    firstName: {
      type: DataType.STRING
    },
    lastName: {
      type: DataType.STRING
    },
    gender: {
      type: DataType.STRING
    },
    registeredDate: {
      type: DataType.DATE
    },
    registeredNo: {
      type: DataType.STRING
    },
    idType: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    idValue: {
      type: DataType.STRING
    },
    accountNo: {
      type: DataType.STRING
    },
    accountRefNo: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING,
      defaultValue: 'ACTIVE'
    },
    billLanguage: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    accountType: {
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
    accountUuid: {
      type: DataType.STRING
    },
    customerUuid: {
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
    expiryDate: {
      type: DataType.DATE
    },
    notificationPreference: {
      type: DataType.STRING
    },
    creditLimit: {
      type: DataType.INTEGER
    },
    accountBalance: {
      type: DataType.INTEGER
    },
    accountOutstanding: {
      type: DataType.INTEGER
    },
    accountStatusReason: {
      type: DataType.STRING
    },
    currency: {
      type: DataType.STRING
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'cust_accounts',
    indexes: [
      {
        name: 'cust_accounts_no_uk',
        unique: true,
        fields: [
          { name: 'account_no' }
        ]
      },
      {
        name: 'cust_accounts_pk',
        unique: true,
        fields: [
          { name: 'account_id' }
        ]
      }
    ]
  }
  )
  CustAccounts.associate = function (models) {
    // models.CustAccounts.hasMany(models.CustServices, {
    //   foreignKey: 'accountId',
    //   as: 'accountServices'
    // })
    models.CustAccounts.belongsTo(models.BusinessEntity, {
      foreignKey: 'accountCategory',
      as: 'accountCatagoryDesc'
    })
    models.CustAccounts.belongsTo(models.BusinessEntity, {
      foreignKey: 'accountClass',
      as: 'accountClassDesc'
    })
    models.CustAccounts.belongsTo(models.BusinessEntity, {
      foreignKey: 'accountLevel',
      as: 'accountLevelDesc'
    })
    models.CustAccounts.belongsTo(models.BusinessEntity, {
      foreignKey: 'accountPriority',
      as: 'accountPriorityDesc'
    })
    models.CustAccounts.belongsTo(models.BusinessEntity, {
      foreignKey: 'idType',
      as: 'idTypeDesc'
    })
    models.CustAccounts.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'accountStatus'
    })
    models.CustAccounts.belongsTo(models.BusinessEntity, {
      foreignKey: 'billLanguage',
      as: 'billLanguageDesc'
    })
    // models.CustAccounts.hasMany(models.Contact, {
    //   sourceKey: 'accountNo',
    //   foreignKey: 'contactCategoryValue',
    //   as: 'accountContact'
    // })
    // models.CustAccounts.hasMany(models.Address, {
    //   sourceKey: 'accountNo',
    //   foreignKey: 'addressCategoryValue',
    //   as: 'accountAddress'
    // })
  }
  return CustAccounts
}
