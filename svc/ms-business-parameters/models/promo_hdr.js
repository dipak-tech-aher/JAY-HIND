module.exports = function (sequelize, DataType) {
  const PromoHdr = sequelize.define('PromoHdr', {
    promoId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    promoName: {
      type: DataType.STRING
    },
    promoCode: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    promoType: {
      type: DataType.STRING
    },
    allowedTimes: {
      type: DataType.STRING
    },
    allowWithOtherPromo: {
      type: DataType.STRING
    },    
    startDate: {
      type: DataType.DATE
    },
    endDate: {
      type: DataType.DATE
    },    
    promoUuid: {
      type: DataType.STRING
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    },
    tranId: {
      type: DataType.STRING,
      allowNull: false
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
    templateId: {
      type: DataType.INTEGER
    },
    productBenefit: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('productBenefit') ? JSON.parse(this.getDataValue('productBenefit')) : this.getDataValue('productBenefit') : this.getDataValue('productBenefit')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('productBenefit', JSON.stringify(value)) : this.setDataValue('productBenefit', value)
      }
    },
    promoValidityDuration: {
      type: DataType.INTEGER
    },
    chargeId: {
      type: DataType.INTEGER
    },
    contractList: {
      type: DataType.ARRAY(DataType.INTEGER),
      allowNull: true,
    }
  }, {
    tableName: 'promo_hdr',
    timestamps: true,
    underscored: true
  })

  PromoHdr.associate = function (models) {  
    models.PromoHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.PromoHdr.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByUser'
    })
    models.PromoHdr.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByUser'
    })
    models.PromoHdr.hasMany(models.ProductCharge, {
      sourceKey: 'promoId',
      foreignKey: 'objectReferenceId',
      as: 'promoCharge'
    })
    models.PromoHdr.hasMany(models.Charge, {
      sourceKey: 'chargeId',
      foreignKey: 'chargeId',
      as: 'chargeDet'
    })
  }

  return PromoHdr
}
