module.exports = function (sequelize, DataType) {
  const Contact = sequelize.define('Contact', {
    contactId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'cmn_contact'
  }
  )

  Contact.associate = function (models) {
    models.Contact.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })

    models.Contact.hasOne(models.Customer, {
      sourceKey: 'contactCategoryValue',
      foreignKey: 'customerNo',
      as: 'customerDetails'
    })

    models.Contact.hasOne(models.Profile, {
      sourceKey: 'contactCategoryValue',
      foreignKey: 'profileNo',
      as: 'profileDetails'
    })
  }
  return Contact
}
