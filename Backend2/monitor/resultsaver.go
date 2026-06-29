package monitor

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"mybackend/controllers"

	"go.mongodb.org/mongo-driver/bson"
)

func SaveResult(result WorkerResult) {
	collection := controllers.MongoClient.Database("api-monitor").Collection("endpoints")

	newStatus := "DOWN"
	if result.Result.Success {
		newStatus = "UP"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// ── Read previous status to detect UP → DOWN transition ──
	var existing struct {
		CurrentStatus string `bson:"currentStatus"`
	}
	_ = collection.FindOne(ctx, bson.M{"_id": result.Endpoint.ID}).Decode(&existing)

	wasUp := existing.CurrentStatus == "UP" || existing.CurrentStatus == "" // treat new endpoints as UP
	isDown := newStatus == "DOWN"

	// ── Update endpoint in MongoDB ──
	_, err := collection.UpdateByID(
		ctx,
		result.Endpoint.ID,
		bson.M{
			"$set": bson.M{
				"currentStatus":  newStatus,
				"lastStatusCode": result.Result.StatusCode,
				"lastLatency":    result.Result.Latency,
				"lastError":      result.Result.Error,
				"lastCheckedAt":  time.Now(),
			},
		},
	)
	if err != nil {
		log.Printf("Failed to save result for endpoint %s: %v\n", result.Endpoint.Name, err)
		return
	}

	// ── Send alert email only on UP → DOWN transition ──
	if wasUp && isDown && result.AlertEmail != "" {
		go sendDownAlert(result)
	}
}

// sendDownAlert calls the EmailJS REST API to notify the user
func sendDownAlert(result WorkerResult) {
	serviceID := os.Getenv("EMAILJS_SERVICE_ID")
	templateID := os.Getenv("EMAILJS_TEMPLATE_ID")
	publicKey := os.Getenv("EMAILJS_PUBLIC_KEY")

	if serviceID == "" || templateID == "" || publicKey == "" {
		log.Println("EmailJS env vars not set — skipping alert for", result.Endpoint.Name)
		return
	}

	payload := map[string]interface{}{
		"service_id":  serviceID,
		"template_id": templateID,
		"user_id":     publicKey,
		"template_params": map[string]string{
			"to_email":      result.AlertEmail,
			"monitor_name":  result.MonitorName,
			"endpoint_name": result.Endpoint.Name,
			"endpoint_url":  result.Endpoint.URL,
			"status_code":   statusCodeStr(result.Result.StatusCode),
			"checked_at":    time.Now().Format("2006-01-02 15:04:05 UTC"),
		},
	}

	body, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", "https://api.emailjs.com/api/v1.0/email/send", bytes.NewBuffer(body))
	if err != nil {
		log.Println("EmailJS request build failed:", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("EmailJS send failed:", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		log.Printf("Alert sent to %s for endpoint %s\n", result.AlertEmail, result.Endpoint.Name)
	} else {
		log.Printf("EmailJS returned %d for endpoint %s\n", resp.StatusCode, result.Endpoint.Name)
	}
}

func statusCodeStr(code int) string {
	if code == 0 {
		return "no response (connection failed)"
	}
	return fmt.Sprintf("%d %s", code, http.StatusText(code))
}