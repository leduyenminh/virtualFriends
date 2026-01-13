package com.magent.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.security.Key;

@Component
public class JwtGatewayFilter implements WebFilter {

    @Value("${jwt.secret:changeme}")
    private String secret;

    private Key key;

    @PostConstruct
    public void init() {
        key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String auth = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            try {
                Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
                String subject = claims.getSubject();
                String role = claims.get("role", String.class);

                ServerHttpRequest request = exchange.getRequest().mutate()
                        .header("X-User-Subject", subject == null ? "" : subject)
                        .header("X-User-Role", role == null ? "" : role)
                        .build();

                return chain.filter(exchange.mutate().request(request).build());
            } catch (Exception e) {
                // invalid token - continue without headers
            }
        }
        return chain.filter(exchange);
    }
}
