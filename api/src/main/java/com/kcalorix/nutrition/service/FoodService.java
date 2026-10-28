package com.kcalorix.nutrition.service;

import com.kcalorix.common.dto.PageResponse;
import com.kcalorix.common.exception.BadRequestException;
import com.kcalorix.nutrition.client.UsdaClient;
import com.kcalorix.nutrition.dto.FoodDetailResponse;
import com.kcalorix.nutrition.dto.FoodPortionResponse;
import com.kcalorix.nutrition.dto.FoodSearchItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodService {

    private static final int PAGE_SIZE = 20;

    private final UsdaClient client;

    public PageResponse<FoodSearchItem> search(String query, int page, boolean includeBranded) {
        String q = query == null ? "" : query.trim();
        if (q.length() < 2 || q.length() > 100) {
            throw new BadRequestException("Query must be 2-100 characters");
        }
        page = Math.max(0, page);

        JsonNode root = client.search(q, page + 1, includeBranded); // USDA pages start at 1

        List<FoodSearchItem> items = new ArrayList<>();
        for (JsonNode food : root.path("foods")) {
            JsonNode n = food.path("foodNutrients");
            items.add(new FoodSearchItem(
                    food.path("fdcId").asLong(),
                    text(food, "description"),
                    brand(food),
                    text(food, "dataType"),
                    kcal(n),
                    nutrient(n, 1003),   // protein
                    nutrient(n, 1005),   // carbs
                    nutrient(n, 1004))); // fat
        }
        return new PageResponse<>(items, page, PAGE_SIZE,
                root.path("totalHits").asLong(), root.path("totalPages").asInt());
    }

    public FoodDetailResponse detail(long fdcId) {
        if (fdcId <= 0) {
            throw new BadRequestException("Invalid food id");
        }
        JsonNode node = client.detail(fdcId);
        JsonNode n = node.path("foodNutrients");

        List<FoodPortionResponse> portions = new ArrayList<>();
        portions.add(new FoodPortionResponse("100 g", BigDecimal.valueOf(100)));

        for (JsonNode p : node.path("foodPortions")) {
            double grams = p.path("gramWeight").asDouble(0);
            if (grams <= 0) continue;
            String label = text(p, "portionDescription");
            if (isBlank(label) || label.equalsIgnoreCase("Quantity not specified")) {
                label = text(p, "modifier");
            }
            if (isBlank(label)) {
                label = text(p.path("measureUnit"), "name");
            }
            if (isBlank(label)) {
                label = plain(BigDecimal.valueOf(grams)) + " g";
            }
            portions.add(new FoodPortionResponse(label, BigDecimal.valueOf(grams)));
        }

        if ("Branded".equals(text(node, "dataType"))) {
            JsonNode size = node.path("servingSize");
            if (size.isNumber() && size.asDouble() > 0) {
                String amount = plain(size.decimalValue()); // ml is treated as grams
                String household = text(node, "householdServingFullText");
                String label = !isBlank(household)
                        ? household + " (" + amount + " g)"
                        : amount + " " + text(node, "servingSizeUnit");
                portions.add(new FoodPortionResponse(label, size.decimalValue()));
            }
        }

        return new FoodDetailResponse(
                fdcId,
                text(node, "description"),
                brand(node),
                text(node, "dataType"),
                kcal(n),
                nutrient(n, 1003),   // protein
                nutrient(n, 1005),   // carbs
                nutrient(n, 1004),   // fat
                nutrient(n, 1079),   // fiber
                nutrient(n, 2000),   // sugar
                nutrient(n, 1093),   // sodium
                portions);
    }

    // search uses nutrientId/value, detail uses nutrient.id/amount
    private BigDecimal nutrient(JsonNode foodNutrients, int id) {
        if (foodNutrients == null || !foodNutrients.isArray()) return null;
        for (JsonNode fn : foodNutrients) {
            JsonNode idNode = fn.hasNonNull("nutrientId")
                    ? fn.get("nutrientId")
                    : fn.path("nutrient").path("id");
            if (!idNode.isNumber() || idNode.asInt() != id) continue;
            JsonNode val = fn.hasNonNull("value") ? fn.get("value") : fn.path("amount");
            if (!val.isNumber()) return null;
            return val.decimalValue().setScale(2, RoundingMode.HALF_UP);
        }
        return null;
    }

    // Foundation foods often report energy under the Atwater ids 2047/2048
    private BigDecimal kcal(JsonNode foodNutrients) {
        for (int id : new int[]{1008, 2047, 2048}) {
            BigDecimal v = nutrient(foodNutrients, id);
            if (v != null) return v;
        }
        return null;
    }

    private String brand(JsonNode food) {
        String b = text(food, "brandName");
        return isBlank(b) ? text(food, "brandOwner") : b;
    }

    private String text(JsonNode node, String field) {
        JsonNode v = node.path(field);
        if (v.isMissingNode() || v.isNull()) return null;
        return v.asString();
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private String plain(BigDecimal d) {
        return d.stripTrailingZeros().toPlainString();
    }

    public List<FoodSearchItem> topMatches(String name, int limit) {
        List<FoodSearchItem> items = search(name, 0, false).content();
        if (items.isEmpty()) {
            String[] words = name.trim().split("\\s+");
            if (words.length > 2) {
                items = search(words[0] + " " + words[1], 0, false).content();
            }
        }
        return items.stream().limit(limit).toList();
    }
}