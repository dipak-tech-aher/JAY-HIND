module.exports = function (sequelize, DataType) {
  const ContactHistory = sequelize.define('ContactHistory', {
    historyId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    historyInsertedDate: {
      type: DataType.DATE
    },
    contactId: {
      type: DataType.INTEGER
    },
    contactNo: {
      type: DataType.STRING,
      unique: true
    },
    status: {
      type: DataType.STRING
    },
    isPrimary: {
      type: DataType.BOOLEAN
    },
    contactCategory: {
      type: DataType.STRING
    },
    contactCategoryValue: {
      type: DataType.STRING
    },
    contactType: {
      type: DataType.STRING
    },
    title: {
      type: DataType.STRING
    },
    firstName: {
      type: DataType.STRING
    },
    lastName: {
      type: DataType.STRING
    },
    emailId: {
      type: DataType.STRING
    },
    mobilePrefix: {
      type: DataType.STRING
    },
    mobileNo: {
      type: DataType.INTEGER
    },
    telephonePrefix: {
      type: DataType.STRING
    },
    telephoneNo: {
      type: DataType.INTEGER
    },
    whatsappNoPrefix: {
      type: DataType.STRING
    },
    whatsappNo: {
      type: DataType.INTEGER
    },
    fax: {
      type: DataType.STRING
    },
    facebookId: {
      type: DataType.STRING
    },
    instagramId: {
      type: DataType.STRING
    },
    telegramId: {
      type: DataType.STRING
    },
    secondaryEmail: {
      type: DataType.STRING
    },
    secondaryContactNo: {
      type: DataType.INTEGER
    },
    tranId: {
      type: DataType.STRING,
      allowNull: false
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
    },
    historyTranId: {
      type: DataType.STRING,
      allowNull: false
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'cmn_contact_history'
  }
  )

  ContactHistory.associate = function (models) {
    models.ContactHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.ContactHistory.hasOne(models.Customer, {
      sourceKey: 'contactCategoryValue',
      foreignKey: 'customerNo',
      as: 'customerDetails'
    })
  }
  return ContactHistory
}
