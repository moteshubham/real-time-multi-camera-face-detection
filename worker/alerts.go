package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type Alert struct {
    CameraID  string `json:"cameraId"`
    Timestamp string `json:"timestamp"`
    Faces     int    `json:"faces"` // number of faces detected
}

// Send alert to backend
func SendAlert(cameraURL string, faceCount int) {
    alert := Alert{
        CameraID:  cameraURL,
        Timestamp: time.Now().Format(time.RFC3339),
        Faces:     faceCount,
    }
    data, _ := json.Marshal(alert)

    resp, err := http.Post("http://localhost:3000/alert", "application/json", bytes.NewBuffer(data))
    if err != nil {
        fmt.Println("Error sending alert:", err)
        return
    }
    defer resp.Body.Close()
    fmt.Println("Alert sent, status:", resp.Status)
}
