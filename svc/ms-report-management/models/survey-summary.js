module.exports = function (sequelize, DataType) {
  const SurveySummary = sequelize.define('SurveySummary', {
    surveySumId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    surveyId: {
      type: DataType.INTEGER
    },  
    customerId: {
      type: DataType.INTEGER
    },
    customerName: {
      type: DataType.STRING
    },
    questionCategory: {
      type: DataType.INTEGER
    },   
    sumValue: {
      type: DataType.INTEGER
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
    },
    fensScore: {
      type: DataType.INTEGER
    },    
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'survey_summary'
  }
  )

   SurveySummary.associate = function (models) {
  //   models.SurveyHdr.belongsTo(models.Address, {
  //     foreignKey: 'addressId',
  //     as: 'address'
  //   })
  //   models.SurveyHdr.belongsTo(models.Contact, {
  //     foreignKey: 'contactId',
  //     as: 'contact'
  //   })

    models.SurveySummary.hasMany(models.SurveyHdr, {
      foreignKey: 'surveyId',
      as: 'surveyHdr'
    })
  }
  return SurveySummary
}
