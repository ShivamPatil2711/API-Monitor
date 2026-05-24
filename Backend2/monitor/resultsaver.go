package monitor

import (
	"context"
	"log"
	"time"

	"mybackend/controllers"

	"go.mongodb.org/mongo-driver/bson"
)

func SaveResult(result WorkerResult) {
	// 1. Connect to Collection
	collection := controllers.MongoClient.Database("api-monitor").Collection("endpoints")

	// 2. Determine string status for the frontend
	status := "DOWN"
	if result.Result.Success {
		status = "UP"
	}

	// 3. Setup Context with Timeout (Important for DB writes too!)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 4. Update the endpoint document in MongoDB
	_, err := collection.UpdateByID(
		ctx,
		result.Endpoint.ID,
		bson.M{
		"$set": bson.M{
	"currentStatus": status,

	"lastStatusCode":
		result.Result.StatusCode,

	"lastLatency":
		result.Result.Latency,

	"lastError":
		result.Result.Error,

	"lastCheckedAt":
		time.Now(),
		
},
		},

	)

	// 5. Log if the save fails
	if err != nil {
		log.Printf("Failed to save result for endpoint %s: %v\n", result.Endpoint.Name, err)
		return
	}
}