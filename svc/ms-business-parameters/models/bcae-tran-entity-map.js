module.exports = function (sequelize, DataType) {
  const TranEntityMap = sequelize.define('TranEntityMap', {
    tranMapId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    tranMapNo: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    ouId: {
      type: DataType.STRING
    },
    productFamily: {
      type: DataType.STRING
    },
    // productCategory: {
    //   type: DataType.STRING
    // },
    // productSubCategory: {
    //   type: DataType.STRING
    // },
    productType: {
      type: DataType.STRING
    },
    productSubType: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    entityType: {
      type: DataType.STRING
    },
    tranCategory: {
      type: DataType.STRING
    },
    tranType: {
      type: DataType.STRING
    },  
    deptId: {
      type: DataType.STRING
    },
    roleId: {
      type: DataType.STRING
    },         
    tranMapUuid: {
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
    }
  }, {
    tableName: 'bcae_tran_entity_map',
    timestamps: true,
    underscored: true
  })

  TranEntityMap.associate = function (models) {
      
	}

  return TranEntityMap
}
