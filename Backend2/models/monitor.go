package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Auth struct {
	Type string `bson:"type" json:"type"`

	Token string `bson:"token,omitempty" json:"token,omitempty"`

	Header string `bson:"header,omitempty" json:"header,omitempty"`

	Value string `bson:"value,omitempty" json:"value,omitempty"`

	LoginEndpoint string `bson:"loginendpoint,omitempty" json:"loginendpoint,omitempty"`

	Email string `bson:"email,omitempty" json:"email,omitempty"`

	Password string `bson:"password,omitempty" json:"password,omitempty"`
}

type Monitoring struct {
	Timeout int `bson:"timeout" json:"timeout"`

	RetryCount int `bson:"retryCount" json:"retryCount"`
}

type Monitor struct {
	ID primitive.ObjectID `bson:"_id,omitempty" json:"_id"`

	Name string `bson:"name" json:"name"`

	User primitive.ObjectID `bson:"user" json:"user"`

	AlertEmail string `bson:"alertEmail,omitempty" json:"alertEmail,omitempty"`

	Auth Auth `bson:"auth" json:"auth"`

	Monitoring Monitoring `bson:"monitoring" json:"monitoring"`

	Endpoints []primitive.ObjectID `bson:"endpoints" json:"endpoints"`
}