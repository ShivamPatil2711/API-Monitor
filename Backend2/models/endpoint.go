package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Endpoint struct {

	ID primitive.ObjectID `bson:"_id,omitempty" json:"_id"`

	Monitor primitive.ObjectID `bson:"monitor" json:"monitor"`

	Name string `bson:"name" json:"name"`

	URL string `bson:"url" json:"url"`

	Method string `bson:"method" json:"method"`

	Headers map[string]string `bson:"headers" json:"headers"`

	Body interface{} `bson:"body,omitempty" json:"body"`

	Validation struct {
		ExpectedStatus int `bson:"expectedStatus" json:"expectedStatus"`

		ExpectedResponse string `bson:"expectedResponse" json:"expectedResponse"`

		MaxResponseTime int `bson:"maxResponseTime" json:"maxResponseTime"`
	} `bson:"validation" json:"validation"`

	CurrentStatus string `bson:"currentStatus,omitempty" json:"currentStatus"`

	LastCheckedAt time.Time `bson:"lastCheckedAt,omitempty" json:"lastCheckedAt"`

	LastError string `bson:"lastError,omitempty" json:"lastError"`

	LastLatency int64 `bson:"lastLatency,omitempty" json:"lastLatency"`

	LastStatusCode int `bson:"lastStatusCode,omitempty" json:"lastStatusCode"`
}