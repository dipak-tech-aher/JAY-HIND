module.exports = function (sequelize, DataType) {
  const TenantDtl = sequelize.define('TenantDtl', {
    tenant_dtl_id:
      {
        type: DataType.BIGINT,
        primaryKey: true
      },
    tenant_no: {
      type: DataType.BIGINT,
      primaryKey: true
    },
    db_host: {
      type: DataType.STRING
    },
    db_port: {
      type: DataType.STRING
    },
    db_name: {
      type: DataType.STRING
    },
    db_username: {
      type: DataType.STRING
    },
    db_pwd: {
      type: DataType.STRING
    },
    db_schema_nm: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    uuid: {
      type: DataType.STRING
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'tenant_dtl'
  })
  return TenantDtl
}
