package com.kcalorix.user.service;

import com.kcalorix.user.dto.UserDataExport;
import com.kcalorix.user.dto.UserDataExport.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/** Same data as the JSON export, flattened into one CSV per table and zipped. */
@Service
@RequiredArgsConstructor
public class CsvExportService {

    private static final String BOM = "\uFEFF"; // so Excel reads UTF-8 correctly

    private final DataExportService exportService;

    public byte[] exportZip(UUID userId) {
        UserDataExport d = exportService.export(userId);
        try (ByteArrayOutputStream bos = new ByteArrayOutputStream();
             ZipOutputStream zip = new ZipOutputStream(bos)) {

            add(zip, "profile.csv",
                    List.of("email", "display_name", "sex", "birth_date", "height_cm", "weight_kg",
                            "target_weight_kg", "activity_level", "goal", "weekly_rate_kg", "unit_system", "timezone"),
                    d.profile() == null ? List.<Profile>of() : List.of(d.profile()),
                    p -> java.util.Arrays.asList(d.account().email(), d.account().displayName(), p.sex(), p.birthDate(),
                            p.heightCm(), p.weightKg(), p.targetWeightKg(), p.activityLevel(), p.goal(),
                            p.weeklyRateKg(), p.unitSystem(), p.timezone()));

            add(zip, "weight.csv", List.of("date", "weight_kg"), d.weightLogs(),
                    w -> java.util.Arrays.asList(w.date(), w.weightKg()));

            add(zip, "meals.csv",
                    List.of("date", "meal", "food", "brand", "grams", "kcal", "protein_g", "carbs_g", "fat_g"),
                    d.meals(),
                    m -> java.util.Arrays.asList(m.date(), m.mealType(), m.food(), m.brand(), m.grams(), m.kcal(),
                            m.proteinG(), m.carbsG(), m.fatG()));

            List<Object[]> planRows = new java.util.ArrayList<>();
            for (Plan p : d.workoutPlans())
                for (Day day : p.days())
                    for (PlanEx e : day.exercises())
                        planRows.add(new Object[]{p.name(), p.active(), day.name(), day.order(), e.exercise(),
                                e.sets(), e.repsMin(), e.repsMax(), e.durationSeconds(), e.restSeconds(), e.notes()});
            add(zip, "workout_plans.csv",
                    List.of("plan", "active", "day", "day_order", "exercise", "sets", "reps_min", "reps_max",
                            "duration_seconds", "rest_seconds", "notes"),
                    planRows, java.util.Arrays::asList);

            List<Object[]> setRows = new java.util.ArrayList<>();
            for (Session s : d.workoutSessions())
                for (SetEntry t : s.sets())
                    setRows.add(new Object[]{s.startedAt(), s.plan(), s.day(), s.status(), s.caloriesBurned(),
                            t.exercise(), t.setNumber(), t.reps(), t.weightKg(), t.durationSeconds(),
                            t.distanceMeters(), t.loggedAt()});
            add(zip, "workout_sets.csv",
                    List.of("session_started_at", "plan", "day", "status", "calories_burned", "exercise",
                            "set_number", "reps", "weight_kg", "duration_seconds", "distance_meters", "logged_at"),
                    setRows, java.util.Arrays::asList);

            zip.finish();
            return bos.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private static <T> void add(ZipOutputStream zip, String name, List<String> header, List<T> rows,
                                Function<T, List<?>> mapper) throws IOException {
        StringBuilder sb = new StringBuilder(BOM);
        sb.append(String.join(",", header)).append("\r\n");
        for (T row : rows) {
            List<?> cells = mapper.apply(row);
            for (int i = 0; i < cells.size(); i++) {
                if (i > 0) sb.append(',');
                sb.append(cell(cells.get(i)));
            }
            sb.append("\r\n");
        }
        zip.putNextEntry(new ZipEntry(name));
        zip.write(sb.toString().getBytes(StandardCharsets.UTF_8));
        zip.closeEntry();
    }

    private static String cell(Object v) {
        if (v == null) return "";
        String s = v.toString();
        // stop spreadsheet formula injection from user-typed text (food names, notes...)
        if (v instanceof String && !s.isEmpty() && "=+-@\t\r".indexOf(s.charAt(0)) >= 0) s = "'" + s;
        if (s.contains(",") || s.contains("\"") || s.contains("\n") || s.contains("\r"))
            s = "\"" + s.replace("\"", "\"\"") + "\"";
        return s;
    }
}