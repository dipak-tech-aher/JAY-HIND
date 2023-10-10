module.exports = function (sequelize, DataTypes) {
const InvItemHdr = sequelize.define('InvItemHdr', {
  invItemId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invItemNo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  invId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  invItemStatus: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productId: DataTypes.INTEGER,
  brandId: DataTypes.STRING,
  modelId: DataTypes.STRING,
  itemCategory: DataTypes.STRING,
  itemType: DataTypes.STRING,
  itemSubType: DataTypes.STRING,
  totalQuantity: DataTypes.INTEGER,
  usedQuantity: DataTypes.INTEGER,
  currentAvailQuantity: DataTypes.INTEGER,
  holdQuantity: DataTypes.INTEGER,
  purchasedFor: DataTypes.STRING,
  invItemUuid: {
    type: DataTypes.STRING,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  invUuid: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productUuid: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdDeptId: DataTypes.STRING,
  createdRoleId: DataTypes.INTEGER,
  createdBy: DataTypes.INTEGER,
  createdAt: DataTypes.DATE,
  updatedBy: DataTypes.INTEGER,
  updatedAt: DataTypes.DATE
}, {
    tableName: 'inv_item_hdr',
    timestamps: true,
    underscored: true
  })

  InvItemHdr.associate = function (models) {
   
    models.InvItemHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'brandId',
      as: 'brandDescription'
    })
    models.InvItemHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'modelId',
      as: 'modelDescription'
    })
    models.InvItemHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'itemCategory',
      as: 'itemCategoryDescription'
    })
    models.InvItemHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'itemType',
      as: 'itemTypeDescription'
    })
    models.InvItemHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'itemSubType',
      as: 'itemSubTypeDescription'
    })
    models.InvItemHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'invItemStatus',
      as: 'invItemStatusDescription'
    })
    models.InvItemHdr.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'productDet'
    })
}

return InvItemHdr;
}
