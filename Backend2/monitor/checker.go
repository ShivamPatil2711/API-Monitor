package monitor

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"mybackend/models"
)

type CheckResult struct {
	StatusCode int
	Latency    int64
	Success    bool
	Error      string
}

func LoginAndGetAuth(client *http.Client, auth models.Auth) (string, []*http.Cookie) {
	loginBody := map[string]string{
		"email":    auth.Email,
		"password": auth.Password,
	}

	data, _ := json.Marshal(loginBody)
	req, err := http.NewRequest("POST", auth.LoginEndpoint, bytes.NewBuffer(data))
	if err != nil {
		return "", nil
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return "", nil
	}
	defer resp.Body.Close()

	var body map[string]interface{}
	_ = json.NewDecoder(resp.Body).Decode(&body)

	token, _ := body["token"].(string)
	return token, resp.Cookies()
}

func CheckEndpoint(endpoint models.Endpoint, auth models.Auth, timeout int, retryCount int) CheckResult {
	start := time.Now()

	// Safety checks
	if timeout <= 0 {
		timeout = 10
	}
	if retryCount < 0 {
		retryCount = 0
	}

	client := &http.Client{
		Timeout: time.Duration(timeout) * time.Second,
	}

	var bodyReader io.Reader
	var bodyBytes []byte

	// 1. Parse Request Body safely
	if endpoint.Body != nil {
		switch v := endpoint.Body.(type) {
		case string:
			if v != "" {
				bodyBytes = []byte(v)
				bodyReader = strings.NewReader(v)
			}
		default:
			jsonData, err := json.Marshal(v)
			if err == nil {
				bodyBytes = jsonData
				bodyReader = bytes.NewBuffer(jsonData)
			}
		}
	}

	req, err := http.NewRequest(endpoint.Method, endpoint.URL, bodyReader)
	if err != nil {
		return CheckResult{Success: false, Error: err.Error()}
	}

	// 2. Apply Headers
	hasContentType := false
	for key, value := range endpoint.Headers {
		req.Header.Set(key, value)
		if strings.ToLower(key) == "content-type" {
			hasContentType = true
		}
	}

	if bodyReader != nil && !hasContentType {
		req.Header.Set("Content-Type", "application/json")
	}

	// Apply Initial Auth
	if auth.Token != "" {
		req.Header.Set("Authorization", "Bearer "+auth.Token)
	}
	if auth.Header != "" && auth.Value != "" {
		req.Header.Set(auth.Header, auth.Value)
	}

	var resp *http.Response

	// ==========================================
	// 3. ATTEMPT REQUEST (With Network Retries)
	// ==========================================
	for attempt := 0; attempt <= retryCount; attempt++ {

		// Always ensure the body is fresh before firing the request
		if len(bodyBytes) > 0 {
			req.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		}

		resp, err = client.Do(req)

		if err == nil {
			break
		}
	}

	// ==========================================
	// 4. THE 401 AUTO-LOGIN INTERCEPTOR
	// ==========================================
	if err == nil && resp.StatusCode == 401 && auth.LoginEndpoint != "" {
		resp.Body.Close()

		token, cookies := LoginAndGetAuth(client, auth)

		if token != "" {
			req.Header.Set("Authorization", "Bearer "+token)
		}
		for _, cookie := range cookies {
			req.AddCookie(cookie)
		}

		if len(bodyBytes) > 0 {
			req.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		}

		// Final attempt with new credentials
		resp, err = client.Do(req)
	}

	// 5. Final Result Calculation
	if err != nil {
		return CheckResult{Success: false, Error: err.Error()}
	}
	log.Printf("DEBUG: Endpoint %s - LoginEndpoint parsed as: '%s'\n", endpoint.Name, auth.LoginEndpoint)
	defer resp.Body.Close()

	return CheckResult{
		StatusCode: resp.StatusCode,
		Latency:    time.Since(start).Milliseconds(),
		Success:    resp.StatusCode >= 200 && resp.StatusCode < 300,
	}
}
