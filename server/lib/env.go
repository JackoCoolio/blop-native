package lib

import (
	"errors"
	"os"

	"github.com/joho/godotenv"
)

// Required environment variables.
type EnvironmentVars struct {
	// The URI used to connect to the MongoDB database.
	MONGODB_URI string
	// The salt used when hashing passwords.
	SALT string
	// The key used to sign JWTs.
	JWT_KEY string
}

// Returns the necessary environment variables for the Blop server.
func GetEnvVariables() (EnvironmentVars, error) {
	// load .env file if present
	godotenv.Load(".env")

	// MONGODB_URI
	mongoUri := os.Getenv("MONGODB_URI")
	if mongoUri == "" {
		return EnvironmentVars{}, errors.New("MONGODB_URI is not set")
	}

	// SALT
	salt := os.Getenv("SALT")
	if salt == "" {
		return EnvironmentVars{}, errors.New("SALT is not set")
	}

	// JWT_KEY
	jwtKey := os.Getenv("JWT_KEY")
	if jwtKey == "" {
		return EnvironmentVars{}, errors.New("JWT_KEY is not set")
	}

	return EnvironmentVars{
		MONGODB_URI: mongoUri,
		SALT:        salt,
		JWT_KEY:     jwtKey,
	}, nil
}
