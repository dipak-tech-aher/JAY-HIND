import { config } from '@config/env.config'
import jsonata from 'jsonata'
import { QueryTypes } from 'sequelize'
// import { logger } from './logger'
export const formateSelectQuery = async (json, context, conn) => {
  let query
  let columns = ' '
  let tables = ''
  let joins = ' '
  let params
  // Finding table columns
  for (const col of json.columns) {
    columns = columns + col.tableName + '.' + col.columnName + ', '
  }
  columns = columns.substring(0, columns.lastIndexOf(','))

  if (json.tables.length === 1) {
    joins = ' FROM ' + json.tables[0]
  } else {
    // Finding tables from JSON
    for (const tbl of json.tables) {
      tables = tables + '\'' + tbl + '\','
    }
    tables = tables.substring(0, tables.lastIndexOf(','))
    const rawQuery = `SELECT
    tc.constraint_name,
      tc.table_name as src_table,
      kcu.column_name as src_column,
      tc.constraint_type,
      ccu.table_name AS join_table,
        ccu.column_name AS join_column
    FROM
    information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
ON tc.constraint_name = kcu.constraint_name
AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
ON ccu.constraint_name = tc.constraint_name
AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
and tc.table_schema = ${config.dbProperties.schema}
AND tc.table_name in (${tables})
and ccu.table_name in (${tables})`
    const results = await conn.sequelize.query(rawQuery, {
      type: QueryTypes.SELECT
    })
    let fromClause = null
    // Appending join condotions
    for (const table of results) {
      if (fromClause === null) {
        fromClause = ' FROM  ' + table.src_table
      }
      joins = joins + ' INNER JOIN ' + table.join_table + ' ON ' + table.src_table + '.' + table.src_column + ' = ' + table.join_table + '.' + table.join_column
    }
    joins = fromClause + joins
  }

  query = json.queryType + columns + joins
  let waitClause
  if (json.waitUntil) {
    const wait = true

    waitClause = await formatWhereClause(json.waitUntil[0], context, wait)
    if (waitClause) {
      waitClause = waitClause.sql
    }
  }
  // appending where clause if available
  if (json.where) {
    const whereClause = await formatWhereClause(json.where[0], context)
    params = whereClause.params
    query = query + ' WHERE ' + whereClause.sql
  }
  return { query, params, waitClause, tables }
}

export const formateInsertQuery = async (json, context) => {
  const columns = []
  let query
  if (Array.isArray(json.tables) && Array.isArray(json.rowsToInsert) && json.tables.length === 1) {
    let values = '('
    for (const row of json.rowsToInsert) {
      for (const field of row.fields) {
        for (const col of json.columns) {
          if (col.tableName === field.tableName && col.columnName === field.columnName) {
            if (field.valueType === 'TEXT') {
              if (values === '(') {
                values = values + '\'' + field.value + '\''
              } else {
                values = values + ',\'' + field.value + '\''
              }
            } else if (field.valueType === 'EXPR') {
              const expression = jsonata(field.value)
              if (values === '(') {
                values = values + '\'' + expression.evaluate(context) + '\''
              } else {
                values = values + ',\'' + expression.evaluate(context) + '\''
              }
            }
            if (columns.includes(field.columnName) === false) {
              columns.push(field.columnName)
            }
          }
        }
      }
      // values = values + systemUserId + ',' + systemUserId + ',\'2021-07-28 18:50:21\'' + ',\'2021-07-28 18:50:21\''
      values = values + ')'
    }
    // values = values.substring(0, values.lastIndexOf(','))
    // Pushing audit columns
    // columns.push('created_by', 'updated_by', 'created_at', 'updated_at')
    query = 'INSERT INTO ' + json.tables[0] + '(' + columns + ') VALUES' + values + ';'
  }
  return query
}

export const formateUpdateQuery = async (json, context) => {
  let query
  let params
  if (Array.isArray(json.tables) && json.tables.length === 1) {
    let values = ''
    if (Array.isArray(json.rowToUpdate)) {
      for (const row of json.rowToUpdate) {
        for (const field of row.fields) {
          for (const col of json.columns) {
            if (col.tableName === field.tableName && col.columnName === field.columnName && field.valueType === 'TEXT') {
              values = values + field.columnName + ' = \'' + field.value + '\','
            }
          }
        }
      }
      values = values.substring(0, values.lastIndexOf(','))
      query = 'UPDATE ' + json.tables[0] + ' SET ' + values
      // appending where clause if available
      if (json.where) {
        const whereClause = formatWhereClause(json.where[0], context)
        params = whereClause.params
        query = query + ' WHERE ' + whereClause.sql + ';'
      }
    }
  }
  return { query, params }
}

export const formatWhereClause = async (ruleGroup, context, wait) => {
  const format = 'parameterized'

  const formatLowerCase = format.toLowerCase()

  const parameterized = formatLowerCase === 'parameterized'
  const params = []
  const processRule = async (rule) => {
    if (rule.valueType === 'EXPR') {
      const expression = jsonata(rule.value)
      // console.log(expression)
      rule.value = await expression.evaluate(context)
      // console.log('rule.value', rule.value)
    }
    if (rule.fieldType === 'EXPR') {
      const expression = jsonata(rule.field)
      // console.log('88888888888', expression)

      rule.field = await expression.evaluate(context)
    }

    const value = defaultValueProcessor(rule.tableName, rule.field, rule.operator, rule.value)
    const operator = mapOperator(rule.operator)
    if (parameterized && value) {
      if (operator.toLowerCase() === 'in' || operator.toLowerCase() === 'not in') {
        const splitValue = rule.value.split(',').map((v) => v.trim())
        splitValue.forEach((v) => params.push(v))
        if (wait) {
          return `${rule.field} ${operator} (${splitValue.map(() => '?').join(', ')})`
        }
        return `${rule.field.tableName}.${rule.field.value} ${operator} (${splitValue.map(() => '?').join(', ')})`
      }
      // console.log('Value ----------->', value)
      params.push(value.match(/^'?(.*?)'?$/)[1])
    }
    if (wait) {
      return `'${rule.field}' ${operator} ${value} `.trim()
    }
    // console.log(`${rule.field.tableName}.${rule.field.value} ${operator} ${parameterized && value ? '?' : value} `.trim())
    return `${rule.field.tableName}.${rule.field.value} ${operator} ${parameterized && value ? '?' : value} `.trim()
  }
  const processRuleGroup = async (rg) => {
    // const processedRules = rg.rules.map(async (rule) => {
    //   if (isRuleGroup(rule)) {
    //     return processRuleGroup(rule)
    //   }
    //   return await processRule(rule)
    // })

    const processedRules = []
    for (const rule of rg.rules) {
      let ruleResult
      if (isRuleGroup(rule)) {
        ruleResult = await processRuleGroup(rule)
      } else {
        ruleResult = await processRule(rule)
      }
      processedRules.push(ruleResult)
      // return await processRule(rule)
    }
    return `${rg.not ? 'NOT ' : ''} (${processedRules.join(` ${rg.combinator} `)})`
  }
  const data = {
    sql: await processRuleGroup(ruleGroup),
    params
  }
  return data
}

const isRuleGroup = (ruleOrGroup) => {
  const rg = ruleOrGroup
  return !!(rg.combinator && rg.rules)
}

const mapOperator = (op) => {
  switch (op.toLowerCase()) {
    case 'null':
      return 'is null'
    case 'notnull':
      return 'is not null'
    case 'notin':
      return 'not in'
    case 'contains':
    case 'beginswith':
    case 'endswith':
      return 'like'
    case 'doesnotcontain':
    case 'doesnotbeginwith':
    case 'doesnotendwith':
      return 'not like'
    default:
      return op
  }
}

const defaultValueProcessor = (_tableName, _field, operator, value) => {
  let val = `'${value}'`
  if (operator.toLowerCase() === 'null' || operator.toLowerCase() === 'notnull') {
    val = ''
  } else if (operator.toLowerCase() === 'in' || operator.toLowerCase() === 'notin') {
    val = `(${value
      .split(',')
      .map((v) => `'${v.trim()}'`)
      .join(', ')
      })`
  } else if (operator.toLowerCase() === 'contains' || operator.toLowerCase() === 'doesnotcontain') {
    val = `'%${value}%'`
  } else if (operator.toLowerCase() === 'beginswith' ||
    operator.toLowerCase() === 'doesnotbeginwith') {
    val = `'${value}%'`
  } else if (operator.toLowerCase() === 'endswith' || operator.toLowerCase() === 'doesnotendwith') {
    val = `'%${value}'`
  } else if (typeof value === 'boolean') {
    val = `${value} `.toUpperCase()
  }
  return val
}
