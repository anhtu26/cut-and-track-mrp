---
description: Auth issues
---

1. Use Argon2 to hash password.
2. Save hash password to database instead of password.
3. Keep track of server's package.json and root folder package.json.
4. Replace supabase with local API instead of being a supabase replication.
5. Auth with JWT & middleware.
6. Keep it simple, only need user's email (no verification needed) and password (then hash with argon2 and save).
7. Seed script use "admin" but database use "Administrator"