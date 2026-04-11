// SQL Snippets - Common SQL commands for autocomplete and reference

export const sqlSnippets = {
  // SELECT Queries
  SELECT_BASIC: "SELECT * FROM ${1:table_name};",

  SELECT_SPECIFIC_COLUMNS:
    "SELECT ${1:column1}, ${2:column2}, ${3:column3} FROM ${4:table_name};",

  SELECT_WHERE: "SELECT * FROM ${1:table_name} WHERE ${2:condition};",

  SELECT_WHERE_AND:
    "SELECT * FROM ${1:table_name} WHERE ${2:condition1} AND ${3:condition2};",

  SELECT_WHERE_OR:
    "SELECT * FROM ${1:table_name} WHERE ${2:condition1} OR ${3:condition2};",

  SELECT_WHERE_IN:
    "SELECT * FROM ${1:table_name} WHERE ${2:column_name} IN (${3:value1}, ${4:value2}, ${5:value3});",

  SELECT_WHERE_LIKE:
    "SELECT * FROM ${1:table_name} WHERE ${2:column_name} LIKE '${3:pattern}%';",

  SELECT_WHERE_BETWEEN:
    "SELECT * FROM ${1:table_name} WHERE ${2:column_name} BETWEEN ${3:value1} AND ${4:value2};",

  SELECT_ORDER_BY:
    "SELECT * FROM ${1:table_name} ORDER BY ${2:column_name} ASC;",

  SELECT_ORDER_BY_DESC:
    "SELECT * FROM ${1:table_name} ORDER BY ${2:column_name} DESC;",

  SELECT_GROUP_BY:
    "SELECT ${1:column_name}, COUNT(*) FROM ${2:table_name} GROUP BY ${3:column_name};",

  SELECT_GROUP_BY_HAVING:
    "SELECT ${1:column_name}, COUNT(*) as count FROM ${2:table_name} GROUP BY ${3:column_name} HAVING COUNT(*) > ${4:1};",

  SELECT_JOIN_INNER:
    "SELECT * FROM ${1:table1} INNER JOIN ${2:table2} ON ${3:table1.id} = ${4:table2.table1_id};",

  SELECT_JOIN_LEFT:
    "SELECT * FROM ${1:table1} LEFT JOIN ${2:table2} ON ${3:table1.id} = ${4:table2.table1_id};",

  SELECT_JOIN_RIGHT:
    "SELECT * FROM ${1:table1} RIGHT JOIN ${2:table2} ON ${3:table1.id} = ${4:table2.table1_id};",

  SELECT_JOIN_FULL:
    "SELECT * FROM ${1:table1} FULL OUTER JOIN ${2:table2} ON ${3:table1.id} = ${4:table2.table1_id};",

  SELECT_LIMIT: "SELECT * FROM ${1:table_name} LIMIT ${2:10};",

  SELECT_LIMIT_OFFSET:
    "SELECT * FROM ${1:table_name} LIMIT ${2:10} OFFSET ${3:20};",

  SELECT_DISTINCT: "SELECT DISTINCT ${1:column_name} FROM ${2:table_name};",

  SELECT_COUNT: "SELECT COUNT(*) FROM ${1:table_name};",

  SELECT_SUM: "SELECT SUM(${1:column_name}) FROM ${2:table_name};",

  SELECT_AVG: "SELECT AVG(${1:column_name}) FROM ${2:table_name};",

  SELECT_MIN: "SELECT MIN(${1:column_name}) FROM ${2:table_name};",

  SELECT_MAX: "SELECT MAX(${1:column_name}) FROM ${2:table_name};",

  SELECT_UNION:
    "SELECT ${1:column_name} FROM ${2:table1} UNION SELECT ${3:column_name} FROM ${4:table2};",

  SELECT_SUBQUERY:
    "SELECT * FROM ${1:table_name} WHERE ${2:id} IN (SELECT ${3:table1_id} FROM ${4:table});",

  // CREATE TABLE
  CREATE_TABLE_BASIC:
    "CREATE TABLE ${1:table_name} (\n  id SERIAL PRIMARY KEY,\n  ${2:name} VARCHAR(255) NOT NULL,\n  ${3:email} VARCHAR(255) UNIQUE,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);",

  CREATE_TABLE_WITH_CONSTRAINTS:
    "CREATE TABLE ${1:table_name} (\n  id SERIAL PRIMARY KEY,\n  ${2:name} VARCHAR(255) NOT NULL,\n  ${3:email} VARCHAR(255) NOT NULL UNIQUE,\n  ${4:age} INT CHECK (age >= 18),\n  ${5:department_id} INT,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n  FOREIGN KEY (${6:department_id}) REFERENCES ${7:departments}(id)\n);",

  CREATE_TABLE_COMPOSITE_KEY:
    "CREATE TABLE ${1:table_name} (\n  ${2:user_id} INT NOT NULL,\n  ${3:role_id} INT NOT NULL,\n  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n  PRIMARY KEY (${4:user_id}, ${5:role_id}),\n  FOREIGN KEY (${6:user_id}) REFERENCES ${7:users}(id),\n  FOREIGN KEY (${8:role_id}) REFERENCES ${9:roles}(id)\n);",

  // INSERT
  INSERT_SINGLE:
    "INSERT INTO ${1:table_name} (${2:column1}, ${3:column2}, ${4:column3})\nVALUES ('${5:value1}', '${6:value2}', '${7:value3}');",

  INSERT_MULTIPLE:
    "INSERT INTO ${1:table_name} (${2:column1}, ${3:column2}, ${4:column3})\nVALUES \n  ('${5:value1}', '${6:value2}', '${7:value3}'),\n  ('${8:value4}', '${9:value5}', '${10:value6}'),\n  ('${11:value7}', '${12:value8}', '${13:value9}');",

  INSERT_SELECT:
    "INSERT INTO ${1:table_name} (${2:column1}, ${3:column2}, ${4:column3})\nSELECT ${5:col1}, ${6:col2}, ${7:col3} FROM ${8:source_table} WHERE ${9:condition};",

  INSERT_DEFAULT:
    "INSERT INTO ${1:table_name} (${2:column1}, ${3:column2}) VALUES (DEFAULT, '${4:value}');",

  // UPDATE
  UPDATE_BASIC:
    "UPDATE ${1:table_name} SET ${2:column1} = '${3:value1}' WHERE ${4:id} = ${5:1};",

  UPDATE_MULTIPLE_COLUMNS:
    "UPDATE ${1:table_name} SET \n  ${2:column1} = '${3:value1}',\n  ${4:column2} = '${5:value2}',\n  ${6:column3} = '${7:value3}'\nWHERE ${8:condition};",

  UPDATE_WITH_CONDITION:
    "UPDATE ${1:table_name} SET ${2:column_name} = '${3:new_value}' \nWHERE ${4:column_name} = '${5:old_value}';",

  UPDATE_MULTIPLE_WITH_JOIN:
    "UPDATE ${1:table1}\nINNER JOIN ${2:table2} ON ${3:table1.id} = ${4:table2.table1_id}\nSET ${5:table1.status} = '${6:active}'\nWHERE ${7:table2.type} = '${8:premium}';",

  UPDATE_INCREMENT:
    "UPDATE ${1:table_name} SET ${2:column_name} = ${2:column_name} + ${3:1} WHERE ${4:condition};",

  // DELETE
  DELETE_SINGLE: "DELETE FROM ${1:table_name} WHERE ${2:id} = ${3:1};",

  DELETE_MULTIPLE:
    "DELETE FROM ${1:table_name} WHERE ${2:column_name} = '${3:value}';",

  DELETE_WITH_JOIN:
    "DELETE FROM ${1:table1} USING ${2:table1}\nINNER JOIN ${3:table2} ON ${4:table1.id} = ${5:table2.table1_id}\nWHERE ${6:table2.status} = '${7:inactive}';",

  DELETE_ALL: "DELETE FROM ${1:table_name};",

  DELETE_LIMIT:
    "DELETE FROM ${1:table_name} WHERE ${2:condition} LIMIT ${3:10};",

  // ALTER TABLE
  ALTER_ADD_COLUMN:
    "ALTER TABLE ${1:table_name} ADD COLUMN ${2:new_column} VARCHAR(${3:255});",

  ALTER_ADD_COLUMN_WITH_CONSTRAINT:
    "ALTER TABLE ${1:table_name} \nADD COLUMN ${2:new_column} VARCHAR(${3:255}) NOT NULL DEFAULT '${4:default_value}';",

  ALTER_DROP_COLUMN:
    "ALTER TABLE ${1:table_name} DROP COLUMN ${2:column_name};",

  ALTER_RENAME_COLUMN:
    "ALTER TABLE ${1:table_name} RENAME COLUMN ${2:old_name} TO ${3:new_name};",

  ALTER_MODIFY_COLUMN:
    "ALTER TABLE ${1:table_name} MODIFY COLUMN ${2:column_name} INT NOT NULL;",

  ALTER_ADD_PRIMARY_KEY:
    "ALTER TABLE ${1:table_name} ADD PRIMARY KEY (${2:id});",

  ALTER_ADD_FOREIGN_KEY:
    "ALTER TABLE ${1:table_name} ADD CONSTRAINT ${2:fk_name} \nFOREIGN KEY (${3:column_name}) REFERENCES ${4:other_table}(${5:id});",

  ALTER_ADD_UNIQUE_CONSTRAINT:
    "ALTER TABLE ${1:table_name} ADD CONSTRAINT ${2:uq_name} UNIQUE (${3:column_name});",

  ALTER_DROP_CONSTRAINT:
    "ALTER TABLE ${1:table_name} DROP CONSTRAINT ${2:constraint_name};",

  ALTER_ADD_INDEX:
    "ALTER TABLE ${1:table_name} ADD INDEX ${2:idx_name} (${3:column_name});",

  ALTER_DROP_INDEX: "ALTER TABLE ${1:table_name} DROP INDEX ${2:idx_name};",

  // CREATE INDEX
  CREATE_INDEX:
    "CREATE INDEX ${1:idx_name} ON ${2:table_name}(${3:column_name});",

  CREATE_UNIQUE_INDEX:
    "CREATE UNIQUE INDEX ${1:idx_name} ON ${2:table_name}(${3:column_name});",

  CREATE_COMPOSITE_INDEX:
    "CREATE INDEX ${1:idx_name} ON ${2:table_name}(${3:column1}, ${4:column2});",

  // DROP
  DROP_TABLE: "DROP TABLE ${1:table_name};",

  DROP_TABLE_IF_EXISTS: "DROP TABLE IF EXISTS ${1:table_name};",

  DROP_DATABASE: "DROP DATABASE ${1:database_name};",

  // TRUNCATE
  TRUNCATE_TABLE: "TRUNCATE TABLE ${1:table_name};",

  // TRANSACTION
  TRANSACTION_BEGIN: "BEGIN;\n${1:-- SQL statements here}\nCOMMIT;",

  TRANSACTION_WITH_ROLLBACK: "BEGIN;\n${1:-- SQL statements here}\nROLLBACK;",

  SAVEPOINT:
    "SAVEPOINT ${1:savepoint_name};\n${2:-- SQL statements}\nROLLBACK TO SAVEPOINT ${3:savepoint_name};",

  // VIEW
  CREATE_VIEW:
    "CREATE VIEW ${1:view_name} AS\nSELECT ${2:column1}, ${3:column2} FROM ${4:table_name} WHERE ${5:condition};",

  DROP_VIEW: "DROP VIEW ${1:view_name};",

  CREATE_STORED_PROCEDURE:
    "CREATE OR REPLACE FUNCTION ${1:procedure_name}(${2:param1} INT)\\nRETURNS ${3:VARCHAR(255)} AS $$\\nDECLARE\\n  ${4:result} ${3:VARCHAR(255)};\\nBEGIN\\n  SELECT ${5:column_name} INTO ${4:result} FROM ${6:table_name} WHERE id = ${2:param1};\\n  RETURN ${4:result};\\nEND;\\n$$ LANGUAGE plpgsql;",

  CALL_STORED_PROCEDURE: "SELECT ${1:procedure_name}(${2:1}});",

  // TRIGGER (PostgreSQL)
  CREATE_TRIGGER_BEFORE_INSERT:
    "CREATE TRIGGER ${1:trigger_name}\\nBEFORE INSERT ON ${2:table_name}\\nFOR EACH ROW\\nEXECUTE FUNCTION ${3:set_created_at}();",

  CREATE_TRIGGER_AFTER_UPDATE:
    "CREATE TRIGGER ${1:trigger_name}\\nAFTER UPDATE ON ${2:table_name}\\nFOR EACH ROW\\nEXECUTE FUNCTION ${3:update_timestamp}();",

  // COMMON FUNCTIONS
  FUNCTION_UPPER: "SELECT UPPER(${1:column_name}) FROM ${2:table_name};",

  FUNCTION_LOWER: "SELECT LOWER(${1:column_name}) FROM ${2:table_name};",

  FUNCTION_LENGTH: "SELECT LENGTH(${1:column_name}) FROM ${2:table_name};",

  FUNCTION_SUBSTRING:
    "SELECT SUBSTRING(${1:column_name}, ${2:1}, ${3:10}) FROM ${4:table_name};",

  FUNCTION_CONCAT:
    "SELECT ${1:column1} || ' ' || ${2:column2} FROM ${3:table_name};",

  FUNCTION_COALESCE:
    "SELECT COALESCE(${1:column1}, ${2:column2}, '${3:N/A}') FROM ${4:table_name};",

  FUNCTION_CASE:
    "SELECT \n  CASE \n    WHEN ${1:column_name} = '${2:value1}' THEN '${3:result1}'\n    WHEN ${1:column_name} = '${4:value2}' THEN '${5:result2}'\n    ELSE '${6:other}'\n  END as ${7:result}\nFROM ${8:table_name};",

  FUNCTION_DATE: "SELECT DATE(${1:date_column}) FROM ${2:table_name};",

  FUNCTION_YEAR_MONTH_DAY:
    "SELECT \n  EXTRACT(YEAR FROM ${1:date_column}) as year,\n  EXTRACT(MONTH FROM ${1:date_column}) as month,\n  EXTRACT(DAY FROM ${1:date_column}) as day\nFROM ${2:table_name};",

  FUNCTION_DATE_ADD:
    "SELECT ${1:date_column} + INTERVAL '${2:7} days' FROM ${3:table_name};",

  FUNCTION_DATE_DIFF:
    "SELECT AGE(NOW(), ${1:date_column}) FROM ${2:table_name};",

  // BACKUP & RESTORE (PostgreSQL)
  BACKUP_DATABASE:
    "-- Via command line:\n-- pg_dump -U ${1:username} -d ${2:database_name} > ${3:backup.sql}",

  RESTORE_DATABASE:
    "-- Via command line:\n-- psql -U ${1:username} -d ${2:database_name} < ${3:backup.sql}",

  // USEFUL QUERIES
  CHECK_TABLE_SIZE:
    "SELECT \n  schemaname,\n  tablename,\n  ROUND(pg_total_relation_size('${1:table_name}')::numeric / 1024 / 1024, 2) as size_mb\nFROM pg_tables\nWHERE schemaname NOT IN ('pg_catalog', 'information_schema')\nORDER BY pg_total_relation_size('${1:table_name}') DESC;",

  CHECK_ALL_COLUMNS:
    "SELECT column_name, data_type, is_nullable \\nFROM information_schema.columns \\nWHERE table_schema = 'public' \\nAND table_name = '${1:table_name}';",

  FIND_DUPLICATE_RECORDS:
    "SELECT ${1:column_name}, COUNT(*) \nFROM ${2:table_name} \nGROUP BY ${3:column_name} \nHAVING COUNT(*) > 1;",

  FIND_NULL_VALUES:
    "SELECT * FROM ${1:table_name} WHERE ${2:column_name} IS NULL;",

  FIND_ORPHANED_RECORDS:
    "SELECT * FROM ${1:table1} \nWHERE ${2:table1_id} NOT IN (SELECT ${3:id} FROM ${4:table1});",
};

// Export as array for dropdown/autocomplete
export const sqlSnippetsList = Object.entries(sqlSnippets).map(
  ([key, value]) => ({
    label: key.replace(/_/g, " "),
    value: value,
    category: getCategoryFromKey(key),
  }),
);

export function getCategoryFromKey(key: string): string {
  if (key.startsWith("SELECT")) return "SELECT";
  if (key.startsWith("CREATE_TABLE")) return "CREATE TABLE";
  if (key.startsWith("CREATE_")) return "CREATE";
  if (key.startsWith("INSERT")) return "INSERT";
  if (key.startsWith("UPDATE")) return "UPDATE";
  if (key.startsWith("DELETE")) return "DELETE";
  if (key.startsWith("ALTER")) return "ALTER";
  if (key.startsWith("DROP")) return "DROP";
  if (key.startsWith("TRUNCATE")) return "TRUNCATE";
  if (key.startsWith("TRANSACTION")) return "TRANSACTION";
  if (key.startsWith("VIEW") || key.startsWith("CREATE_VIEW")) return "VIEW";
  if (key.startsWith("STORED_PROCEDURE") || key.startsWith("CREATE_STORED"))
    return "STORED PROCEDURE";
  if (key.startsWith("TRIGGER") || key.startsWith("CREATE_TRIGGER"))
    return "TRIGGER";
  if (key.startsWith("FUNCTION")) return "FUNCTION";
  if (key.startsWith("BACKUP") || key.startsWith("RESTORE"))
    return "BACKUP/RESTORE";
  return "OTHER";
}
