package main

import (
    "fmt"
    "gocv.io/x/gocv"
    "image/color"
)

// Open RTSP stream and process frames
func StartCameraStream(rtspURL string) {
    webcam, err := gocv.VideoCaptureFile(rtspURL) // Connect to RTSP
    if err != nil {
        fmt.Println("Error opening RTSP stream:", err)
        return
    }
    defer webcam.Close()

    img := gocv.NewMat() // Frame container
    defer img.Close()

    fmt.Println("Streaming from:", rtspURL)

    for {
        if ok := webcam.Read(&img); !ok || img.Empty() {  // read frame from RTSP
            continue // skip empty frames
        }

        // Detect faces on this frame
        faces := DetectFaces(img)	//call function to detect faces

        // Draw rectangles for each face
        for _, rect := range faces {
            gocv.Rectangle(&img, rect, color.RGBA{0, 255, 0, 0}, 2)	//draw rectangle around face
        }

        if len(faces) > 0 {
            fmt.Println("Face detected! Count:", len(faces))
            // Send alert to backend
            SendAlert(rtspURL, len(faces))	//send alert to backend
        }

        // TODO: Send frame to MediaMTX
    }
}
