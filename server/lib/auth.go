package lib

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

type Claims struct {
	UserID string `json:"userid"`
	jwt.StandardClaims
}

// Create an unsigned JWT for user with the given user ID.
func CreateJWT(userId string, exp time.Time) *jwt.Token {
	claims := &Claims{
		UserID: userId,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: exp.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token
}

// Signs a JWT with the given key.
func SignJWT(token *jwt.Token, key []byte) (string, error) {
	jwtString, err := token.SignedString(key)
	if err != nil {
		return "", err
	}
	return jwtString, nil
}

// Verifies a JWT and returns the user ID if it is valid.
func VerifyJWT(tokenString string, key []byte, algo jwt.SigningMethod) (string, error) {
	claims := Claims{}

	token, err := jwt.ParseWithClaims(tokenString, &claims, func(t *jwt.Token) (interface{}, error) {
		if t.Method != algo {
			return nil, errors.New("invalid signing method")
		}
		return key, nil
	})

	if err != nil {
		if err == jwt.ErrSignatureInvalid {
			return "invalid", nil // "invalid" isn't a valid xid, so we can use it for this
		} else if err == jwt.ErrTokenExpired {
			return "expired", nil
		} else {
			return "error", err
		}
	}

	// assuming this is false when the token has expired?
	// documentation isn't clear
	if !token.Valid {
		return "", nil
	}

	fmt.Printf("userid: %v\n", claims.UserID)

	return claims.UserID, nil
}

// Creates and signs a JWT with a key.
func CreateSignedJWT(userId string, key []byte, exp time.Time) (string, error) {
	return SignJWT(CreateJWT(userId, exp), key)
}

var (
	// The request did not include an Authorization header.
	ErrMissingAuthHeader = errors.New("missing auth header")
	// The authorization header wasn't two tokens ("Bearer" and the JWT).
	ErrMalformedAuthHeader = errors.New("malformed auth header")
)

// Extracts the JWT from a request's authorization header.
func GetJWTFromContext(c *gin.Context) (string, error) {
	s := c.Request.Header.Get("Authorization")

	// no token => not logged in
	if s == "" {
		return "", ErrMissingAuthHeader
	}

	segments := strings.SplitN(s, " ", 2)
	if len(segments) != 2 || segments[0] != "Bearer" {
		return "", ErrMalformedAuthHeader
	}

	return segments[1], nil
}

// Verifies that a request provided a valid JWT and returns the associated user ID.
func VerifyJWTFromContext(c *gin.Context, key []byte, method *jwt.SigningMethodHMAC) (string, error) {
	token, err := GetJWTFromContext(c)
	if err != nil {
		return token, err
	}

	return VerifyJWT(token, key, method)
}
