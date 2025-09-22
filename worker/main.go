package main

import "fmt"

func main() {
    fmt.Println("Worker starting...")

    // List of camera RTSP URLs
    cameras := []string{
        "rtsp://username:password@camera1_ip:554/stream",
    }

    // Loop through cameras and start streaming
    for _, url := range cameras {
        go StartCameraStream(url) // Start each camera in a separate goroutine
    }

    // Keep main alive
    select {}
}
