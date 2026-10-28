package com.kcalorix.nutrition.service;

import com.kcalorix.nutrition.dto.DiaryResponse;
import com.kcalorix.nutrition.dto.MealEntryResponse;
import com.kcalorix.nutrition.dto.MealGroupResponse;
import com.kcalorix.nutrition.dto.NutrientTotals;
import com.kcalorix.nutrition.entity.MealEntry;
import com.kcalorix.nutrition.entity.enums.MealType;
import com.kcalorix.nutrition.repository.MealEntryRepository;
import com.kcalorix.user.entity.UserProfile;                // adjust package
import com.kcalorix.user.repository.UserProfileRepository;  // adjust package
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DiaryService {

    private final MealEntryRepository mealEntryRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public DiaryResponse get(UUID userId, LocalDate date) {
        if (date == null) {
            UserProfile profile = userProfileRepository.findById(userId).orElseThrow();
            date = LocalDate.now(ZoneId.of(profile.getTimezone()));
        }

        List<MealEntry> entries =
                mealEntryRepository.findByUserIdAndLogDateOrderByCreatedAtAsc(userId, date);

        List<MealGroupResponse> meals = new ArrayList<>();
        List<MealEntry> all = new ArrayList<>();
        for (MealType type : MealType.values()) {
            List<MealEntry> ofType = entries.stream()
                    .filter(e -> e.getMealType() == type)
                    .toList();
            all.addAll(ofType);
            meals.add(new MealGroupResponse(
                    type,
                    sum(ofType),
                    ofType.stream().map(MealEntryResponse::from).toList()));
        }

        return new DiaryResponse(date, sum(all), meals);
    }

    private NutrientTotals sum(List<MealEntry> entries) {
        BigDecimal kcal = BigDecimal.ZERO;
        BigDecimal protein = BigDecimal.ZERO;
        BigDecimal carbs = BigDecimal.ZERO;
        BigDecimal fat = BigDecimal.ZERO;
        for (MealEntry e : entries) {
            kcal = kcal.add(e.getKcal());
            protein = protein.add(e.getProteinG());
            carbs = carbs.add(e.getCarbsG());
            fat = fat.add(e.getFatG());
        }
        return new NutrientTotals(
                kcal.setScale(2, RoundingMode.HALF_UP),
                protein.setScale(2, RoundingMode.HALF_UP),
                carbs.setScale(2, RoundingMode.HALF_UP),
                fat.setScale(2, RoundingMode.HALF_UP));
    }
}