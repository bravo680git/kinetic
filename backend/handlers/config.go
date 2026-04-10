package handlers

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
)

// Global config with mutex for thread-safe access
var (
	configMutex sync.RWMutex
	config      = Config{}
)

type QueryConfig struct {
	RowLimit *int `json:"row_limit"`
}

type GeneralConfig struct {
	SidebarCollapsed      *bool `json:"sidebar_collapsed"`
	ResultPanelPercentage *int  `json:"result_panel_percentage"`
}

// Config holds application configuration
type Config struct {
	Query   *QueryConfig   `json:"query"`
	General *GeneralConfig `json:"general"`
}

// GetConfig returns the current configuration
func GetConfig(c *gin.Context) {
	configMutex.RLock()
	defer configMutex.RUnlock()

	c.JSON(http.StatusOK, config)
}

// SetConfig updates the configuration
func SetConfig(c *gin.Context) {
	var req Config
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ApiError{
			Error:  "invalid request body",
			Detail: err.Error(),
		})
		return
	}

	configMutex.Lock()
	config = req
	configMutex.Unlock()

	c.JSON(http.StatusOK, config)
}

// GetRowLimit returns the current row limit (used by other handlers)
func GetRowLimit() int {
	configMutex.RLock()
	defer configMutex.RUnlock()
	if config.Query == nil || config.Query.RowLimit == nil || *config.Query.RowLimit <= 0 {
		return 1000
	}
	return *config.Query.RowLimit
}
