package monitor

import (
	"context"
	"log"
	"time"

	"mybackend/controllers"
	"mybackend/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// StartScheduler runs background checks every 30 seconds
func StartScheduler() {
	go func() {
		for {
			RunCycle()
			time.Sleep(30 * time.Second)
		}
	}()
}

// RunCycle performs one complete monitoring cycle
func RunCycle() {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	db := controllers.MongoClient.Database("api-monitor")

	// =========================
	// Load Monitors
	// =========================
	var monitors []models.Monitor

	monitorCursor, err := db.Collection("monitors").Find(ctx, bson.M{})
	if err != nil {
		log.Println("Load monitors failed:", err)
		return
	}
	defer monitorCursor.Close(ctx)

	err = monitorCursor.All(ctx, &monitors)
	if err != nil {
		log.Println("Decode monitors failed:", err)
		return
	}

	// =========================
	// Build Lookup Maps
	// =========================
	authMap := make(map[primitive.ObjectID]models.Auth)
	timeoutMap := make(map[primitive.ObjectID]int)
	retryMap := make(map[primitive.ObjectID]int)

	for _, monitor := range monitors {
		authMap[monitor.ID] = monitor.Auth
		timeoutMap[monitor.ID] = monitor.Monitoring.Timeout
		retryMap[monitor.ID] = monitor.Monitoring.RetryCount
	}

	// =========================
	// Load Endpoints
	// =========================
	var endpoints []models.Endpoint

	endpointCursor, err := db.Collection("endpoints").Find(ctx, bson.M{})
	if err != nil {
		log.Println("Load endpoints failed:", err)
		return
	}
	defer endpointCursor.Close(ctx)

	err = endpointCursor.All(ctx, &endpoints)
	if err != nil {
		log.Println("Decode endpoints failed:", err)
		return
	}

	if len(endpoints) == 0 {
		return
	}

	// =========================
	// Channels
	// =========================
	jobs := make(chan CheckJob, len(endpoints))
	results := make(chan WorkerResult, len(endpoints))

	// =========================
	// Start Workers
	// =========================
	StartWorkers(50, jobs, results)

	// =========================
	// Queue Jobs
	// =========================
	for _, endpoint := range endpoints {
		jobs <- CheckJob{
			Endpoint:   endpoint,
			Auth:       authMap[endpoint.Monitor],
			Timeout:    timeoutMap[endpoint.Monitor],
			RetryCount: retryMap[endpoint.Monitor],
		}
	}
	close(jobs)

	// =========================
	// Collect Results
	// =========================
	for result := range results {
		log.Printf(
			"Endpoint: %s | Status: %d | Latency: %dms | Success: %t\n",
			result.Endpoint.Name,
			result.Result.StatusCode,
			result.Result.Latency,
			result.Result.Success,
		)

		SaveResult(result)
	}
}