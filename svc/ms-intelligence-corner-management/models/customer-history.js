module.exports = function (sequelize, DataType) {
  const CustomerHistory = sequelize.define('CustomerHistory', {
    historyId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    historyInsertedDate: {
      type: DataType.DATE
    },
    customerId: {
      type: DataType.INTEGER
    },
    customerUuid: {
      type: DataType.STRING,
      allowNull: false
    },
    tranId: {
      type: DataType.STRING,
      allowNull: false
    },
    customerAge: {
      type: DataType.INTEGER
    },
    customerNo: {
      type: DataType.STRING,
      unique: true
    },
    customerRefNo: {
      type: DataType.STRING
    },
    customerClass: {
      type: DataType.STRING
    },
    customerMaritalStatus: {
      type: DataType.STRING
    },
    occupation: {
      type: DataType.STRING
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
    birthDate: {
      type: DataType.DATE
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
    customerCategory: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    nationality: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING,
      defaultValue: 'AC',
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    customerPhoto: {
      type: DataType.STRING
    },
    taxNo: {
      type: DataType.STRING
    },
    billable: {
      type: DataType.STRING
    },
    customerStatusReason: {
      type: DataType.TEXT
    },
    contactPreferences: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        let value = this.getDataValue('contactPreferences');
        try {
          return JSON.parse(value);
        } catch(e) {
          return value;
        }
      },
      set: function (value) {
        value = typeof value == "object" ? JSON.stringify(value) : value;
        return this.setDataValue('contactPreferences', value);
      }
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
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
    historyTranId: {
      type: DataType.STRING,
      allowNull: false
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'cust_customers_history'
  }
  )
  CustomerHistory.associate = function (models) {
    models.CustomerHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'gender',
      as: 'genderDesc'
    })
    models.CustomerHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'idType',
      as: 'idTypeDesc'
    })
    models.CustomerHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.CustomerHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'customerCategory',
      as: 'customerCatDesc'
    })
    models.CustomerHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'customerClass',
      as: 'customerClassDesc'
    })
    models.CustomerHistory.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.CustomerHistory.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.CustomerHistory.hasMany(models.Contact, {
      sourceKey: 'customerNo',
      foreignKey: 'contactCategoryValue',
      as: 'customerContact'
    })
    models.CustomerHistory.hasMany(models.Address, {
      sourceKey: 'customerNo',
      foreignKey: 'addressCategoryValue',
      as: 'customerAddress'
    })
    models.CustomerHistory.hasMany(models.CustAccounts, {
      sourceKey: 'customerId',
      foreignKey: 'customerId',
      as: 'customerAccounts'
    })
    models.CustomerHistory.hasMany(models.CustConnections, {
      sourceKey: 'customerId',
      foreignKey: 'customerId',
      as: 'customerConnections'
    })
    models.CustomerHistory.hasMany(models.CustServices, {
      sourceKey: 'customerId',
      foreignKey: 'customerId',
      as: 'customerServices'
    })
    models.CustomerHistory.hasMany(models.Interaction, {
      sourceKey: 'customerId',
      foreignKey: 'customerId',
      as: 'interactionDetails'
    })
    models.CustomerHistory.hasMany(models.BillableDetails, {
      sourceKey: 'customerId',
      foreignKey: 'customerId',
      as: 'billableDetails'
    })
  }
  return CustomerHistory
}
