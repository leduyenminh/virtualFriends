package com.magent.auth.controller;

import com.magent.auth.model.JwtResponse;
import com.magent.auth.model.GuestLoginRequest;
import com.magent.auth.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JwtUtil jwtUtil;

    public AuthController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/guest")
    public ResponseEntity<JwtResponse> guestLogin(@RequestBody GuestLoginRequest req) {
        String token = jwtUtil.generateGuestToken();
        return ResponseEntity.ok(new JwtResponse(token, "GUEST"));
    }

    @GetMapping("/me")
    public ResponseEntity<Object> me(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Missing Authorization header");
        }
        String token = auth.substring(7);
        Claims claims = jwtUtil.parseToken(token);
        return ResponseEntity.ok(claims);
    }
}
