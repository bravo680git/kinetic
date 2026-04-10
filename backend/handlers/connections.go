package handlers

import (
	"kinetic/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

// TestConnectionRequest is the request body for POST /api/connections/test
type TestConnectionRequest struct {
	ConnectionString string `json:"connection_string"`
}

// TestConnectionResponse is the response from POST /api/connections/test
type TestConnectionResponse struct {
	Ok    bool   `json:"ok"`
	Error string `json:"error,omitempty"`
}

// TestConnection tests a database connection without caching
func TestConnection(c *gin.Context) {
	var req TestConnectionRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ApiError{
			Error:  "invalid request body",
			Detail: err.Error(),
		})
		return
	}

	if req.ConnectionString == "" {
		c.JSON(http.StatusBadRequest, ApiError{
			Error: "connection_string is required",
		})
		return
	}

	err := db.TestConnection(req.ConnectionString)
	if err != nil {
		c.JSON(http.StatusOK, TestConnectionResponse{
			Ok:    false,
			Error: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, TestConnectionResponse{
		Ok: true,
	})
}
