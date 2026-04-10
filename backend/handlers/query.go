package handlers

import (
	"kinetic/db"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// QueryRequest is the request body for POST /api/query
type QueryRequest struct {
	ConnectionString string `json:"connection_string"`
	SQL              string `json:"sql"`
}

// QueryResponse is the response from POST /api/query
type QueryResponse struct {
	Columns         []string                 `json:"columns"`
	Rows            []map[string]interface{} `json:"rows"`
	RowCount        int                      `json:"row_count"`
	Truncated       bool                     `json:"truncated"`
	ExecutionTimeMs int64                    `json:"execution_time_ms"`
}

// ExecuteQuery executes a SQL query and returns results
func ExecuteQuery(c *gin.Context) {
	var req QueryRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ApiError{
			Error:  "invalid request body",
			Detail: err.Error(),
		})
		return
	}

	if req.ConnectionString == "" || req.SQL == "" {
		c.JSON(http.StatusBadRequest, ApiError{
			Error: "connection_string and sql are required",
		})
		return
	}

	// Get row limit from config
	rowLimit := GetRowLimit()

	gormDB, err := db.GetConnection(req.ConnectionString)
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

	startTime := time.Now()

	rows, err := sqlDB.QueryContext(c.Request.Context(), req.SQL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ApiError{
			Error:  "query execution failed",
			Detail: err.Error(),
		})
		return
	}
	defer rows.Close()

	// Get column names
	columns, err := rows.Columns()
	if err != nil {
		c.JSON(http.StatusInternalServerError, ApiError{Error: "failed to get columns"})
		return
	}

	// Scan rows
	var results []map[string]interface{}
	var rowCount int
	var truncated bool

	for rows.Next() {
		if rowCount >= rowLimit {
			truncated = true
			break
		}

		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range columns {
			valuePtrs[i] = &values[i]
		}

		if err := rows.Scan(valuePtrs...); err != nil {
			c.JSON(http.StatusInternalServerError, ApiError{Error: "failed to scan row"})
			return
		}

		row := make(map[string]interface{})
		for i, col := range columns {
			val := values[i]
			row[col] = val
		}

		results = append(results, row)
		rowCount++
	}

	executionTime := time.Since(startTime).Milliseconds()

	response := QueryResponse{
		Columns:         columns,
		Rows:            results,
		RowCount:        rowCount,
		Truncated:       truncated,
		ExecutionTimeMs: executionTime,
	}

	c.JSON(http.StatusOK, response)
}
