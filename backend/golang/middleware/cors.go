package middleware

import (
	"net/http"

	"github.com/gorilla/handlers"
)

// CORS 配置CORS中间件
func CORS() func(http.Handler) http.Handler {
	return handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)
}

// CORSWithConfig 可配置的CORS中间件
func CORSWithConfig(origins []string, methods []string, headers []string) func(http.Handler) http.Handler {
	return handlers.CORS(
		handlers.AllowedOrigins(origins),
		handlers.AllowedMethods(methods),
		handlers.AllowedHeaders(headers),
	)
}
