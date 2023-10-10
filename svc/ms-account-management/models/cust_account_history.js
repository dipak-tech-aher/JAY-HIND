module.exports = function (sequelize, DataType) {
  const CustAccountsHistory = sequelize.define('CustAccountsHistory', {
    historyId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    historyInsertedDate: {
      type: DataType.DATE
    },
    accountId: {
      type: DataType.INTEGER
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
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        const value = this.getDataValue('notificationPreference')
        try {
          return JSON.parse(value)
        } catch (e) {
          return value
        }
      },
      set: function (value) {
        value = typeof value === 'object' ? JSON.stringify(value) : value
        return this.setDataValue('notificationPreference', value)
      }
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
    },
    historyTranId: {
      type: DataType.STRING,
      allowNull: false
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'cust_accounts_history',
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
  CustAccountsHistory.associate = function (models) {
    models.CustAccountsHistory.hasMany(models.CustServices, {
      foreignKey: 'accountId',
      as: 'accountServices'
    })
    models.CustAccountsHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'accountCategory',
      as: 'accountCatagoryDesc'
    })
    models.CustAccountsHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'accountClass',
      as: 'accountClassDesc'
    })
    models.CustAccountsHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'accountLevel',
      as: 'accountLevelDesc'
    })
    models.CustAccountsHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'accountPriority',
      as: 'accountPriorityDesc'
    })
    models.CustAccountsHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'idType',
      as: 'idTypeDesc'
    })
    models.CustAccountsHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'accountStatus'
    })
    models.CustAccountsHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'billLanguage',
      as: 'billLanguageDesc'
    })
    models.CustAccountsHistory.hasMany(models.Contact, {
      sourceKey: 'accountNo',
      foreignKey: 'contactCategoryValue',
      as: 'accountContact'
    })
    models.CustAccountsHistory.hasMany(models.Address, {
      sourceKey: 'accountNo',
      foreignKey: 'addressCategoryValue',
      as: 'accountAddress'
    })
  }
  return CustAccountsHistory
}
