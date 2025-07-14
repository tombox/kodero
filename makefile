# ==============================================================================
# Project Variables
# - Customize these for your project
# ==============================================================================
#
# Before running ensure you are loggined into corect project:
# 
# gcloud auth login <email>
# gcloud config set project decoded-vision-349011
#
# --- GCP Configuration ---
GCP_PROJECT_ID := decoded-vision-349011
GCP_REGION     := europe-west2

# --- Artifact Registry Configuration ---
AR_REPO_NAME   := docker-repo
IMAGE_NAME     := kodero-img

# --- Cloud Run Configuration ---
SERVICE_NAME_PROD   := kodero-prod
SERVICE_NAME_STAGING   := kodero-staging

HOST_DOMAIN_PROD :=    "kodero.io"
HOST_DOMAIN_STAGING := "staging.kodero.io"

# --- Dynamic Variables (Should not need to be changed) ---
GIT_HASH       := $(shell git rev-parse --short HEAD)
IMAGE_URL_BASE := $(GCP_REGION)-docker.pkg.dev/$(GCP_PROJECT_ID)/$(AR_REPO_NAME)/$(IMAGE_NAME)
IMAGE_TAG_URL  := $(IMAGE_URL_BASE):$(GIT_HASH)

# ==============================================================================
# Commands
# ==============================================================================

# Use .PHONY to declare targets that are not files
.PHONY: run build deploy-prod

# Runs the local development environment
run:
	@echo "Starting local environment with docker-compose..."
	docker compose down
	docker compose up --build -d 

# Connect to the web container's shell
shell:
	@echo "Connecting to web container shell..."
	docker compose exec web /bin/bash

# Builds and pushes a uniquely tagged Docker image to Artifact Registry
build:
	@echo "Building image with tag: $(GIT_HASH)"
	@echo "Pushing to: $(IMAGE_TAG_URL)"
	docker buildx build --platform linux/amd64 \
	  -t $(IMAGE_TAG_URL) \
	  --push .

# Deploys the most recently built image to Cloud Run
# This command depends on `build`, so it will always build first.
deploy-prod: build
	@echo "Deploying image $(IMAGE_TAG_URL) to Cloud Run service $(SERVICE_NAME_PROD)..."
	gcloud run deploy $(SERVICE_NAME_PROD) \
	  --image $(IMAGE_TAG_URL) \
	  --platform managed \
	  --region $(GCP_REGION) \

deploy-staging: build
	@echo "Deploying image $(IMAGE_TAG_URL) to Cloud Run service $(SERVICE_NAME_STAGING)..."
	gcloud run deploy $(SERVICE_NAME_STAGING) \
	  --image $(IMAGE_TAG_URL) \
	  --platform managed \
	  --region $(GCP_REGION) \


# Run all tests
test:
	@echo "Running all tests..."
	npm test:unit

# Run syncablemodel tests specifically  
run:
	npm run dev