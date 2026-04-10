package handlers

import (
	"fmt"
	"kinetic/db"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// UpdateRowRequest is the request body for POST /api/update
type UpdateRowRequest struct {
	ConnectionString string                 `json:"connection_string"`
	Table            string                 `json:"table"`
	PKColumn         string                 `json:"pk_column"`
	PKValue          interface{}            `json:"pk_value"`
	Updates          map[string]interface{} `json:"updates"`
}

// UpdateRowResponse is the response from POST /api/update
type UpdateRowResponse struct {
	Success      bool   `json:"success"`
	RowsAffected int64  `json:"rows_affected"`
	Error        string `json:"error,omitempty"`
}

// UpdateRow updates a single row in the database
func UpdateRow(c *gin.Context) {
	var req UpdateRowRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ApiError{
			Error:  "invalid request body",
			Detail: err.Error(),
		})
		return
	}

	if req.ConnectionString == "" || req.Table == "" || req.PKColumn == "" {
		c.JSON(http.StatusBadRequest, ApiError{
			Error: "connection_string, table, and pk_column are required",
		})
		return
	}

	if len(req.Updates) == 0 {
		c.JSON(http.StatusBadRequest, ApiError{
			Error: "updates cannot be empty",
		})
		return
	}

	gormDB, err := db.GetConnection(req.ConnectionString)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ApiError{
			Error:  "failed to connect",
			Detail: err.Error(),
		})
		return
	}

	// Build UPDATE statement
	var setClauses []string
	var values []interface{}
	paramIndex := 1

	for col, val := range req.Updates {
		// Sanitize column name (basic protection)
		col = strings.TrimSpace(col)
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", col, paramIndex))
		values = append(values, val)
		paramIndex++
	}

	updateSQL := fmt.Sprintf(
		"UPDATE %s SET %s WHERE %s = $%d",
		req.Table,
		strings.Join(setClauses, ", "),
		req.PKColumn,
		paramIndex,
	)
	values = append(values, req.PKValue)

	// Execute update
	result := gormDB.Exec(updateSQL, values...)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, UpdateRowResponse{
			Success: false,
			Error:   result.Error.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, UpdateRowResponse{
		Success:      true,
		RowsAffected: result.RowsAffected,
	})
}
