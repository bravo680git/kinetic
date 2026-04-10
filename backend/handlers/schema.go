package handlers

import (
	"kinetic/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ColumnMeta represents column information
type ColumnMeta struct {
	Name           string `json:"name"`
	Type           string `json:"type"`
	Nullable       bool   `json:"nullable"`
	IsPrimaryKey   bool   `json:"isPrimaryKey,omitempty"`
	IsForeignKey   bool   `json:"isForeignKey,omitempty"`
	ForeignKeyInfo *FK    `json:"foreignKeyInfo,omitempty"`
}

// FK represents foreign key information
type FK struct {
	ReferencedTable  string `json:"referencedTable"`
	ReferencedColumn string `json:"referencedColumn"`
}

// TableMeta represents table information with columns
type TableMeta struct {
	Name    string       `json:"name"`
	Columns []ColumnMeta `json:"columns"`
}

// SchemaMeta represents schema information with tables
type SchemaMeta struct {
	Name   string      `json:"name"`
	Tables []TableMeta `json:"tables"`
}

// SchemaResponse is the response from GET /api/schema
type SchemaResponse struct {
	Dialect string       `json:"dialect"`
	Schemas []SchemaMeta `json:"schemas"`
}

// ApiError is a generic error response
type ApiError struct {
	Error  string `json:"error"`
	Detail string `json:"detail,omitempty"`
}

// GetSchema retrieves the database schema via information_schema
func GetSchema(c *gin.Context) {
	connStr := c.Query("connection_string")
	if connStr == "" {
		c.JSON(http.StatusBadRequest, ApiError{Error: "missing connection_string parameter"})
		return
	}

	gormDB, err := db.GetConnection(connStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ApiError{
			Error:  "failed to connect",
			Detail: err.Error(),
		})
		return
	}

	sqlDB, err := gormDB.DB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, ApiError{Error: "failed to get sql.DB"})
		return
	}

	// Query tables
	tableRows, err := sqlDB.QueryContext(c.Request.Context(), `
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog','information_schema','pg_temp','pg_toast_temp')
    ORDER BY table_schema, table_name
  `)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ApiError{
			Error:  "failed to query tables",
			Detail: err.Error(),
		})
		return
	}
	defer tableRows.Close()

	// Map to store tables by schema
	schemaMap := make(map[string][]TableMeta)
	var schemas []string

	for tableRows.Next() {
		var schema, tableName string
		if err := tableRows.Scan(&schema, &tableName); err != nil {
			c.JSON(http.StatusInternalServerError, ApiError{Error: "failed to scan table"})
			return
		}

		if _, exists := schemaMap[schema]; !exists {
			schemas = append(schemas, schema)
			schemaMap[schema] = []TableMeta{}
		}

		schemaMap[schema] = append(schemaMap[schema], TableMeta{Name: tableName, Columns: []ColumnMeta{}})
	}

	// Query columns for each table
	colRows, err := sqlDB.QueryContext(c.Request.Context(), `
    SELECT table_schema, table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema NOT IN ('pg_catalog','information_schema','pg_temp','pg_toast_temp')
    ORDER BY table_schema, table_name, ordinal_position
  `)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ApiError{
			Error:  "failed to query columns",
			Detail: err.Error(),
		})
		return
	}
	defer colRows.Close()

	for colRows.Next() {
		var schema, tableName, colName, dataType, isNullable string
		if err := colRows.Scan(&schema, &tableName, &colName, &dataType, &isNullable); err != nil {
			c.JSON(http.StatusInternalServerError, ApiError{Error: "failed to scan column"})
			return
		}

		nullable := isNullable == "YES"

		// Find the table and add the column
		if tables, ok := schemaMap[schema]; ok {
			for i, t := range tables {
				if t.Name == tableName {
					tables[i].Columns = append(tables[i].Columns, ColumnMeta{
						Name:     colName,
						Type:     dataType,
						Nullable: nullable,
					})
				}
			}
			schemaMap[schema] = tables
		}
	}

	// Query primary keys
	pkRows, err := sqlDB.QueryContext(c.Request.Context(), `
    SELECT table_schema, table_name, column_name 
    FROM information_schema.key_column_usage
    WHERE table_schema NOT IN ('pg_catalog','information_schema','pg_temp','pg_toast_temp')
    AND constraint_name LIKE '%\_pkey'
  `)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ApiError{
			Error:  "failed to query primary keys",
			Detail: err.Error(),
		})
		return
	}
	defer pkRows.Close()

	pkMap := make(map[string]map[string]bool) // map[schema.table][column]
	for pkRows.Next() {
		var schema, tableName, colName string
		if err := pkRows.Scan(&schema, &tableName, &colName); err != nil {
			c.JSON(http.StatusInternalServerError, ApiError{Error: "failed to scan pk"})
			return
		}
		key := schema + "." + tableName
		if _, exists := pkMap[key]; !exists {
			pkMap[key] = make(map[string]bool)
		}
		pkMap[key][colName] = true
	}

	// Query foreign keys
	fkRows, err := sqlDB.QueryContext(c.Request.Context(), `
    SELECT kcu.table_schema, kcu.table_name, kcu.column_name, 
           ccu.table_name AS referenced_table, ccu.column_name AS referenced_column
    FROM information_schema.key_column_usage AS kcu
    JOIN information_schema.referential_constraints AS rc
      ON kcu.constraint_name = rc.constraint_name AND kcu.table_schema = rc.constraint_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON rc.unique_constraint_name = ccu.constraint_name AND rc.unique_constraint_schema = ccu.table_schema
    WHERE kcu.table_schema NOT IN ('pg_catalog','information_schema','pg_temp','pg_toast_temp')
  `)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ApiError{
			Error:  "failed to query foreign keys",
			Detail: err.Error(),
		})
		return
	}
	defer fkRows.Close()

	fkMap := make(map[string]map[string]*FK) // map[schema.table][column]FK
	for fkRows.Next() {
		var schema, tableName, colName, refTable, refCol string
		if err := fkRows.Scan(&schema, &tableName, &colName, &refTable, &refCol); err != nil {
			c.JSON(http.StatusInternalServerError, ApiError{Error: "failed to scan fk"})
			return
		}
		key := schema + "." + tableName
		if _, exists := fkMap[key]; !exists {
			fkMap[key] = make(map[string]*FK)
		}
		fkMap[key][colName] = &FK{
			ReferencedTable:  refTable,
			ReferencedColumn: refCol,
		}
	}

	// Update columns with PK/FK info
	for schema, tables := range schemaMap {
		for ti, t := range tables {
			for ci, col := range t.Columns {
				key := schema + "." + t.Name
				if pks, exists := pkMap[key]; exists && pks[col.Name] {
					tables[ti].Columns[ci].IsPrimaryKey = true
				}
				if fks, exists := fkMap[key]; exists {
					if fk, hasFk := fks[col.Name]; hasFk {
						tables[ti].Columns[ci].IsForeignKey = true
						tables[ti].Columns[ci].ForeignKeyInfo = fk
					}
				}
			}
		}
		schemaMap[schema] = tables
	}

	// Build response
	var schemaMetas []SchemaMeta
	for _, schema := range schemas {
		schemaMetas = append(schemaMetas, SchemaMeta{
			Name:   schema,
			Tables: schemaMap[schema],
		})
	}

	response := SchemaResponse{
		Dialect: "postgres",
		Schemas: schemaMetas,
	}

	c.JSON(http.StatusOK, response)
}
