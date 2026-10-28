package com.kcalorix.nutrition.client;

import com.kcalorix.common.exception.ExternalServiceException;
import com.kcalorix.common.exception.NotFoundException;
import com.kcalorix.usage.service.UsageLimitService;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.JsonNode;

import java.net.http.HttpClient;
import java.time.Duration;

@Component
public class UsdaClient {

    private static final Logger log = LoggerFactory.getLogger(UsdaClient.class);

    private static final String BASE_TYPES = "Foundation,SR Legacy,Survey (FNDDS)";

    private final RestClient client;
    private final UsageLimitService usageLimits;

    private final Cache<String, JsonNode> searchCache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(10))
            .maximumSize(500)
            .build();

    private final Cache<Long, JsonNode> detailCache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofHours(24))
            .maximumSize(2000)
            .build();

    public UsdaClient(@Value("${usda.api-key}") String apiKey,
                      @Value("${usda.base-url}") String baseUrl,
                      UsageLimitService usageLimits) {
        this.usageLimits = usageLimits;
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofSeconds(5));

        this.client = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("X-Api-Key", apiKey)
                .requestFactory(factory)
                .build();
    }

    public JsonNode search(String query, int pageNumber, boolean includeBranded) {
        String key = query.toLowerCase() + "|" + pageNumber + "|" + includeBranded;
        // a thrown exception means nothing is stored, so failures are never cached
        return searchCache.get(key, k -> {
            usageLimits.reserveUsdaCall(); // only real USDA calls count, not cache hits
            String dataType = includeBranded ? BASE_TYPES + ",Branded" : BASE_TYPES;
            try {
                JsonNode body = client.get()
                        .uri(b -> b.path("/foods/search")
                                .queryParam("query", query)
                                .queryParam("pageSize", 20)
                                .queryParam("pageNumber", pageNumber)
                                .queryParam("dataType", dataType)
                                .build())
                        .retrieve()
                        .body(JsonNode.class);
                return requireBody(body);
            } catch (RestClientResponseException e) {
                throw translate(e, false);
            } catch (ResourceAccessException e) {
                throw timeout();
            }
        });
    }

    public JsonNode detail(long fdcId) {
        return detailCache.get(fdcId, k -> {
            usageLimits.reserveUsdaCall();
            try {
                JsonNode body = client.get()
                        .uri("/food/{fdcId}", fdcId)
                        .retrieve()
                        .body(JsonNode.class);
                return requireBody(body);
            } catch (RestClientResponseException e) {
                throw translate(e, true);
            } catch (ResourceAccessException e) {
                throw timeout();
            }
        });
    }

    private JsonNode requireBody(JsonNode body) {
        if (body == null) {
            log.warn("USDA returned an empty body");
            throw new ExternalServiceException("Food database is unavailable");
        }
        return body;
    }

    private RuntimeException translate(RestClientResponseException e, boolean allowNotFound) {
        int status = e.getStatusCode().value();
        log.warn("USDA request failed with status {}", status);
        if (allowNotFound && status == HttpStatus.NOT_FOUND.value()) {
            return new NotFoundException("Food not found");
        }
        if (status == HttpStatus.TOO_MANY_REQUESTS.value()) {
            return new ExternalServiceException("Food database is busy, try again shortly");
        }
        return new ExternalServiceException("Food database is unavailable");
    }

    private RuntimeException timeout() {
        log.warn("USDA request timed out or could not connect");
        return new ExternalServiceException("Food database is unavailable");
    }
}