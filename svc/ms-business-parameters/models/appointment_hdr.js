module.exports = function (sequelize, DataType) {
    const AppointmentHdr = sequelize.define('AppointmentHdr', {
        appointId: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        appointName: {
            type: DataType.STRING
        },
        status: {
            type: DataType.STRING
        },
        templateId: {
            type: DataType.INTEGER
        },
        appointType: {
            type: DataType.STRING
        },
        location: {
            type: DataType.STRING
        },
        userGroup: {
            type: DataType.STRING
        },        
        notifyId: {
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
        rosterId: {
            type: DataType.INTEGER
        },
        location: {
            type: DataType.STRING
        },
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'appointment_hdr'
    })

    AppointmentHdr.associate = function (models) {
    models.AppointmentHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.AppointmentHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'appointType',
      as: 'appointTypeDesc'
    })
    models.AppointmentHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'userGroup',
      as: 'userGroupDesc'
    }) 
    models.AppointmentHdr.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.AppointmentHdr.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.AppointmentHdr.belongsTo(models.TemplateHdr, {
      foreignKey: 'templateId',
      as: 'templateHdr'
    })
    models.AppointmentHdr.hasMany(models.AppointmentDtl, {
      foreignKey: 'appointId',
      as: 'appointmentDet'
    })
    models.AppointmentHdr.hasMany(models.AppointmentTxn, {
      foreignKey: 'appointId',
      as: 'appointmentTxnDet'
    })
  }
    return AppointmentHdr
}
