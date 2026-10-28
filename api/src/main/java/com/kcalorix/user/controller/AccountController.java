package com.kcalorix.user.controller;

import com.kcalorix.auth.security.CalorixUserDetails;
import com.kcalorix.user.dto.DeleteAccountRequest;
import com.kcalorix.user.dto.UserDataExport;
import com.kcalorix.user.service.AccountDeletionService;
import com.kcalorix.user.service.CsvExportService;
import com.kcalorix.user.service.DataExportService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/me")
@RequiredArgsConstructor
public class AccountController {

    private final AccountDeletionService deletionService;
    private final DataExportService exportService;
    private final CsvExportService csvExportService;

    @DeleteMapping
    public ResponseEntity<Void> delete(@AuthenticationPrincipal CalorixUserDetails principal,
                                       @Valid @RequestBody DeleteAccountRequest body,
                                       HttpServletRequest req) {
        deletionService.deleteAccount(principal.getId(), body.password());

        HttpSession session = req.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE,
                        ResponseCookie.from("CALORIX_SESSION", "").path("/").maxAge(0).build().toString())
                .header(HttpHeaders.SET_COOKIE,
                        ResponseCookie.from("XSRF-TOKEN", "").path("/").maxAge(0).build().toString())
                .build();
    }
    @GetMapping("/export")
    public ResponseEntity<UserDataExport> export(@AuthenticationPrincipal CalorixUserDetails principal) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"calorix-export.json\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(exportService.export(principal.getId()));
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(@AuthenticationPrincipal CalorixUserDetails principal) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"calorix-export-csv.zip\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .contentType(org.springframework.http.MediaType.parseMediaType("application/zip"))
                .body(csvExportService.exportZip(principal.getId()));
    }
}