module.exports = function (sequelize, DataType) {
    const Faqs = sequelize.define('Faqs', {
        faqId: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        status: {
            type: DataType.STRING
        },
        question: {
            type: DataType.TEXT
        },
        answer: {
            type: DataType.TEXT
        },
        channel: {
            type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
            get: function () {
                let value = this.getDataValue('channel');
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value;
                }
            },
            set: function (value) {
                value = typeof value == "object" ? JSON.stringify(value) : value;
                return this.setDataValue('channel', value);
            }
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
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'mst_faq'
    })
    Faqs.associate = function (models) {
        models.Faqs.belongsTo(models.BusinessEntity, {
            foreignKey: 'channel',
            as: 'channelDesc'
        })
        models.Faqs.belongsTo(models.BusinessEntity, {
            foreignKey: 'status',
            as: 'statusDesc'
        })
    }
    return Faqs;
}
