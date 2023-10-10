module.exports = function (sequelize, DataType) {
  const Cart = sequelize.define('Cart', {
    cId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerId: {
      type: DataType.INTEGER,
    },
    cartItems: {
      type: DataType.JSONB
    },
    finalCalculations: {
      type: DataType.JSONB
    },
    appliedPromoCodes: {
      type: DataType.JSONB
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
      tableName: 'cart'
    }
  )

  Cart.associate = function (models) {
  }

  return Cart
}
