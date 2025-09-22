package main

import (
    "gocv.io/x/gocv"
    "image"
)

// Dummy face detection using Haar Cascade (simple and built-in)
var faceClassifier = gocv.NewCascadeClassifier()

func init() {
    // Load pre-trained face model
    faceClassifier.Load("haarcascade_frontalface_default.xml")
}

// DetectFaces returns rectangles of detected faces
func DetectFaces(img gocv.Mat) []image.Rectangle {
    rects := faceClassifier.DetectMultiScale(img)
    return rects
}
