package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"mybackend/middleware"
	"mybackend/models"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ✅ THE FIX: Use models.Auth and models.Monitoring directly!
type MonitorRequest struct {
	Name       string            `json:"name"`
	Auth       models.Auth       `json:"auth"`
	Monitoring models.Monitoring `json:"monitoring"`
	Endpoints  []models.Endpoint `json:"endpoints"`
}

func AddEndpoints(w http.ResponseWriter, r *http.Request) {
	var req MonitorRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// --- Safely extract user from context ---
	userCtx := r.Context().Value(middleware.UserContextKey)
	if userCtx == nil {
		http.Error(w, "Unauthorized: Missing user context", http.StatusUnauthorized)
		return
	}

	claims, ok := userCtx.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Invalid user context", http.StatusUnauthorized)
		return
	}

	userIDStr, ok := claims["userId"].(string)
	if !ok || userIDStr == "" {
		http.Error(w, "Invalid user ID", http.StatusUnauthorized)
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

	monitorCollection := MongoClient.Database("api-monitor").Collection("monitors")
	endpointCollection := MongoClient.Database("api-monitor").Collection("endpoints")

	// Create monitor
	monitor := models.Monitor{
		ID:         primitive.NewObjectID(),
		Name:       req.Name,
		User:       userID,
		Auth:       req.Auth,       // ✅ This works now!
		Monitoring: req.Monitoring, // ✅ This works now!
	}

	_, err = monitorCollection.InsertOne(context.TODO(), monitor)
	if err != nil {
		http.Error(w, "Monitor creation failed", http.StatusInternalServerError)
		return
	}

	// Create endpoints
	var endpointIDs []primitive.ObjectID

	for _, ep := range req.Endpoints {
		ep.Monitor = monitor.ID

		result, err := endpointCollection.InsertOne(context.TODO(), ep)
		if err != nil {
			continue
		}

		id, ok := result.InsertedID.(primitive.ObjectID)
		if ok {
			endpointIDs = append(endpointIDs, id)
		}
	}

	// Update monitor with endpoint IDs
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
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Monitor created successfully",
		"monitor": monitor,
	})
}

func GetEndpoints(w http.ResponseWriter, r *http.Request) {
	fmt.Println("GetEndpoints called")

	// 1. User Context Extraction
	userCtx := r.Context().Value(middleware.UserContextKey)
	if userCtx == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	claims, ok := userCtx.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Invalid user context", http.StatusUnauthorized)
		return
	}

	userIDStr, ok := claims["userId"].(string)
	if !ok {
		http.Error(w, "Invalid user", http.StatusUnauthorized)
		return
	}

	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user id", http.StatusBadRequest)
		return
	}

	// 2. Setup Context with Timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 3. Database Collections
	monitorCollection := MongoClient.Database("api-monitor").Collection("monitors")
	endpointCollection := MongoClient.Database("api-monitor").Collection("endpoints")

	// 4. Load monitors
	cursor, err := monitorCollection.Find(ctx, bson.M{"user": userID})
	if err != nil {
		http.Error(w, "Failed loading monitors", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var monitors []models.Monitor
	err = cursor.All(ctx, &monitors)
	if err != nil {
		http.Error(w, "Failed reading monitors", http.StatusInternalServerError)
		return
	}

	// 5. Extract monitor ids
	var monitorIDs []primitive.ObjectID
	for _, monitor := range monitors {
		monitorIDs = append(monitorIDs, monitor.ID)
	}

	// If no monitors exist, return empty array immediately
	if len(monitorIDs) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data":    []models.Endpoint{},
		})
		return
	}

	// 6. Load endpoints
	endpointCursor, err := endpointCollection.Find(ctx, bson.M{
		"monitor": bson.M{"$in": monitorIDs},
	})
	if err != nil {
		http.Error(w, "Failed loading endpoints", http.StatusInternalServerError)
		return
	}
	defer endpointCursor.Close(ctx)

	var endpoints []models.Endpoint
	err = endpointCursor.All(ctx, &endpoints)
	if err != nil {
		http.Error(w, "Failed reading endpoints", http.StatusInternalServerError)
		return
	}

	// 7. Response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    endpoints,
	})
}
