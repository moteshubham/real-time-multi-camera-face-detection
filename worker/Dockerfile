# Use GoCV prebuilt image with OpenCV 4.8 + contrib modules
FROM gocv/opencv:4.12.0

# Set working directory inside container
WORKDIR /worker

# Copy Go modules files first (for caching)
COPY go.mod go.sum ./

# Download Go dependencies
RUN go mod download

# Copy all worker code
COPY . .

# Build the worker executable
RUN go build -o worker

# Default command to run the worker
CMD ["./worker"]
