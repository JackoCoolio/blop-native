package api

import (
	"blop-backend/api/auth"
	"blop-backend/api/user"
	"blop-backend/lib"
	"log"

	"github.com/gin-gonic/gin"
)

// Connects API routes.
func SetupApiRoutes(router *gin.Engine, logger *log.Logger, mongo *lib.MongoDBConnection, vars lib.EnvironmentVars) {
	router.POST("/auth/create", func(c *gin.Context) {
		auth.CreateUserHandler(c, logger, mongo, vars)
	})

	router.GET("/user/getid", func(c *gin.Context) {
		user.GetUserIdHandler(c, logger, mongo)
	})

	router.GET("/user/me", func(c *gin.Context) {
		user.MeHandler(c, logger, mongo, vars)
	})

	router.GET("/auth/verify", func(c *gin.Context) {
		user.VerifyHandler(c, logger, mongo, vars)
	})

	router.GET("/auth/login", func(c *gin.Context) {
		auth.LoginHandler(c, logger, mongo, vars)
	})
}
