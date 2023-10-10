module.exports = function (sequelize, DataType) {
  const SurveyDtl = sequelize.define('SurveyDtl', {
    surveyDtlId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    surveyId: {
      type: DataType.INTEGER
    },
    surveyRefNo: {
      type: DataType.STRING
    },
    surveyQuestionRefNo: {
      type: DataType.STRING
    },
    questionId: {
      type: DataType.INTEGER
    },
    response: {
      type: DataType.STRING
    },
    questionCategory: {
      type: DataType.STRING
    },
    responseId: {
      type: DataType.INTEGER
    },
    responseCalculatedValue: {
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
    questionIdRef: {
      type: DataType.STRING
    },
    answers: {
      type: DataType.STRING
    },
    questionText: {
      type: DataType.STRING
    },
    npsText: {
      type: DataType.STRING
    },
    npsValue: {
      type: DataType.STRING
    },
    questionType: {
      type: DataType.STRING
    },
    subType: {
      type: DataType.STRING
    },
    metricName: {
      type: DataType.STRING
    },
    metricId: {
      type: DataType.STRING
    },
    metricScore: {
      type: DataType.STRING
    },
    metricScale: {
      type: DataType.STRING
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'survey_dtl'
  }
  )

  SurveyDtl.associate = function (models) {
  //   models.SurveyHdr.belongsTo(models.Address, {
  //     foreignKey: 'addressId',
  //     as: 'address'
  //   })
  //   models.SurveyHdr.belongsTo(models.Contact, {
  //     foreignKey: 'contactId',
  //     as: 'contact'
  //   })

    models.SurveyDtl.belongsTo(models.Questionare, {
      foreignKey: 'questionId',
      as: 'questions'
    })
   }
  return SurveyDtl
}
