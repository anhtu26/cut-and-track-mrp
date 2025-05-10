PS C:\Users\anhtu\Documents\CodingProject\cut-and-track-mrp\local> npx supabase link 
Selected project: xydntmjbpdzcyjdumnrg
Enter your database password (or leave blank to skip): 
Connecting to remote database...
NOTICE (42P06): schema "supabase_migrations" already exists, skipping
NOTICE (42P07): relation "schema_migrations" already exists, skipping
NOTICE (42701): column "statements" of relation "schema_migrations" already exists, skipping
NOTICE (42701): column "name" of relation "schema_migrations" already exists, skipping
NOTICE (42P06): schema "supabase_migrations" already exists, skipping
NOTICE (42P07): relation "seed_files" already exists, skipping
Finished supabase link.
WARNING: Local config differs from linked project. Try updating supabase\config.toml
diff supabase\config.toml xydntmjbpdzcyjdumnrg
--- supabase\config.toml
+++ xydntmjbpdzcyjdumnrg
@@ -53,8 +53,8 @@

 [auth]
 enabled = true
-site_url = "http://127.0.0.1:3000"
-additional_redirect_urls = ["https://127.0.0.1:3000"]
+site_url = "http://localhost:3000"
+additional_redirect_urls = []
 jwt_expiry = 3600
 enable_refresh_token_rotation = true
 refresh_token_reuse_interval = 10
@@ -94,9 +94,9 @@
 [auth.email]
 enable_signup = true
 double_confirm_changes = true
-enable_confirmations = false
+enable_confirmations = true
 secure_password_change = false
-max_frequency = "1s"
+max_frequency = "1m0s"
 otp_length = 6
 otp_expiry = 3600
 [auth.email.template]