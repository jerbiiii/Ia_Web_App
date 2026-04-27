package tn.iatechnology.backend.security;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

/**
 * Simple in-memory rate limiter to prevent brute-force attacks on login.
 */
@Component
public class LoginRateLimiter {

    private final int MAX_ATTEMPTS = 5;
    private final int LOCK_TIME_MINUTES = 15;

    // Map of email -> attempts count
    private final Map<String, Integer> attemptsCache = new ConcurrentHashMap<>();
    // Map of email -> lock expiration time
    private final Map<String, LocalDateTime> lockCache = new ConcurrentHashMap<>();

    public boolean isBlocked(String email) {
        if (lockCache.containsKey(email)) {
            if (lockCache.get(email).isBefore(LocalDateTime.now())) {
                lockCache.remove(email);
                attemptsCache.remove(email);
                return false;
            }
            return true;
        }
        return false;
    }

    public void loginSucceeded(String email) {
        attemptsCache.remove(email);
        lockCache.remove(email);
    }

    public void loginFailed(String email) {
        int attempts = attemptsCache.getOrDefault(email, 0) + 1;
        attemptsCache.put(email, attempts);

        if (attempts >= MAX_ATTEMPTS) {
            lockCache.put(email, LocalDateTime.now().plusMinutes(LOCK_TIME_MINUTES));
        }
    }
}