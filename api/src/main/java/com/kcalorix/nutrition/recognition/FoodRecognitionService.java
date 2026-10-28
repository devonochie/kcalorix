package com.kcalorix.nutrition.recognition;

import java.util.List;

public interface FoodRecognitionService {
    List<DetectedFood> recognize(byte[] image, String mimeType);
}