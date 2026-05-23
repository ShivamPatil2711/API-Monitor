package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"mybackend/controllers"
	"mybackend/routes"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	MongoClient *mongo.Client
	JWTSecret   string
)

func main() {
	// Load ENV
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env found")
	}

	// JWT
	JWTSecret = os.Getenv("JWT_SECRET")

	// Mongo Connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	MongoClient, err = mongo.Connect(
		ctx,
		options.Client().ApplyURI("mongodb://127.0.0.1:27017/api-monitor"),
	)

	if err != nil {
		log.Fatal("Mongo Error:", err)
	}

	log.Println("Connected MongoDB")
	controllers.InitController(MongoClient, JWTSecret)

	// Router
	router := mux.NewRouter()

	// Register Routes
	routes.RegisterAuthRoutes(router)
	routes.RegisterEndpointRoutes(router)

	// Server
	PORT := os.Getenv("PORT")
	if PORT == "" {
		PORT = "4003"
	}

	server := &http.Server{
		Addr: ":" + PORT,
		// FIX: Wrap the entire router with the CORS middleware here!
		Handler:      CORSMiddleware(router),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	log.Println("Server Running on port:", PORT)
	log.Fatal(server.ListenAndServe())
}

func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")

		// FIX: Intercept OPTIONS preflight requests and return 200 immediately.
		// This prevents the request from reaching the mux router at all.
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
