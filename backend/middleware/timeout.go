package middleware

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
)

// TimeoutMiddleware enforces a 30-second timeout on all requests.
func TimeoutMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
		defer cancel()

		// Replace the request context with the timeout context
		c.Request = c.Request.WithContext(ctx)

		c.Next()
	}
}
