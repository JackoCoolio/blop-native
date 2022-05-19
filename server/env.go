package main

import (
	"errors"
	"os"

	"github.com/joho/godotenv"
)

type EnvironmentVars struct {
	MONGODB_URI string
}

// Returns the necessary environment variables for the Blop server.
func getEnvVariables() (EnvironmentVars, error) {
	err := godotenv.Load(".env")
	if err != nil {
		return EnvironmentVars{}, errors.New("no .env file present")
	}

	mongoUri := os.Getenv("MONGODB_URI")
	if mongoUri == "" {
		return EnvironmentVars{}, errors.New("MONGODB_URI is not set")
	}

	return EnvironmentVars{mongoUri}, nil
}
