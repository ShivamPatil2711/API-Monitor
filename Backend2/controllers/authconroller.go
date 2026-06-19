package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

var (
	MongoClient *mongo.Client
	JWTSecret   string
)

func InitController(
	client *mongo.Client,
	jwtSecret string,
) {
	MongoClient = client
	JWTSecret = jwtSecret
}

type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name     string             `bson:"name" json:"name"`
	Email    string             `bson:"email" json:"email"`
	Password string             `bson:"password" json:"-"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	fmt.Println("Login request received for email:", req.Email)
	collection := MongoClient.Database("api-monitor").Collection("users")

	var user User
	err := collection.FindOne(context.TODO(), bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid Credentials", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		http.Error(w, "Invalid Credentials", http.StatusUnauthorized)
		return
	}

	// Generate JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": user.ID.Hex(),
		"email":  user.Email,
		"exp":    time.Now().Add(2 * time.Hour).Unix(),
	})

	tokenString, _ := token.SignedString([]byte(JWTSecret))

http.SetCookie(w, &http.Cookie{
    Name:     "Usercookie",
    Value:    tokenString,
    Path:     "/",
    HttpOnly: true,
    Secure:   true,
    SameSite: http.SameSiteNoneMode,
    MaxAge:   7200,
})

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Login successful",
		"user": map[string]interface{}{
			"_id":   user.ID.Hex(),
			"name":  user.Name,
			"email": user.Email,
		},
	})
}

func Signup(w http.ResponseWriter, r *http.Request) {

	type SignupRequest struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var req SignupRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Validation

	var errors []string

	if !regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`).MatchString(req.Email) {
		errors = append(errors, "Please enter a valid email")
	}

	password := req.Password

	if len(password) < 6 {
		errors = append(errors, "Password should be at least 6 characters long")
	}

	if !regexp.MustCompile(`[A-Z]`).MatchString(password) {
		errors = append(errors, "Password should contain at least one uppercase letter")
	}

	if !regexp.MustCompile(`[a-z]`).MatchString(password) {
		errors = append(errors, "Password should contain at least one lowercase letter")
	}

	if !regexp.MustCompile(`[0-9]`).MatchString(password) {
		errors = append(errors, "Password should contain at least one number")
	}

	if !regexp.MustCompile(`[!@#$%^&*]`).MatchString(password) {
		errors = append(errors, "Password should contain at least one special character")
	}

	name := strings.TrimSpace(req.Name)

	if len(name) < 2 {
		errors = append(errors, "Name should be at least 2 characters long")
	}

	if !regexp.MustCompile(`^[A-Za-z\s]+$`).MatchString(name) {
		errors = append(errors, "Name should contain only alphabets")
	}

	if len(errors) > 0 {
		w.WriteHeader(http.StatusUnprocessableEntity)

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"errors":  errors,
		})

		return
	}

	collection := MongoClient.
		Database("api-monitor").
		Collection("users")

	var existing User

	err := collection.FindOne(
		context.TODO(),
		bson.M{
			"email": strings.ToLower(req.Email),
		},
	).Decode(&existing)

	if err == nil {

		w.WriteHeader(http.StatusConflict)

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Email already exists",
		})

		return
	}

	hash, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		12,
	)

	if err != nil {
		http.Error(w, "Registration failed", http.StatusInternalServerError)
		return
	}

	user := User{
		Name:     name,
		Email:    strings.TrimSpace(strings.ToLower(req.Email)),
		Password: string(hash),
	}

	_, err = collection.InsertOne(
		context.TODO(),
		user,
	)

	if err != nil {
		http.Error(w, "Registration failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"message":  "User registered successfully",
		"redirect": "/login",
	})
}

func CheckAuth(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("Usercookie")
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{"isLoggedIn": false, "user": nil})
		return
	}

	token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
		return []byte(JWTSecret), nil
	})

	if err != nil || !token.Valid {
		json.NewEncoder(w).Encode(map[string]interface{}{"isLoggedIn": false, "user": nil})
		return
	}

	claims := token.Claims.(jwt.MapClaims)
	user := map[string]interface{}{
		"_id":   claims["userId"],
		"email": claims["email"],
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"isLoggedIn": true,
		"user":       user,
	})
}

func Logout(w http.ResponseWriter, r *http.Request) {
http.SetCookie(w, &http.Cookie{
    Name:     "Usercookie",
    Value:    "",
    Path:     "/",
    MaxAge:   -1,
    HttpOnly: true,
    Secure:   true,
    SameSite: http.SameSiteNoneMode,
})
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}

func GetProfile(w http.ResponseWriter, r *http.Request) {
	_, err := r.Cookie("Usercookie")
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Verify token and return user profile (add logic as needed)
	json.NewEncoder(w).Encode(map[string]string{"message": "Profile endpoint ready"})
}
