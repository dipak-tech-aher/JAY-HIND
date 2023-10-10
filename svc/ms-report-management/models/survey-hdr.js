module.exports = function (sequelize, DataType) {
  const SurveyHdr = sequelize.define('SurveyHdr', {
    surveyId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    surveyRefNo: {
      type: DataType.STRING
    },
    customerId: {
      type: DataType.INTEGER
    },
    customerName: {
      type: DataType.STRING
    },
    contactNo: {
      type: DataType.INTEGER
    },
    emailId: {
      type: DataType.STRING
    },
    customerAge: {
      type: DataType.INTEGER
    },
    gender: {
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
    },
    manager: {
      type: DataType.STRING
    },
    responseDate: {
      type: DataType.DATE
    },
    surveyName: {
      type: DataType.STRING
    },
    success: {
      type: DataType.STRING
    },
    totalResponseCount: {
      type: DataType.INTEGER
    },
    totalPages: {
      type: DataType.INTEGER
    },
    feedbacksCount: {
      type: DataType.INTEGER
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'survey_hdr'
  }
  )

   SurveyHdr.associate = function (models) {
  //   models.SurveyHdr.belongsTo(models.Address, {
  //     foreignKey: 'addressId',
  //     as: 'address'
  //   })
  //   models.SurveyHdr.belongsTo(models.Contact, {
  //     foreignKey: 'contactId',
  //     as: 'contact'
  //   })

    models.SurveyHdr.hasMany(models.SurveyDtl, {
      foreignKey: 'surveyId',
      as: 'surveyDtl'
    })
    models.SurveyHdr.hasMany(models.SurveySummary, {
      foreignKey: 'surveyId',
      as: 'surveySummary'
    })
  }
  return SurveyHdr
}
