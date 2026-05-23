package routes

import (
	"mybackend/controllers"
	"mybackend/middleware"

	"github.com/gorilla/mux"
)

func RegisterEndpointRoutes(router *mux.Router) {

	protected := router.PathPrefix("/api").Subrouter()

	protected.Use(
		middleware.AuthMiddleware,
	)

	protected.HandleFunc(
		"/add-endpoints",
		controllers.AddEndpoints,
	).Methods(
		"POST")
}
