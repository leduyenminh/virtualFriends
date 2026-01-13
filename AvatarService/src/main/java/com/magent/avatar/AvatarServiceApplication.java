package com.magent.avatar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AvatarServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AvatarServiceApplication.class, args);
    }
}
