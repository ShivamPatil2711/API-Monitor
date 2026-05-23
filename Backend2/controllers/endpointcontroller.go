package controllers

import (
	"context"
	"encoding/json"
	"mybackend/middleware"
	"mybackend/models"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MonitorRequest struct {
	Name string `json:"name"`

	Auth struct {
		Type          string `json:"type"`
		Token         string `json:"token"`
		Header        string `json:"header"`
		Value         string `json:"value"`
		LoginEndpoint string `json:"loginEndpoint"`
		Email         string `json:"email"`
		Password      string `json:"password"`
	} `json:"auth"`

	Monitoring struct {
		CheckInterval int `json:"checkInterval"`
		Timeout       int `json:"timeout"`
		RetryCount    int `json:"retryCount"`
	} `json:"monitoring"`

	Endpoints []models.Endpoint `json:"endpoints"`
}

func AddEndpoints(w http.ResponseWriter, r *http.Request) {

	var req MonitorRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// --- FIX: Safely extract user from context ---
	userCtx := r.Context().Value(
		middleware.UserContextKey,
	)
	if userCtx == nil {
		http.Error(w, "Unauthorized: Missing user context", http.StatusUnauthorized)
		return
	}

	claims, ok := userCtx.(jwt.MapClaims)

	if !ok {
		http.Error(
			w,
			"Invalid user context",
			http.StatusUnauthorized,
		)

		return
	}

	userIDStr, ok := claims["userId"].(string)

	if !ok || userIDStr == "" {
		http.Error(
			w,
			"Invalid user ID",
			http.StatusUnauthorized,
		)

		return
	}
	if !ok || userIDStr == "" {
		http.Error(w, "Unauthorized: Invalid user ID", http.StatusUnauthorized)
		return
	}

	// Convert the string ID from the JWT payload to a MongoDB ObjectID
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user ID format", http.StatusBadRequest)
		return
	}
	// --- END FIX ---

	if req.Name == "" || len(req.Endpoints) == 0 {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	monitorCollection := MongoClient.
		Database("api-monitor").
		Collection("monitors")

	endpointCollection := MongoClient.
		Database("api-monitor").
		Collection("endpoints")

	// Create monitor

	monitor := models.Monitor{
		ID:         primitive.NewObjectID(),
		Name:       req.Name,
		User:       userID, // Uses the safely converted primitive.ObjectID
		Auth:       req.Auth,
		Monitoring: req.Monitoring,
	}

	_, err = monitorCollection.InsertOne(
		context.TODO(),
		monitor,
	)

	if err != nil {
		http.Error(w, "Monitor creation failed", http.StatusInternalServerError)
		return
	}

	// Create endpoints

	var endpointIDs []primitive.ObjectID

	for _, ep := range req.Endpoints {

		ep.Monitor = monitor.ID

		result, err := endpointCollection.InsertOne(
			context.TODO(),
			ep,
		)

		if err != nil {
			continue
		}

		id, ok := result.InsertedID.(primitive.ObjectID)

		if ok {
			endpointIDs = append(
				endpointIDs,
				id,
			)
		}
	}

	// Update monitor

	monitor.Endpoints = endpointIDs

	_, _ = monitorCollection.UpdateByID(
		context.TODO(),
		monitor.ID,
		bson.M{
			"$set": bson.M{
				"endpoints": endpointIDs,
			},
		},
	)

	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(
		map[string]interface{}{
			"success": true,
			"message": "Monitor created successfully",
			"monitor": monitor,
		},
	)
}
