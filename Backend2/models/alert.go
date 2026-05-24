package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Alert struct {
	ID primitive.ObjectID

	Monitor primitive.ObjectID

	Message string

	Type string

	CreatedAt time.Time
}
