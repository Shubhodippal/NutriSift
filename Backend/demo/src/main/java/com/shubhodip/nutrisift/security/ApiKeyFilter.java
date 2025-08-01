package com.shubhodip.nutrisift.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class ApiKeyFilter extends OncePerRequestFilter {

    @Value("${api.key}")
    private String apiKey;

    @Value("${api.header.name}")
    private String apiKeyHeaderName;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, 
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        
        String requestApiKey = request.getHeader(apiKeyHeaderName);
        
        if (requestApiKey == null || !requestApiKey.equals(apiKey)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"error\": \"Unauthorized: Invalid or missing API key\"}");
            return;
        }
        
        filterChain.doFilter(request, response);
    }
}