module.exports = function (sequelize, DataTypes) {
  const CustServices = sequelize.define('CustServices', {
    serviceId: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      primaryKey: true
    },
    serviceNo: {
      type: DataTypes.STRING
    },
    serviceName: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes
    },
    customerId: {
      type: DataTypes.BIGINT
    },
    accountId: {
      type: DataTypes.BIGINT
    },
    serviceCategory: {
      type: DataTypes.STRING
    },
    serviceType: {
      type: DataTypes.STRING
    },
    serviceClass: {
      type: DataTypes.STRING
    },
    planPayload: {
      type: DataTypes.JSONB
    },
    quantity: {
      type: DataTypes.INTEGER
    },
    activationDate: {
      type: DataTypes.DATEONLY
    },
    expiryDate: {
      type: DataTypes.DATEONLY
    },
    notificationPreference: {
      type: DataTypes.STRING
    },
    serviceAgreement: {
      type: DataTypes.BLOB('long')
    },
    serviceLimit: {
      type: DataTypes.DECIMAL
    },
    serviceUsage: {
      type: DataTypes.DECIMAL
    },
    serviceUnit: {
      type: DataTypes.STRING
    },
    serviceBalance: {
      type: DataTypes.DECIMAL
    },
    serviceStatusReason: {
      type: DataTypes.STRING
    },
    serviceProvisioningType: {
      type: DataTypes.STRING
    },
    paymentMethod: {
      type: DataTypes.STRING
    },
    customerUuid: {
      type: DataTypes.STRING
    },
    accountUuid: {
      type: DataTypes.STRING
    },
    serviceUuid: {
      type: DataTypes.STRING
    },
    createdDeptId: {
      type: DataTypes.STRING
    },
    createdRoleId: {
      type: DataTypes.INTEGER
    },
    tranId: {
      type: DataTypes.STRING
    },
    upfrontCharge: {
      type: DataTypes.STRING
    },
    advanceCharge: {
      type: DataTypes.STRING
    },
    createdBy: {
      type: DataTypes.INTEGER,
      references: {
        model: 'ad_users',
        key: 'user_id'
      }
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      references: {
        model: 'ad_users',
        key: 'user_id'
      }
    },
    contractMonths: {
      type: DataTypes.INTEGER
    },
    prodBundleId: {
      type: DataTypes.INTEGER
    },
    promoCode: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allow: null
    },
    promoContractMonths: {
      type: DataTypes.INTEGER
    },
    promoServiceLimit: {
      type: DataTypes.DECIMAL
    },
    promoServiceBalance: {
      type: DataTypes.DECIMAL
    },
    actualServiceBalance: {
      type: DataTypes.DECIMAL
    },
    actualServiceLimit: {
      type: DataTypes.DECIMAL
    },
    actualContractMonths: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'cust_services',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'cust_service_no_uk',
        unique: true,
        fields: [
          { name: 'service_no' }
        ]
      },
      {
        name: 'cust_service_pk',
        unique: true,
        fields: [
          { name: 'service_id' }
        ]
      }
    ]
  })

  CustServices.associate = function (models) {
    models.CustServices.hasMany(models.Contact, {
      sourceKey: 'serviceNo',
      foreignKey: 'contactCategoryValue',
      as: 'serviceContact'
    })
    models.CustServices.hasMany(models.Address, {
      sourceKey: 'serviceNo',
      foreignKey: 'addressCategoryValue',
      as: 'serviceAddress'
    })
    models.CustServices.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceCategory',
      as: 'srvcCatDesc'
    })
    models.CustServices.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceType',
      as: 'srvcTypeDesc'
    })
    models.CustServices.belongsTo(models.BusinessEntity, {
      foreignKey: 'paymentMethod',
      as: 'paymentMethodDesc'
    })
    models.CustServices.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'serviceStatus'
    })
  }

  return CustServices
}
