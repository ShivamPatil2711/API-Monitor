package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Monitor struct {
	ID primitive.ObjectID `bson:"_id,omitempty" json:"_id"`

	Name string `bson:"name" json:"name"`

	User interface{} `bson:"user" json:"user"`

	Auth interface{} `bson:"auth" json:"auth"`

	Monitoring interface{} `bson:"monitoring" json:"monitoring"`

	Endpoints []primitive.ObjectID `bson:"endpoints" json:"endpoints"`
}