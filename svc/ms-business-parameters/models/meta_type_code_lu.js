module.exports = function (sequelize, DataType) {
    const MetaTypeCodeLu = sequelize.define('MetaTypeCodeLu', {
        codeType: {
            type: DataType.STRING,
            primaryKey: true
        },
        code: {
            type: DataType.STRING
        },
        description: {
            type: DataType.STRING
        },
        status: {
            type: DataType.STRING,
            defaultValue: 'AC'
        },
        tranId: {
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
        mappingKey: {
            type: DataType.STRING
        }
    },
        {
            timestamps: true,
            underscored: true,
            tableName: 'meta_type_code_lu'
        }
    )

    return MetaTypeCodeLu
}
