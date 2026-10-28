package com.kcalorix.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.URI;
import java.net.http.HttpClient;
import java.time.Duration;
import java.time.Year;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String BRAND_NAME = "Kcalorix";

    // ---- Kcalorix palette (the same colours as the app, converted from the oklch tokens in globals.css) ----
    private static final String INK = "#1A1512";          // --foreground (light theme)
    private static final String BODY_TEXT = "#3F3935";     // softer body copy
    private static final String MUTED = "#68625E";         // --muted-foreground
    private static final String PAGE_BG = "#FBFAF7";       // --background (light theme)
    private static final String BORDER = "#E6E6E6";        // --border
    private static final String ORANGE = "#DB5800";        // --primary (light theme): buttons, accents on white
    private static final String ORANGE_TEXT = "#B83600";   // --primary-text: orange links/labels on white
    private static final String ORANGE_TINT = "#FBEEE6";   // primary at 10%: callout background
    private static final String ORANGE_ON_DARK = "#FE7802";// --primary (dark theme): accents on the dark header
    private static final String ON_ORANGE = "#0E0A07";     // --primary-foreground: text on orange
    private static final String DARK = "#110F0D";          // --card (dark theme): header background
    private static final String ON_DARK = "#F9F4EE";       // --foreground (dark theme)
    private static final String ON_DARK_MUTED = "#A39D98"; // --muted-foreground (dark theme)

    // The app uses Anton for headings and Space Grotesk for text. Email apps that can't load web fonts
    // (Gmail, Outlook) fall back to the next font in the list.
    private static final String FONT_DISPLAY = "Anton,'Bebas Neue',Impact,'Arial Narrow',sans-serif";
    private static final String FONT_TEXT = "'Space Grotesk',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

    private static final Pattern PLACEHOLDER = Pattern.compile("\\{\\{(\\w+)}}");

    private final RestClient client;
    private final String senderEmail;
    private final String senderName;
    private final String replyToEmail;
    private final String frontendUrl;

    public EmailService(@Value("${brevo.api-key}") String apiKey,
                        @Value("${brevo.sender-email}") String senderEmail,
                        @Value("${brevo.sender-name}") String senderName,
                        @Value("${brevo.reply-to-email}") String replyToEmail,
                        @Value("${app.frontend-url}") String frontendUrl) {
        this.senderEmail = senderEmail;
        this.senderName = senderName;
        this.replyToEmail = replyToEmail;
        this.frontendUrl = frontendUrl;

        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofSeconds(10));

        this.client = RestClient.builder()
                .baseUrl("https://api.brevo.com/v3")
                .defaultHeader("api-key", apiKey)
                .requestFactory(factory)
                .build();
    }


    private static final String EMAIL_SHELL = """
            <!doctype html>
            <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width,initial-scale=1">
              <meta name="x-apple-disable-message-reformatting">
              <meta name="color-scheme" content="light">
              <meta name="supported-color-schemes" content="light">
              <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
              <title>{{subject}}</title>
              <!--[if mso]>
              <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
              <![endif]-->
              <link href="https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
              <style>
                html,body{margin:0!important;padding:0!important;width:100%!important;height:100%!important}
                *{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}
                table,td{mso-table-lspace:0!important;mso-table-rspace:0!important;border-collapse:collapse!important}
                table{border-spacing:0!important}
                img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none;display:block}
                a{text-decoration:none;color:#B83600}
                a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}
                u+#body a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit}
                #MessageViewBody a{color:inherit!important;text-decoration:none!important}
                .preheader{display:none!important;visibility:hidden!important;opacity:0!important;color:transparent!important;height:0!important;width:0!important;overflow:hidden!important;mso-hide:all!important}
                .button:hover{background:#FE7802!important}
                @media screen and (max-width:680px){
                  .outer{padding:12px 12px 28px!important}
                  .email{width:100%!important;max-width:100%!important}
                  .pad{padding-left:22px!important;padding-right:22px!important}
                  .headline{font-size:34px!important;line-height:38px!important}
                  .button-table,.button-link{width:100%!important;box-sizing:border-box!important}
                  .feature{display:block!important;width:100%!important;padding:0 0 12px!important}
                  .footer-link{display:inline-block!important;padding:4px 0!important}
                }
                @media screen and (max-width:400px){
                  .outer{padding:8px 8px 24px!important}
                  .pad{padding-left:18px!important;padding-right:18px!important}
                  .headline{font-size:30px!important;line-height:34px!important}
                  .hero-label{letter-spacing:1px!important}
                }
              </style>
            </head>
            <body class="page" style="margin:0;padding:0;background:#FBFAF7;font-family:{{font_text}}">
              <div class="preheader">{{preheader}}</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:100%;background:#FBFAF7">
                <tr>
                  <td class="outer" align="center" style="padding:28px 24px 48px;word-break:break-word">
                    <table role="presentation" class="email" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:620px;background:#ffffff;border:1px solid #E6E6E6">
                      <tr>
                        <td style="background:#DB5800;height:6px;line-height:6px;font-size:0">&nbsp;</td>
                      </tr>
                      <tr>
                        <td class="pad" align="left" style="background:#110F0D;padding:30px 36px 0">
                          <a href="{{website_url}}" target="_blank" aria-label="Open {{brand}}" style="text-decoration:none;font-family:{{font_display}};font-size:28px;line-height:32px;letter-spacing:0.5px;text-transform:uppercase;color:#F9F4EE">{{brand}}<span style="color:#FE7802">.</span></a>
                        </td>
                      </tr>
                      <tr>
                        <td class="pad" style="background:#110F0D;padding:34px 36px 42px;word-break:break-word;overflow-wrap:break-word">
                          <p style="margin:0 0 16px;font-family:{{font_text}}">
                            <span style="display:inline-block;padding:4px 10px;background:#FE7802;color:#0E0A07;font-size:12px;line-height:16px;font-weight:bold;margin-right:10px;vertical-align:middle;white-space:nowrap">{{hero_icon}}</span><span class="hero-label" style="color:#FE7802;font-size:12px;line-height:16px;letter-spacing:2.5px;text-transform:uppercase;font-weight:bold;vertical-align:middle;word-break:break-word;overflow-wrap:break-word">{{hero_label}}</span>
                          </p>
                          <h1 class="headline" style="margin:0;color:#F9F4EE;font-size:44px;line-height:48px;font-weight:normal;text-transform:uppercase;letter-spacing:-0.2px;font-family:{{font_display}};word-break:break-word;overflow-wrap:break-word">{{hero_title}}</h1>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 0"><tr><td style="width:48px;height:4px;background:#FE7802;font-size:0;line-height:0">&nbsp;</td></tr></table>
                          <p style="margin:18px 0 0;color:#A39D98;font-size:16px;line-height:25px;font-family:{{font_text}};word-break:break-word;overflow-wrap:break-word">{{hero_subcopy}}</p>
                        </td>
                      </tr>
                      <tr>
                        <td class="pad" style="padding:38px 36px 40px;background:#ffffff;color:#3F3935;font-size:16px;line-height:26px;font-family:{{font_text}};word-break:break-word;overflow-wrap:break-word">
                          {{body_content}}
                        </td>
                      </tr>
                      <tr>
                        <td class="pad" style="padding:28px 36px 34px;background:#FBFAF7;border-top:1px solid #E6E6E6;color:#68625E;font-size:13px;line-height:21px;font-family:{{font_text}};word-break:break-word;overflow-wrap:break-word">
                          <p style="margin:0 0 14px">Questions? <a href="mailto:{{support_email}}" style="color:#B83600!important;font-weight:bold;text-decoration:none!important">We're here to help.</a></p>
                          <p style="margin:0 0 18px">{{website_link}}</p>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px"><tr><td style="width:32px;height:3px;background:#DB5800;font-size:0;line-height:0">&nbsp;</td></tr></table>
                          <p style="margin:0 0 4px;color:#1A1512;font-weight:bold">{{company_name}}</p>
                          <p style="margin:0 0 10px"><a href="mailto:{{support_email}}" style="color:#68625E!important;text-decoration:underline!important">{{support_email}}</a></p>
                          <p style="margin:0 0 4px">{{copyright}}</p>
                          <p style="margin:0">You're receiving this email because of activity on your {{company_name}} account.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """;

    private String renderEmail(
            String subject,
            String preheader,
            String heroIcon,
            String heroLabel,
            String heroTitle,
            String heroSubcopy,
            String bodyContentHtml
    ) {
        String baseUrl = normalizeBaseUrl(frontendUrl);

        // Only the website link is shown. Help center, Privacy and Terms pages don't exist in the app yet.
        String websiteLink = footerLink("Open " + BRAND_NAME, baseUrl);

        String copyright = "© " + Year.now().getValue() + " " + BRAND_NAME + ". All rights reserved.";

        Map<String, String> values = new LinkedHashMap<>();
        values.put("subject", escapeHtml(subject));
        values.put("preheader", escapeHtml(preheader));
        values.put("website_url", escapeAttribute(requireHttpUrl(baseUrl)));
        values.put("brand", escapeHtml(BRAND_NAME));
        values.put("font_text", FONT_TEXT);
        values.put("font_display", FONT_DISPLAY);
        values.put("hero_icon", escapeHtml(heroIcon));
        values.put("hero_label", escapeHtml(heroLabel));
        values.put("hero_title", preserveLineBreaks(heroTitle));
        values.put("hero_subcopy", escapeHtml(heroSubcopy));
        values.put("body_content", bodyContentHtml);
        values.put("support_email", escapeAttribute(replyToEmail));
        values.put("website_link", websiteLink);
        values.put("company_name", escapeHtml(BRAND_NAME));
        values.put("copyright", escapeHtml(copyright));
        return fill(EMAIL_SHELL, values);
    }

    /** Fills every {{name}} in one pass, so text that was inserted (a user's name, say) is never searched again. */
    private static String fill(String template, Map<String, String> values) {
        Matcher m = PLACEHOLDER.matcher(template);
        StringBuilder out = new StringBuilder(template.length() + 4096);
        while (m.find()) {
            String value = values.get(m.group(1));
            m.appendReplacement(out, Matcher.quoteReplacement(value != null ? value : m.group()));
        }
        m.appendTail(out);
        return out.toString();
    }

    @Async("emailExecutor")
    public void sendWelcomeEmail(String toEmail, String name, String verificationLink) {
        String safeName = displayName(name);
        String subject = "Welcome to " + BRAND_NAME + ", " + safeName + "!";

        String features = """
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px">
                  <tr>
                    <td class="feature" width="50%%" valign="top" style="padding:0 7px 14px 0">
                      %s
                    </td>
                    <td class="feature" width="50%%" valign="top" style="padding:0 0 14px 7px">
                      %s
                    </td>
                  </tr>
                  <tr>
                    <td class="feature" width="50%%" valign="top" style="padding:0 7px 0 0">
                      %s
                    </td>
                    <td class="feature" width="50%%" valign="top" style="padding:0 0 0 7px">
                      %s
                    </td>
                  </tr>
                </table>
                """.formatted(
                feature("01", "Smart calorie tracking", "Search thousands of foods or snap a photo of your meal."),
                feature("02", "Workouts that fit you", "Plans, sets and reps with step-by-step exercise guides."),
                feature("03", "Eat and burn in balance", "See what you've eaten, what you've burned, and what's left for the day."),
                feature("04", "Stay on track", "Daily nudges tell you how much to eat or burn, at the time you choose.")
        );

        String body = paragraph("Hi " + safeName + ", your account is ready. Verify your email to secure it, then complete your profile to get a daily calorie target built for your goal.")
                + button("Verify email", verificationLink)
                + note("This link expires in 24 hours. You can start using " + BRAND_NAME + " right away.")
                + smallLead("Everything in one place")
                + features
                + callout("One simple rule: eat and move in balance.", "Your daily target adjusts to what you eat and what you burn.")
                + fallbackLink(verificationLink);

        String html = renderEmail(
                subject,
                "Your account is ready. Verify your email to get started.",
                "✓",
                "Welcome to " + BRAND_NAME,
                "Your goals,\nmade measurable.",
                "Track your meals, train smarter, and see your progress every day.",
                body
        );
        sendEmail(toEmail, subject, html);
    }

    @Async("emailExecutor")
    public void sendVerificationEmail(String toEmail, String name, String verificationLink) {
        String safeName = displayName(name);
        String subject = "Verify your " + BRAND_NAME + " email";
        String body = paragraph("Hi " + safeName + ", please confirm your email address to secure your account and receive account updates.")
                + button("Verify email", verificationLink)
                + note("This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.")
                + fallbackLink(verificationLink);

        sendEmail(toEmail, subject, renderEmail(subject,
                "Verify your email to secure your account.", "✓", "Verify your email",
                "One click to\nsecure your account.",
                "Confirm your email address so we can reach you about your account.", body));
    }

    @Async("emailExecutor")
    public void sendPasswordResetEmail(String toEmail, String name, String resetLink) {
        String safeName = displayName(name);
        String subject = "Reset your " + BRAND_NAME + " password";
        String body = paragraph("Hi " + safeName + ", we received a request to reset your " + BRAND_NAME + " password.")
                + button("Reset password", resetLink)
                + note("This secure link expires in 30 minutes. If you didn't request this, ignore this email, and your password will stay unchanged.")
                + fallbackLink(resetLink);

        sendEmail(toEmail, subject, renderEmail(subject,
                "Reset your password. This link expires in 30 minutes.", "●", "Password reset",
                "Let's get you\nback on track.",
                "Choose a new password to get back to your training and meal log.", body));
    }

    @Async("emailExecutor")
    public void sendPasswordChangedEmail(String toEmail, String name) {
        String safeName = displayName(name);
        String subject = "Your " + BRAND_NAME + " password was changed";

        String body = paragraph("Hi " + safeName + ", this confirms that the password on your " + BRAND_NAME
                + " account was just changed. For your security, you've been signed out of all devices.")
                + noteHtml("If you didn't make this change, reset your password right away and contact support at " + supportLink() + ".");

        sendEmail(toEmail, subject, renderEmail(subject,
                "Your password was changed. Didn't do this? Contact support.", "✓", "Password changed",
                "Your password\nwas updated.",
                "You can now sign in with your new password.", body));
    }

    @Async("emailExecutor")
    public void sendAccountDeletedEmail(String toEmail, String name) {
        String safeName = displayName(name);
        String subject = "Your " + BRAND_NAME + " account has been deleted";

        String body = paragraph("Hi " + safeName + ", this confirms that your " + BRAND_NAME + " account and its data have been deleted as requested.")
                + noteHtml("If you didn't request this change, contact our support team immediately at " + supportLink() + ".");

        sendEmail(toEmail, subject, renderEmail(subject,
                "Your account has been deleted.", "×", "Account deleted",
                "Your account has\nbeen removed.",
                "This is confirmation that your request has been completed.", body));
    }

    private void sendEmail(String toEmail, String subject, String htmlBody) {
        String safeRecipient = requireEmail(toEmail);
        String safeSubject = safeSingleLine(subject, BRAND_NAME + " notification");

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("sender", Map.of("email", senderEmail, "name", senderName));
        requestBody.put("replyTo", Map.of("email", replyToEmail));
        requestBody.put("to", List.of(Map.of("email", safeRecipient)));
        requestBody.put("subject", safeSubject);
        requestBody.put("htmlContent", htmlBody);

        try {
            int status = client.post()
                    .uri("/smtp/email")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .toBodilessEntity()
                    .getStatusCode()
                    .value();
            log.info("Brevo accepted email for {} with status {}", maskEmail(safeRecipient), status);
        } catch (RestClientResponseException exception) {
            log.error("Brevo rejected email for {} with status {}: {}",
                    maskEmail(safeRecipient), exception.getStatusCode().value(), exception.getResponseBodyAsString());
        } catch (Exception exception) {
            log.error("Could not send email to {}", maskEmail(safeRecipient), exception);
        }
    }

    // ---------------------------------------------------------------- building blocks

    private String supportLink() {
        return "<a href=\"mailto:" + escapeAttribute(replyToEmail)
                + "\" style=\"color:" + ORANGE_TEXT + "!important;font-weight:bold;text-decoration:none!important\">"
                + escapeHtml(replyToEmail) + "</a>";
    }

    private static String paragraph(String text) {
        return "<p style=\"margin:0 0 22px;color:" + BODY_TEXT + ";font-size:16px;line-height:26px;font-family:" + FONT_TEXT + "\">"
                + escapeHtml(text) + "</p>";
    }

    private static String button(String label, String url) {
        String safeUrl = escapeAttribute(requireHttpUrl(url));
        String safeLabel = escapeHtml(label);
        return "<table role=\"presentation\" class=\"button-table\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:30px 0\">"
                + "<tr><td align=\"center\">"
                + "<!--[if mso]>"
                + "<v:rect xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:w=\"urn:schemas-microsoft-com:office:word\" href=\"" + safeUrl
                + "\" style=\"height:50px;v-text-anchor:middle;width:260px;\" strokecolor=\"" + ORANGE + "\" fillcolor=\"" + ORANGE + "\">"
                + "<w:anchorlock/>"
                + "<center style=\"color:" + ON_ORANGE + ";font-family:Arial,sans-serif;font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;\">" + safeLabel + "</center>"
                + "</v:rect>"
                + "<![endif]-->"
                + "<!--[if !mso]><!-->"
                + "<a class=\"button button-link\" href=\"" + safeUrl + "\" target=\"_blank\" style=\"display:inline-block;padding:17px 36px;background:" + ORANGE
                + ";color:" + ON_ORANGE + ";font-size:14px;line-height:18px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;text-align:center;font-family:" + FONT_TEXT
                + ";text-decoration:none\">" + safeLabel + "&nbsp;&nbsp;→</a>"
                + "<!--<![endif]-->"
                + "</td></tr></table>";
    }

    private static String feature(String number, String title, String copy) {
        return "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"border-top:1px solid " + BORDER + "\">"
                + "<tr><td style=\"padding:18px 0\">"
                + "<p style=\"margin:0 0 8px;color:" + ORANGE_TEXT + ";font-size:18px;line-height:20px;letter-spacing:1px;font-family:" + FONT_DISPLAY + "\">" + escapeHtml(number) + "</p>"
                + "<p style=\"margin:0 0 6px;color:" + INK + ";font-size:16px;line-height:22px;font-weight:bold;font-family:" + FONT_TEXT + "\">" + escapeHtml(title) + "</p>"
                + "<p style=\"margin:0;color:" + MUTED + ";font-size:14px;line-height:21px;font-family:" + FONT_TEXT + "\">" + escapeHtml(copy) + "</p>"
                + "</td></tr></table>";
    }

    private static String smallLead(String text) {
        return "<p style=\"margin:36px 0 8px;color:" + INK + ";font-size:24px;line-height:28px;font-weight:normal;text-transform:uppercase;letter-spacing:0.3px;font-family:" + FONT_DISPLAY + "\">"
                + escapeHtml(text) + "</p>";
    }

    private static String callout(String title, String copyHtml) {
        return "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:0 0 26px;background:" + ORANGE_TINT + ";border-left:4px solid " + ORANGE + "\">"
                + "<tr><td style=\"padding:18px 22px\">"
                + "<p style=\"margin:0 0 6px;color:" + INK + ";font-size:16px;line-height:23px;font-weight:bold;font-family:" + FONT_TEXT + "\">" + escapeHtml(title) + "</p>"
                + "<p style=\"margin:0;color:" + MUTED + ";font-size:14px;line-height:22px;font-family:" + FONT_TEXT + "\">" + copyHtml + "</p>"
                + "</td></tr></table>";
    }

    private static String note(String text) {
        return noteHtml(escapeHtml(text));
    }

    private static String noteHtml(String html) {
        return "<p style=\"margin:24px 0 0;padding-top:22px;border-top:1px solid " + BORDER + ";color:" + MUTED + ";font-size:13px;line-height:21px;font-family:" + FONT_TEXT + "\">"
                + html + "</p>";
    }

    private static String fallbackLink(String url) {
        String safeUrl = escapeAttribute(requireHttpUrl(url));
        return "<p style=\"margin:24px 0 0;color:#8B857F;font-size:12px;line-height:19px;word-break:break-all;font-family:" + FONT_TEXT + "\">Button not working? Copy this link:<br><a href=\""
                + safeUrl + "\" style=\"color:" + ORANGE_TEXT + "!important;text-decoration:underline!important\">" + safeUrl + "</a></p>";
    }

    private static String footerLink(String label, String url) {
        return "<a class=\"footer-link\" href=\"" + escapeAttribute(requireHttpUrl(url))
                + "\" target=\"_blank\" style=\"color:" + ORANGE_TEXT + "!important;font-weight:bold;text-decoration:underline;font-family:" + FONT_TEXT + "\">"
                + escapeHtml(label) + "</a>";
    }

    // ---------------------------------------------------------------- helpers

    private static String displayName(String value) {
        return safeSingleLine(value, "there");
    }

    private static String safeSingleLine(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        String cleaned = value.replaceAll("[\\r\\n\\t]+", " ").trim();
        return cleaned.length() > 140 ? cleaned.substring(0, 140) : cleaned;
    }

    private static String requireEmail(String email) {
        String cleaned = safeSingleLine(email, "");
        if (!cleaned.matches("^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new IllegalArgumentException("Invalid recipient email address");
        }
        return cleaned;
    }

    private static String requireHttpUrl(String value) {
        try {
            URI uri = URI.create(value == null ? "" : value.trim());
            String scheme = uri.getScheme();
            if (uri.getHost() == null || !("https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme))) {
                throw new IllegalArgumentException("Email links must use an absolute HTTP(S) URL");
            }
            return uri.toASCIIString();
        } catch (RuntimeException exception) {
            throw new IllegalArgumentException("Invalid email URL", exception);
        }
    }

    private static String normalizeBaseUrl(String value) {
        String url = requireHttpUrl(value);
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    private static String preserveLineBreaks(String value) {
        return escapeHtml(value == null ? "" : value).replace("\r\n", "<br>").replace("\n", "<br>");
    }

    private static String escapeAttribute(String value) {
        return escapeHtml(value).replace("`", "&#96;");
    }

    private static String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private static String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 1) {
            return "***" + email.substring(Math.max(0, at));
        }
        return email.charAt(0) + "***" + email.substring(at);
    }
}