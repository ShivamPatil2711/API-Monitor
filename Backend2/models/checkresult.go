package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CheckResult struct {
	ID primitive.ObjectID

	Endpoint primitive.ObjectID

	StatusCode int

	Latency int64

	Success bool

	Response string

	CheckedAt time.Time
}
