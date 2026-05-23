package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Endpoint struct {
	ID primitive.ObjectID `bson:"_id,omitempty" json:"_id"`

	Monitor primitive.ObjectID `bson:"monitor" json:"monitor"`

	Name string `bson:"name" json:"name"`

	URL string `bson:"url" json:"url"`

	Method string `bson:"method" json:"method"`

	Headers map[string]string `bson:"headers" json:"headers"`


	Body interface{} `bson:"body" json:"body"`

	Validation struct {
		ExpectedStatus   int    `bson:"expectedStatus"`
		ExpectedResponse string `bson:"expectedResponse"`
		MaxResponseTime  int    `bson:"maxResponseTime"`
	} `bson:"validation"`
}