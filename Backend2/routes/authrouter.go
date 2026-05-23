package routes

import (
	"mybackend/controllers"
	"mybackend/middleware"

	"github.com/gorilla/mux"
)

func RegisterAuthRoutes(router *mux.Router) {

	// PUBLIC
	router.HandleFunc(
		"/api/login",
		controllers.Login,
	).Methods("POST")

	router.HandleFunc(
		"/api/signup",
		controllers.Signup,
	).Methods("POST")

	router.HandleFunc(
		"/api/check-auth",
		controllers.CheckAuth,
	).Methods("GET")

	// PROTECTED
	logout := router.PathPrefix("/api").Subrouter()

	logout.Use(
		middleware.AuthMiddleware,
	)

	logout.HandleFunc(
		"/logout",
		controllers.Logout,
	).Methods("POST")
}