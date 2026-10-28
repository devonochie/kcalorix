package com.kcalorix.nutrition.service;

import com.kcalorix.common.exception.BadRequestException;
import com.kcalorix.common.exception.NotFoundException;
import com.kcalorix.nutrition.dto.*;
import com.kcalorix.nutrition.entity.MealEntry;
import com.kcalorix.nutrition.entity.enums.MealType;
import com.kcalorix.nutrition.repository.MealEntryRepository;
import com.kcalorix.user.entity.UserProfile;                // adjust package
import com.kcalorix.user.repository.UserProfileRepository;  // adjust package
import com.kcalorix.user.repository.UserRepository;         // adjust package
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
public class MealService {

    private static final int MAX_ENTRIES_PER_DAY = 100;

    private final MealEntryRepository mealEntryRepository;
    private final FoodService foodService;
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    // No @Transactional: the USDA call is HTTP and must not hold a DB connection.
    public MealEntryResponse add(UUID userId, AddMealEntryRequest r) {
        FoodDetailResponse food = foodService.detail(r.fdcId());
        checkDateAndLimit(userId, r.date(), 1);
        MealEntry saved = mealEntryRepository.save(
                build(userId, r.date(), r.mealType(), food, r.grams()));
        return MealEntryResponse.from(saved);
    }

    // No @Transactional, for the same reason. saveAll is one transaction: all or none.
    public List<MealEntryResponse> addBatch(UUID userId, AddMealBatchRequest r) {
        // fetch every detail first, so any USDA failure happens before anything is saved
        List<FoodDetailResponse> foods = new ArrayList<>();
        for (BatchMealItem item : r.items()) {
            foods.add(foodService.detail(item.fdcId()));
        }

        checkDateAndLimit(userId, r.date(), r.items().size());

        List<MealEntry> entries = new ArrayList<>();
        for (int i = 0; i < r.items().size(); i++) {
            entries.add(build(userId, r.date(), r.mealType(), foods.get(i), r.items().get(i).grams()));
        }

        return mealEntryRepository.saveAll(entries).stream()
                .map(MealEntryResponse::from)
                .toList();
    }

    @Transactional
    public MealEntryResponse update(UUID userId, UUID id, UpdateMealEntryRequest r) {
        MealEntry entry = find(userId, id);

        BigDecimal ratio = r.grams().divide(entry.getGrams(), 10, RoundingMode.HALF_UP);
        entry.setKcal(entry.getKcal().multiply(ratio).setScale(2, RoundingMode.HALF_UP));
        entry.setProteinG(entry.getProteinG().multiply(ratio).setScale(2, RoundingMode.HALF_UP));
        entry.setCarbsG(entry.getCarbsG().multiply(ratio).setScale(2, RoundingMode.HALF_UP));
        entry.setFatG(entry.getFatG().multiply(ratio).setScale(2, RoundingMode.HALF_UP));
        entry.setGrams(r.grams());
        entry.setMealType(r.mealType());

        return MealEntryResponse.from(entry);
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        mealEntryRepository.delete(find(userId, id));
    }

    private void checkDateAndLimit(UUID userId, LocalDate date, int newEntries) {
        UserProfile profile = userProfileRepository.findById(userId).orElseThrow();
        LocalDate today = LocalDate.now(ZoneId.of(profile.getTimezone()));
        if (date.isBefore(today.minusDays(365)) || date.isAfter(today.plusDays(1))) {
            throw new BadRequestException("Date is out of range");
        }
        if (mealEntryRepository.countByUserIdAndLogDate(userId, date) + newEntries > MAX_ENTRIES_PER_DAY) {
            throw new BadRequestException("Daily entry limit reached");
        }
    }

    private MealEntry build(UUID userId, LocalDate date, MealType type,
                            FoodDetailResponse food, BigDecimal grams) {
        if (food.kcal() == null) {
            throw new BadRequestException("This food has no calorie data");
        }
        MealEntry entry = new MealEntry();
        entry.setUser(userRepository.getReferenceById(userId));
        entry.setLogDate(date);
        entry.setMealType(type);
        entry.setFdcId(food.fdcId());
        entry.setFoodName(food.description());
        entry.setBrand(food.brand());
        entry.setGrams(grams);
        entry.setKcal(scale(food.kcal(), grams));
        entry.setProteinG(scale(food.proteinG(), grams));
        entry.setCarbsG(scale(food.carbsG(), grams));
        entry.setFatG(scale(food.fatG(), grams));
        return entry;
    }

    private MealEntry find(UUID userId, UUID id) {
        return mealEntryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Meal entry not found"));
    }

    private BigDecimal scale(BigDecimal per100g, BigDecimal grams) {
        BigDecimal base = per100g == null ? BigDecimal.ZERO : per100g;
        return base.multiply(grams)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }
}