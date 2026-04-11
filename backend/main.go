package main

import (
	"embed"
	"io/fs"
	"kinetic/db"
	"kinetic/handlers"
	"kinetic/middleware"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/gin-gonic/gin"
)

//go:embed all:dist
var frontend embed.FS

func main() {
	r := gin.Default()

	// Load snippets at startup
	handlers.LoadSnippets()

	// Apply timeout middleware to all API routes
	apiGroup := r.Group("/api", middleware.TimeoutMiddleware())
	{
		apiGroup.GET("/schema", handlers.GetSchema)
		apiGroup.POST("/query", handlers.ExecuteQuery)
		apiGroup.POST("/update", handlers.UpdateRow)
		apiGroup.POST("/connections/test", handlers.TestConnection)
		apiGroup.GET("/config", handlers.GetConfig)
		apiGroup.POST("/config", handlers.SetConfig)
		apiGroup.GET("/snippets", handlers.GetSnippets)
		apiGroup.POST("/snippets", handlers.SetSnippets)
		apiGroup.POST("/snippets/reset", handlers.ResetSnippets)
	}

	// Serve embedded frontend assets
	distFS, err := fs.Sub(frontend, "dist")
	if err != nil {
		panic("failed to embed dist: " + err.Error())
	}

	// Serve static files and SPA fallback
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path

		// Try to serve the file from dist
		if _, err := fs.Stat(distFS, strings.TrimPrefix(path, "/")); err == nil {
			c.FileFromFS(path, http.FS(distFS))
			return
		}

		// Fallback to index.html for SPA routing
		indexData, err := fs.ReadFile(frontend, "dist/index.html")
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "index.html not found"})
			return
		}
		c.Data(http.StatusOK, "text/html; charset=utf-8", indexData)
	})

	// Handle graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		_ = db.CloseAll()
		os.Exit(0)
	}()

	// Listen on port 8080
	if err := r.Run(":8080"); err != nil {
		panic(err)
	}
}
