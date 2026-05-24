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

	protected.HandleFunc("/add-endpoints", controllers.AddEndpoints).Methods("POST")
	protected.HandleFunc("/endpoints", controllers.GetEndpoints).Methods("GET")
	/*protected.HandleFunc("/endpoint/{id}", controllers.DeleteEndpoint).Methods("DELETE")
	protected.HandleFunc("/endpoint/{id}", controllers.UpdateEndpoint).Methods("PUT")*/
}
