package main

import (
	"errors"
	"os"

	"github.com/joho/godotenv"
)

// Required environment variables.
type EnvironmentVars struct {
	// The URI used to connect to the MongoDB database.
	MONGODB_URI string
}

// Returns the necessary environment variables for the Blop server.
func getEnvVariables() (EnvironmentVars, error) {
	// load .env file if present
	godotenv.Load(".env")

	// MONGODB_URI
	mongoUri := os.Getenv("MONGODB_URI")
	if mongoUri == "" {
		return EnvironmentVars{}, errors.New("MONGODB_URI is not set")
	}

	return EnvironmentVars{mongoUri}, nil
}
