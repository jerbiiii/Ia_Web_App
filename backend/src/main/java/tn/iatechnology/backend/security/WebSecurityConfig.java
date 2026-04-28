package tn.iatechnology.backend.security;

import tn.iatechnology.backend.security.jwt.AuthEntryPointJwt;
import tn.iatechnology.backend.security.jwt.AuthTokenFilter;
import tn.iatechnology.backend.security.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://localhost:4200}")
    private String allowedOriginsRaw;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig)
            throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> allowedOrigins = Arrays.asList(allowedOriginsRaw.split(","));

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // CSRF activé avec configuration optimisée pour SPA (React)
                .csrf(csrf -> {
                    CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
                    requestHandler.setCsrfRequestAttributeName(null);
                    csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                            .csrfTokenRequestHandler(requestHandler);
                })

                .headers(headers -> {
                    headers.xssProtection(
                            xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK));
                    headers.frameOptions(frame -> frame.deny());
                    headers.contentTypeOptions(contentType -> {
                    });
                    headers.httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000));
                    headers.referrerPolicy(referrer -> referrer.policy(
                            org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN));
                    headers.permissionsPolicy(
                            permissions -> permissions.policy("camera=(), microphone=(), geolocation=(), payment=()"));
                    headers.contentSecurityPolicy(csp -> csp.policyDirectives(
                            "default-src 'self'; " +
                                    "script-src 'self'; " +
                                    "style-src 'self' 'unsafe-inline'; " +
                                    "img-src 'self' data: https:; " +
                                    "font-src 'self' data:; " +
                                    "connect-src 'self' http://localhost:8080 http://localhost:5000; " +
                                    "frame-ancestors 'none'; " +
                                    "form-action 'self'; "));
                })

                .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedHandler))

                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // ── Public Access ──────────────────────────────────────────
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**")
                        .permitAll()
                        .requestMatchers("/api/auth/signin", "/api/auth/signup").permitAll()
                        .requestMatchers("/api/public/**", "/error").permitAll()

                        .anyRequest().authenticated());

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(
                authenticationJwtTokenFilter(),
                UsernamePasswordAuthenticationFilter.class);

        http.addFilterAfter(new org.springframework.web.filter.OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(jakarta.servlet.http.HttpServletRequest request,
                    jakarta.servlet.http.HttpServletResponse response,
                    jakarta.servlet.FilterChain filterChain)
                    throws jakarta.servlet.ServletException, java.io.IOException {
                org.springframework.security.web.csrf.CsrfToken csrfToken = (org.springframework.security.web.csrf.CsrfToken) request
                        .getAttribute(org.springframework.security.web.csrf.CsrfToken.class.getName());
                if (null != csrfToken && null != csrfToken.getHeaderName()) {
                    response.setHeader(csrfToken.getHeaderName(), csrfToken.getToken());
                }
                filterChain.doFilter(request, response);
            }
        }, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}