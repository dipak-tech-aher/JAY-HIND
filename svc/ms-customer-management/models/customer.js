module.exports = function (sequelize, DataType) {
  const Customer = sequelize.define('Customer', {
    customerId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    businessName: {
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
        const value = this.getDataValue('contactPreferences')
        try {
          return JSON.parse(value)
        } catch (e) {
          return value
        }
      },
      set: function (value) {
        value = typeof value === 'object' ? JSON.stringify(value) : value
        return this.setDataValue('contactPreferences', value)
      }
    },
    projectMapping: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('projectMapping')) : this.getDataValue('projectMapping')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('projectMapping', JSON.stringify(value)) : this.setDataValue('projectMapping', value)
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
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'cust_customers'
  }
  )
  Customer.associate = function (models) {
    models.Customer.belongsTo(models.BusinessEntity, {
      foreignKey: 'gender',
      as: 'genderDesc'
    })
    models.Customer.belongsTo(models.BusinessEntity, {
      foreignKey: 'idType',
      as: 'idTypeDesc'
    })
    models.Customer.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.Customer.belongsTo(models.BusinessEntity, {
      foreignKey: 'customerCategory',
      as: 'customerCatDesc'
    })
    models.Customer.belongsTo(models.BusinessEntity, {
      foreignKey: 'customerClass',
      as: 'customerClassDesc'
    })
    // models.Customer.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'contactPreferences',
    //   as: 'customerConPrefDesc'
    // })
    models.Customer.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.Customer.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.Customer.hasMany(models.Contact, {
      sourceKey: 'customerNo',
      foreignKey: 'contactCategoryValue',
      as: 'customerContact'
    })
    models.Customer.hasMany(models.Address, {
      sourceKey: 'customerNo',
      foreignKey: 'addressCategoryValue',
      as: 'customerAddress'
    })
    models.Customer.hasMany(models.CustAccounts, {
      sourceKey: 'customerId',
      foreignKey: 'customerId',
      as: 'customerAccounts'
    })
    models.Customer.hasMany(models.CustServices, {
      sourceKey: 'customerId',
      foreignKey: 'customerId',
      as: 'customerServices'
    })
    models.Customer.hasMany(models.Interaction, {
      sourceKey: 'customerId',
      foreignKey: 'customerId',
      as: 'interactionDetails'
    })
    models.Customer.hasMany(models.BillableDetails, {
      sourceKey: 'customerId',
      foreignKey: 'customerId',
      as: 'billableDetails'
    })
  }
  return Customer
}
