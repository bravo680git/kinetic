package handlers

import (
	"encoding/json"
	"maps"
	"net/http"
	"os"
	"sync"

	"github.com/gin-gonic/gin"
)

var (
	snippetsMutex   sync.RWMutex
	snippetsData    map[string]string
	snippetsFile    = "data/snippets.json"
	defaultSnippets = make(map[string]string) // Will be loaded from file
)

// LoadSnippets loads default snippets from file at startup
// If any error occurs, data is initialized as empty
func LoadSnippets() {
	// Initialize empty data
	snippetsMutex.Lock()
	snippetsData = make(map[string]string)
	defaultSnippets = make(map[string]string)
	snippetsMutex.Unlock()

	// Try to read file
	if _, err := os.Stat(snippetsFile); os.IsNotExist(err) {
		// Create default data directory if it doesn't exist
		os.MkdirAll("data", 0755)
		return
	}

	data, err := os.ReadFile(snippetsFile)
	if err != nil {
		return
	}

	// Try to unmarshal JSON
	var loaded map[string]string
	err = json.Unmarshal(data, &loaded)
	if err != nil {
		return
	}

	// Set both defaultSnippets and snippetsData
	snippetsMutex.Lock()
	defaultSnippets = loaded
	snippetsData = make(map[string]string)
	maps.Copy(snippetsData, loaded)
	snippetsMutex.Unlock()
}

// GetSnippets returns the current snippets
func GetSnippets(c *gin.Context) {
	snippetsMutex.RLock()
	defer snippetsMutex.RUnlock()

	c.JSON(http.StatusOK, snippetsData)
}

// SetSnippets updates the snippets (receives full JSON object)
func SetSnippets(c *gin.Context) {
	var req map[string]string
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ApiError{
			Error:  "invalid request body",
			Detail: err.Error(),
		})
		return
	}

	snippetsMutex.Lock()
	snippetsData = req
	snippetsMutex.Unlock()

	c.JSON(http.StatusOK, snippetsData)
}

// ResetSnippets resets snippets to default values from file
func ResetSnippets(c *gin.Context) {
	snippetsMutex.Lock()
	snippetsData = make(map[string]string)
	maps.Copy(snippetsData, defaultSnippets)
	snippetsMutex.Unlock()

	c.JSON(http.StatusOK, snippetsData)
}
