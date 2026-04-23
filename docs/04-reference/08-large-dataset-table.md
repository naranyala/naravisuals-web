---
title: Large Dataset Table Reference
description: A reference page demonstrating the handling of large dataset tables with horizontal scrolling.
sidebar_position: 8
tags: [table, reference, ui]
---

# Large Dataset Table Reference

This page demonstrates the handling of large datasets within the documentation. The table below contains a significant amount of data to test horizontal scrolling and vertical rendering.

## API Endpoint Specifications

| Endpoint | Method | Description | Request Parameters | Response Type | Rate Limit | Status | Example Request | Example Response | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/users` | `GET` | Retrieves a paginated list of users. | `page`, `limit`, `filter`, `sort` | `UserListResponse` | 100 req/min | Stable | `GET /api/v1/users?page=1&limit=20` | `{"users": [...], "total": 100}` | Use `filter` for advanced search. |
| `/api/v1/users/{id}` | `GET` | Retrieves detailed information for a specific user. | `id` (path) | `UserDetailResponse` | 200 req/min | Stable | `GET /api/v1/users/123` | `{"id": "123", "name": "John Doe", ...}` | Returns 404 if user not found. |
| `/api/v1/users` | `POST` | Creates a new user account. | `username`, `email`, `password` | `UserCreateResponse` | 10 req/min | Stable | `POST /api/v1/users { "username": "newuser", ... }` | `{"id": "456", "status": "created"}` | Password must be at least 8 characters. |
| `/api/v1/users/{id}` | `PUT` | Updates user profile information. | `id` (path), `name`, `bio`, `avatar` | `UserUpdateResponse` | 50 req/min | Stable | `PUT /api/v1/users/123 { "bio": "Updated bio" }` | `{"id": "123", "updated": true}` | Partial updates are supported. |
| `/api/v1/users/{id}` | `DELETE` | Deletes a user account permanently. | `id` (path) | `DeleteResponse` | 5 req/min | Deprecated | `DELETE /api/v1/users/123` | `{"status": "deleted"}` | Use `/api/v1/users/{id}/deactivate` instead. |
| `/api/v1/auth/login` | `POST` | Authenticates user and returns a JWT token. | `username`, `password` | `AuthResponse` | 30 req/min | Stable | `POST /api/v1/auth/login { "username": "...", "password": "..." }` | `{"token": "eyJhbG...", "expires_in": 3600}` | Token expires in 1 hour. |
| `/api/v1/auth/logout` | `POST` | Invalidates the current session token. | `token` (header) | `LogoutResponse` | 100 req/min | Stable | `POST /api/v1/auth/logout` | `{"status": "logged_out"}` | Requires valid Authorization header. |
| `/api/v1/auth/refresh` | `POST` | Refreshes an expired JWT token using a refresh token. | `refresh_token` | `AuthResponse` | 20 req/min | Stable | `POST /api/v1/auth/refresh { "refresh_token": "..." }` | `{"token": "...", "expires_in": 3600}` | Refresh tokens last for 30 days. |
| `/api/v1/posts` | `GET` | Lists all blog posts with pagination. | `page`, `limit`, `category`, `tags` | `PostListResponse` | 150 req/min | Stable | `GET /api/v1/posts?category=tech` | `{"posts": [...], "total": 500}` | Supports tag-based filtering. |
| `/api/v1/posts` | `POST` | Creates a new blog post. | `title`, `content`, `category`, `tags` | `PostCreateResponse` | 20 req/min | Stable | `POST /api/v1/posts { "title": "Hello", ... }` | `{"id": "post_1", "url": "/posts/hello"}` | Content must be in Markdown format. |
| `/api/v1/posts/{id}` | `GET` | Retrieves a single blog post by ID. | `id` (path) | `PostDetailResponse` | 300 req/min | Stable | `GET /api/v1/posts/post_1` | `{"id": "post_1", "title": "...", ...}` | Returns 404 if post not found. |
| `/api/v1/posts/{id}` | `PATCH` | Partially updates a blog post. | `id` (path), `title?`, `content?` | `PostUpdateResponse` | 40 req/min | Stable | `PATCH /api/v1/posts/post_1 { "title": "New Title" }` | `{"id": "post_1", "updated": true}` | Use PATCH for partial updates. |
| `/api/v1/posts/{id}` | `DELETE` | Deletes a blog post. | `id` (path) | `DeleteResponse` | 10 req/min | Stable | `DELETE /api/v1/posts/post_1` | `{"status": "deleted"}` | Only the author or admin can delete. |
| `/api/v1/comments` | `GET` | Retrieves comments for a specific post. | `post_id`, `page`, `limit` | `CommentListResponse` | 200 req/min | Stable | `GET /api/v1/comments?post_id=post_1` | `{"comments": [...], "total": 50}` | Supports threading. |
| `/api/v1/comments` | `POST` | Adds a comment to a post. | `post_id`, `content`, `parent_id?` | `CommentCreateResponse` | 30 req/min | Stable | `POST /api/v1/comments { "post_id": "post_1", ... }` | `{"id": "comm_1", "text": "..."}` | Requires authentication. |
| `/api/v1/comments/{id}` | `DELETE` | Deletes a comment. | `id` (path) | `DeleteResponse` | 20 req/min | Stable | `DELETE /api/v1/comments/comm_1` | `{"status": "deleted"}` | Requires authentication. |
| `/api/v1/search` | `GET` | Global search across users, posts, and comments. | `q`, `type`, `limit` | `SearchResponse` | 50 req/min | Beta | `GET /api/v1/search?q=react` | `{"results": [...], "total": 120}` | Uses Elasticsearch. |
| `/api/v1/settings` | `GET` | Retrieves global system settings. | None | `SettingsResponse` | 10 req/min | Stable | `GET /api/v1/settings` | `{"maintenance": false, "version": "1.0.1"}` | Read-only for most users. |
| `/api/v1/settings` | `PUT` | Updates global system settings. | `maintenance`, `version`, `announcement` | `SettingsUpdateResponse` | 1 req/min | Stable | `PUT /api/v1/settings { "maintenance": true }` | `{"updated": true}` | Admin only. |
| `/api/v1/metrics` | `GET` | Retrieves system health and performance metrics. | `interval` | `MetricsResponse` | 5 req/min | Beta | `GET /api/v1/metrics?interval=1h` | `{"cpu": 12, "mem": 45, "requests": 10000}` | Internal use only. |
