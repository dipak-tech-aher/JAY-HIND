module.exports = function (sequelize, DataType) {
  const TermsConditionsDtl = sequelize.define('TermsConditionsDtl', {
    termDtlId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    termId: {
      type: DataType.STRING
    },
    termCategory: {
      type: DataType.STRING
    },
    termContent: {
      type: DataType.STRING
    },
    termValue: {
      type: DataType.INTEGER
    },
    status: {
      type: DataType.STRING
    },
    productId: {
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
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'ad_terms_conditions_dtl'
  }
  )
  TermsConditionsDtl.associate = function (models) {
    models.TermsConditionsDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })   
    models.TermsConditionsDtl.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.TermsConditionsDtl.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.TermsConditionsDtl.belongsTo(models.TermsConditionsHdr, {
      sourceKey: 'termId',
      foreignKey: 'termId',
      as: 'termHdr'
    })
    models.TermsConditionsDtl.belongsTo(models.Product, {
        sourceKey: 'productId',
        foreignKey: 'productId',
        as: 'productDtl'
    })
   
  }
  return TermsConditionsDtl
}
