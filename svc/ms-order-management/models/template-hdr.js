module.exports = function (sequelize, DataType) {
  const TemplateHdr = sequelize.define('TemplateHdr', {
    templateId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    templateNo: {
      type: DataType.STRING
    },
    templateCategory: {
      type: DataType.STRING
    },
    templateName: {
      type: DataType.STRING
    },
    userGroup: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    eventType: {
      type: DataType.STRING
    },
    calendarId: {
      type: DataType.STRING
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
    isPinned: {
      type: DataType.BOOLEAN
    },
    entity: {
      type: DataType.STRING
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'template_hdr'
  }
  )
  TemplateHdr.associate = function (models) {
    models.TemplateHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.TemplateHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'templateCategory',
      as: 'categoryDesc'
    })
    models.TemplateHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'userGroup',
      as: 'userGroupDesc'
    })
    models.TemplateHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'eventType',
      as: 'eventTypeDesc'
    })
    models.TemplateHdr.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.TemplateHdr.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.TemplateHdr.hasMany(models.TemplateMapping, {
      foreignKey: 'templateId',
      as: 'templateMap'
    })
    // models.TemplateHdr.hasMany(models.AppointmentHdr, {
    //   foreignKey: 'templateId',
    //   as: 'appointmentHdr'
    // })
    // models.TemplateHdr.hasMany(models.NotificationHdr, {
    //   foreignKey: 'templateId',
    //   as: 'notificationHdr'
    // })
    // models.TemplateHdr.hasOne(models.ProductBundleHdr, {
    //   foreignKey: 'templateId',
    //   as: 'productBundleHdr'
    // })
    // models.TemplateHdr.hasOne(models.TermsConditionsHdr, {
    //   foreignKey: 'templateId',
    //   as: 'termsHdr'
    // })
    // models.TemplateHdr.hasOne(models.PromoHdr, {
    //   foreignKey: 'templateId',
    //   as: 'promoHdr'
    // })
    models.TemplateHdr.hasOne(models.NotificationTemplate, {
      foreignKey: 'templateHdrId',
      as: 'notificationTemplate'
    })
  }
  return TemplateHdr
}
