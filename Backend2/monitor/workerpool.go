package monitor

import (
	"sync"

	"mybackend/models"
)

type WorkerResult struct {
	Endpoint    models.Endpoint
	Result      CheckResult
	AlertEmail  string
	MonitorName string
}

type CheckJob struct {
	Endpoint    models.Endpoint
	Auth        models.Auth
	Timeout     int
	RetryCount  int
	AlertEmail  string
	MonitorName string
}

func StartWorkers(workerCount int, jobs <-chan CheckJob, results chan<- WorkerResult) {
	var wg sync.WaitGroup

	// 1. Spawn the workers
	for i := 0; i < workerCount; i++ {
		wg.Add(1)

		go func() {
			defer wg.Done()

			for job := range jobs {
				// FIX: Pass the Timeout and RetryCount into the checker!
				result := CheckEndpoint(
					job.Endpoint, 
					job.Auth, 
					job.Timeout, 
					job.RetryCount,
				)

				// Send the result to the channel
				results <- WorkerResult{
					Endpoint:    job.Endpoint,
					Result:      result,
					AlertEmail:  job.AlertEmail,
					MonitorName: job.MonitorName,
				}
			}
		}()
	}

	// 2. Safely wait and close the channel in the background
	// FIX: This MUST be in a goroutine so StartWorkers doesn't block the caller!
	go func() {
		wg.Wait()
		close(results)
	}()
}