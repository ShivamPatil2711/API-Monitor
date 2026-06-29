package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func main() {
	payload := map[string]interface{}{
		"service_id":  "service_bly4srd",
		"template_id": "template_nax1z8p",
		"user_id":     "2of6cYDKsa98RAAtu",
		"template_params": map[string]string{
			"to_email":      "test@example.com",
			"monitor_name":  "Test Monitor",
			"endpoint_name": "Test Endpoint",
			"endpoint_url":  "https://example.com",
			"status_code":   "404 Not Found (404)",
			"checked_at":    "2026-06-29 15:00:00 UTC",
		},
	}

	body, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", "https://api.emailjs.com/api/v1.0/email/send", bytes.NewBuffer(body))
	if err != nil {
		fmt.Println("Error creating request:", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error sending request:", err)
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	fmt.Printf("Status: %d\n", resp.StatusCode)
	fmt.Printf("Response: %s\n", string(respBody))
}
