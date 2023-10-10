module.exports = function (sequelize, DataType) {
  const Questionare = sequelize.define('Questionare', {
    questionId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    questionDescription: {
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
    tableName: 'questionare'
  }
  )

   Questionare.associate = function (models) {
  //   models.SurveyHdr.belongsTo(models.Address, {
  //     foreignKey: 'addressId',
  //     as: 'address'
  //   })
  //   models.SurveyHdr.belongsTo(models.Contact, {
  //     foreignKey: 'contactId',
  //     as: 'contact'
  //   })    
  }
  return Questionare
}
