package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"mybackend/controllers"
	"mybackend/monitor"
	"mybackend/routes"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	MongoClient   *mongo.Client
	JWTSecret     string
	AllowedOrigin string
)

func main() {
	// Load ENV
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env found, using system environment variables")
	}

	// Load Configs from ENV
	JWTSecret = os.Getenv("JWT_SECRET")
	AllowedOrigin = os.Getenv("ALLOWED_ORIGIN")
	if AllowedOrigin == "" {
		AllowedOrigin = "http://localhost:5173" // Default fallback
	}

	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://127.0.0.1:27017/api-monitor"
	}

	// Mongo Connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	MongoClient, err = mongo.Connect(
		ctx,
		options.Client().ApplyURI(mongoURI),
	)

	if err != nil {
		log.Fatal("Mongo Error:", err)
	}

	log.Println("Connected to MongoDB")
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
		Addr:         ":" + PORT,
		Handler:      CORSMiddleware(router),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	log.Println("Server Running on port:", PORT)
	monitor.StartScheduler()
	log.Fatal(server.ListenAndServe())
}

func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", AllowedOrigin)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")

		// Intercept OPTIONS preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}