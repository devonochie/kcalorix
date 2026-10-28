package com.kcalorix.nutrition.service;

import com.kcalorix.common.exception.BadRequestException;
import com.kcalorix.common.exception.ExternalServiceException;
import com.kcalorix.common.exception.TooManyRequestsException;
import com.kcalorix.nutrition.dto.FoodSearchItem;
import com.kcalorix.nutrition.dto.RecognitionResponse;
import com.kcalorix.nutrition.dto.RecognizedItem;
import com.kcalorix.nutrition.recognition.DetectedFood;
import com.kcalorix.nutrition.recognition.FoodRecognitionService;
import com.kcalorix.usage.service.UsageLimitService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecognitionService {

    private static final int MAX_BYTES = 5 * 1024 * 1024;
    private static final int MATCHES_PER_ITEM = 3;

    private final FoodRecognitionService recognizer;
    private final FoodService foodService;
    private final UsageLimitService usageLimits;

    public RecognitionResponse detect(UUID userId, MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new BadRequestException("Image is required");
        }

        byte[] bytes;
        try {
            bytes = image.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Image could not be read");
        }
        if (bytes.length > MAX_BYTES) {
            throw new BadRequestException("Image is too large (max 5 MB)");
        }

        String mimeType = detectMimeType(bytes); // the client's content-type header is ignored

        usageLimits.reservePhoto(userId); // counts every Gemini attempt, even a failed one

        List<DetectedFood> detected = recognizer.recognize(bytes, mimeType); // the image is never saved

        List<RecognizedItem> items = new ArrayList<>();
        for (DetectedFood food : detected) {
            List<FoodSearchItem> matches;
            try {
                matches = foodService.topMatches(food.name(), MATCHES_PER_ITEM);
            } catch (ExternalServiceException | BadRequestException | TooManyRequestsException e) {
                matches = List.of(); // one failed lookup must not lose the whole photo
            }
            items.add(new RecognizedItem(food.name(), food.estimatedGrams(), food.confidence(), matches));
        }
        return new RecognitionResponse(items);
    }

    private String detectMimeType(byte[] b) {
        if (b.length >= 3
                && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }
        if (b.length >= 8
                && (b[0] & 0xFF) == 0x89 && b[1] == 0x50 && b[2] == 0x4E && b[3] == 0x47
                && b[4] == 0x0D && b[5] == 0x0A && b[6] == 0x1A && b[7] == 0x0A) {
            return "image/png";
        }
        if (b.length >= 12
                && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return "image/webp";
        }
        throw new BadRequestException("Only JPEG, PNG or WebP images are allowed");
    }
}