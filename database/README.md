# TAMV Database

## Overview

TAMV uses PostgreSQL as its primary database. This directory contains database schemas, migrations, and seed data.

## Structure

```
database/
├── migrations/     # Database migration files
├── seeds/         # Seed data for development and testing
└── README.md      # This file
```

## Database Schema

### Tables

#### users

Stores user account information.

| Column        | Type         | Constraints              | Description                        |
| ------------- | ------------ | ------------------------ | ---------------------------------- |
| id            | UUID         | PRIMARY KEY              | User unique identifier             |
| email         | VARCHAR(255) | UNIQUE, NOT NULL         | User email address                 |
| username      | VARCHAR(30)  | UNIQUE, NOT NULL         | User username                      |
| password_hash | VARCHAR(255) | NOT NULL                 | Bcrypt password hash               |
| role          | ENUM         | NOT NULL, DEFAULT 'user' | User role (user, moderator, admin) |
| display_name  | VARCHAR(100) |                          | Display name                       |
| avatar        | VARCHAR(500) |                          | Avatar URL                         |
| bio           | TEXT         |                          | User biography                     |
| location      | VARCHAR(100) |                          | User location                      |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW()  | Account creation timestamp         |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW()  | Last update timestamp              |
| last_login_at | TIMESTAMP    |                          | Last login timestamp               |

#### posts

Stores social wall posts.

| Column        | Type      | Constraints                      | Description                                |
| ------------- | --------- | -------------------------------- | ------------------------------------------ |
| id            | UUID      | PRIMARY KEY                      | Post unique identifier                     |
| author_id     | UUID      | FOREIGN KEY → users.id, NOT NULL | Post author                                |
| content       | TEXT      | NOT NULL                         | Post content                               |
| media_urls    | JSONB     |                                  | Array of media URLs                        |
| visibility    | ENUM      | NOT NULL, DEFAULT 'public'       | Post visibility (public, friends, private) |
| like_count    | INTEGER   | NOT NULL, DEFAULT 0              | Number of likes                            |
| comment_count | INTEGER   | NOT NULL, DEFAULT 0              | Number of comments                         |
| created_at    | TIMESTAMP | NOT NULL, DEFAULT NOW()          | Post creation timestamp                    |
| updated_at    | TIMESTAMP | NOT NULL, DEFAULT NOW()          | Last update timestamp                      |
| deleted_at    | TIMESTAMP |                                  | Soft delete timestamp                      |

#### comments

Stores comments on posts.

| Column            | Type      | Constraints                      | Description                          |
| ----------------- | --------- | -------------------------------- | ------------------------------------ |
| id                | UUID      | PRIMARY KEY                      | Comment unique identifier            |
| post_id           | UUID      | FOREIGN KEY → posts.id, NOT NULL | Parent post                          |
| author_id         | UUID      | FOREIGN KEY → users.id, NOT NULL | Comment author                       |
| parent_comment_id | UUID      | FOREIGN KEY → comments.id        | Parent comment (for nested comments) |
| content           | TEXT      | NOT NULL                         | Comment content                      |
| created_at        | TIMESTAMP | NOT NULL, DEFAULT NOW()          | Comment creation timestamp           |
| updated_at        | TIMESTAMP | NOT NULL, DEFAULT NOW()          | Last update timestamp                |
| deleted_at        | TIMESTAMP |                                  | Soft delete timestamp                |

#### likes

Stores post likes.

| Column     | Type      | Constraints                      | Description            |
| ---------- | --------- | -------------------------------- | ---------------------- |
| id         | UUID      | PRIMARY KEY                      | Like unique identifier |
| user_id    | UUID      | FOREIGN KEY → users.id, NOT NULL | User who liked         |
| post_id    | UUID      | FOREIGN KEY → posts.id, NOT NULL | Liked post             |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW()          | Like timestamp         |

**Unique constraint**: (user_id, post_id) - prevents duplicate likes

#### sessions

Stores user sessions for JWT token management.

| Column     | Type         | Constraints                      | Description                |
| ---------- | ------------ | -------------------------------- | -------------------------- |
| id         | UUID         | PRIMARY KEY                      | Session unique identifier  |
| user_id    | UUID         | FOREIGN KEY → users.id, NOT NULL | Session owner              |
| token_hash | VARCHAR(255) | NOT NULL                         | Hashed JWT token           |
| expires_at | TIMESTAMP    | NOT NULL                         | Session expiration         |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW()          | Session creation timestamp |

### Indexes

- **users**: email, username
- **posts**: author_id, created_at, visibility
- **comments**: post_id, author_id, parent_comment_id
- **likes**: user_id, post_id
- **sessions**: user_id, token_hash, expires_at

## Migrations

Migrations are versioned database schema changes. Each migration includes:

- **Up migration**: Applies the change
- **Down migration**: Reverts the change

### Running Migrations

```bash
# Run all pending migrations
npm run db:migrate

# Rollback last migration
npm run db:migrate:rollback

# Check migration status
npm run db:migrate:status
```

### Creating a New Migration

```bash
npm run db:migrate:create <migration-name>
```

## Seed Data

Seed data is used for development and testing. It includes:

- Sample users
- Sample posts
- Sample comments
- Sample likes

### Running Seeds

```bash
# Run all seeds
npm run db:seed

# Run specific seed
npm run db:seed:run <seed-name>
```

## Connection Configuration

Database connection is configured via environment variables:

```env
DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_SSL=true
```

## Backup and Restore

### Backup

```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore

```bash
psql $DATABASE_URL < backup.sql
```

## Performance Considerations

- All foreign keys have indexes
- Frequently queried columns have indexes
- Use connection pooling (configured in backend)
- Soft deletes allow data recovery without performance impact

## Security

- All passwords are hashed with bcrypt
- JWT tokens are hashed before storage
- Use parameterized queries to prevent SQL injection
- Database credentials stored in environment variables
- SSL/TLS encryption for production connections
