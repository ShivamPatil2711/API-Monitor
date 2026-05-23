package middleware

import (
	"context"
	"net/http"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserContextKey contextKey = "user"

func AuthMiddleware(
	next http.Handler,
) http.Handler {

	return http.HandlerFunc(
		func(
			w http.ResponseWriter,
			r *http.Request,
		) {

			cookie, err := r.Cookie(
				"Usercookie",
			)

			if err != nil {

				http.Error(
					w,
					"Unauthorized",
					http.StatusUnauthorized,
				)

				return
			}

			tokenString := cookie.Value

			token, err := jwt.Parse(
				tokenString,

				func(
					token *jwt.Token,
				) (interface{}, error) {

					return []byte(
						os.Getenv(
							"JWT_SECRET",
						),
					), nil
				},
			)

			if err != nil ||
				!token.Valid {

				http.Error(
					w,
					"Invalid Token",
					http.StatusUnauthorized,
				)

				return
			}

			claims := token.Claims.(jwt.MapClaims)

			ctx := context.WithValue(
				r.Context(),
				UserContextKey,
				claims,
			)

			next.ServeHTTP(
				w,
				r.WithContext(
					ctx,
				),
			)

		},
	)
}