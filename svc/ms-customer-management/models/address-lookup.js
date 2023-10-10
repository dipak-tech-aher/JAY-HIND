module.exports = function (sequelize, DataType) {
    const AddressLookup = sequelize.define('AddressLookup', {
      postCode: {
        type: DataType.STRING,
        primaryKey: true
      },
      city: {
        type: DataType.STRING
      },
      district: {
        type: DataType.STRING
      },
      region: {
        type: DataType.STRING
      },
      state: {
        type: DataType.STRING
      },
      country: {
        type: DataType.STRING
      },
      status: {
        type: DataType.STRING,
        defaultValue: 'AC'
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
      tableName: 'mst_address_lookup'
    }
    )
  
    AddressLookup.associate = function (models) { }
    return AddressLookup
  }
  