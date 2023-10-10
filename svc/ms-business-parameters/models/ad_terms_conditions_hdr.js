module.exports = function (sequelize, DataType) {
  const TermsConditionsHdr = sequelize.define('TermsConditionsHdr', {
    termId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    termName: {
      type: DataType.STRING
    },
    entityType: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    noOfDays: {
      type: DataType.INTEGER
    },
    status: {
      type: DataType.STRING
    },
    chargeId: {
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
    tranId: {
      type: DataType.STRING,
      allowNull: false
    },
    // createdDeptId: {
    //   type: DataType.STRING
    // },
    // createdRoleId: {
    //   type: DataType.INTEGER
    // },
    contractImpact: {
      type: DataType.BOOLEAN
    },
    paymentImpact: {
      type: DataType.BOOLEAN
    },
    billingImpact: {
      type: DataType.BOOLEAN
    },
    benefitsImpact: {
      type: DataType.BOOLEAN
    },
    templateId: {
      type: DataType.INTEGER
    },
    termsContent: {
      type: DataType.STRING,
    },
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'ad_terms_conditions_hdr'
  }
  )
  TermsConditionsHdr.associate = function (models) {
    models.TermsConditionsHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.TermsConditionsHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'entityType',
      as: 'entityTypeDesc'
    })
    models.TermsConditionsHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceType',
      as: 'serviceTypeDesc'
    })    
    models.TermsConditionsHdr.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.TermsConditionsHdr.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.TermsConditionsHdr.hasMany(models.TemplateHdr, {
      foreignKey: 'templateId',
      as: 'templateHdr'
    })
    models.TermsConditionsHdr.hasMany(models.TermsConditionsDtl, {
      sourceKey: 'termId',
      foreignKey: 'termId',
      as: 'termDtl'
    })
    models.TermsConditionsHdr.hasOne(models.Charge, {
      sourceKey: 'chargeId',
      foreignKey: 'chargeId',
      as: 'chargeDtl'
    })
  }
  return TermsConditionsHdr
}
