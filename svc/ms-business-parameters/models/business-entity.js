module.exports = function (sequelize, DataType) {
  const BusinessEntity = sequelize.define('BusinessEntity', {
    code: {
      type: DataType.STRING,
      primaryKey: true
    },
    description: {
      type: DataType.STRING
    },
    codeType: {
      type: DataType.STRING
    },
    mappingPayload: {
      type: DataType.JSONB
    },
    status: {
      type: DataType.STRING,
      defaultValue: 'AC'
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
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
    }
  },
    {
      timestamps: true,
      underscored: true,
      tableName: 'ad_business_entity'
    }
  )

  BusinessEntity.associate = function (models) {
    models.BusinessEntity.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.BusinessEntity.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    // models.BusinessEntity.belongsTo(models.MetaTypeCodeLu, {
    //   foreignKey: 'code',
    //   sourceKey: 'codeType',
    //   as: 'codeTypeDesc'
    // })
  }
  return BusinessEntity
}
