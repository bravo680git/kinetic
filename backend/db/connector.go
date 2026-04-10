package db

import (
	"crypto/sha256"
	"fmt"
	"sync"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var cache sync.Map

// GetConnection returns a cached *gorm.DB for the given connection string.
// If not in cache, opens a new connection and caches it.
func GetConnection(connStr string) (*gorm.DB, error) {
	hash := sha256.Sum256([]byte(connStr))
	key := fmt.Sprintf("%x", hash)

	// Try to load from cache
	if cached, ok := cache.Load(key); ok {
		return cached.(*gorm.DB), nil
	}

	// Open new connection
	db, err := gorm.Open(postgres.Open(connStr), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get sql.DB: %w", err)
	}

	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetMaxOpenConns(20)
	// sqlDB.SetConnMaxLifetime(1 * time.Hour)

	// Store in cache
	cache.Store(key, db)

	return db, nil
}

// TestConnection opens a fresh connection (without caching) and verifies it works.
func TestConnection(connStr string) error {
	db, err := gorm.Open(postgres.Open(connStr), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("connection failed: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get sql.DB: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		sqlDB.Close()
		return fmt.Errorf("ping failed: %w", err)
	}

	sqlDB.Close()
	return nil
}

// CloseAll closes all cached connections gracefully.
func CloseAll() error {
	var errs []error

	cache.Range(func(_, value interface{}) bool {
		if gormDB, ok := value.(*gorm.DB); ok {
			if sqlDB, err := gormDB.DB(); err == nil {
				if err := sqlDB.Close(); err != nil {
					errs = append(errs, err)
				}
			}
		}
		return true
	})

	if len(errs) > 0 {
		return fmt.Errorf("errors closing connections: %v", errs)
	}

	return nil
}
