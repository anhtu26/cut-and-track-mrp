

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."admin_create_user"("admin_user_id" "uuid", "new_email" "text", "new_password" "text", "new_first_name" "text", "new_last_name" "text", "new_department" "text", "new_job_title" "text", "new_role_id" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  is_admin BOOLEAN;
  new_user_id UUID;
  default_role_id UUID;
BEGIN
  -- Check if calling user is an admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = admin_user_id AND r.name = 'Admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'User % is not an administrator', admin_user_id;
  END IF;
  
  -- Create user in auth.users (requires superuser, which this function has as SECURITY DEFINER)
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
  VALUES (
    new_email, 
    crypt(new_password, gen_salt('bf')), 
    now()
  )
  RETURNING id INTO new_user_id;
  
  -- Create profile entry
  INSERT INTO public.profiles (id, first_name, last_name, department, job_title)
  VALUES (new_user_id, new_first_name, new_last_name, new_department, new_job_title);
  
  -- Assign role to user
  IF new_role_id IS NULL THEN
    -- Find a default role (Staff) if none specified
    SELECT id INTO default_role_id FROM roles WHERE name = 'Staff' LIMIT 1;
    
    -- If no Staff role found, try to find any non-admin role
    IF default_role_id IS NULL THEN
      SELECT id INTO default_role_id FROM roles WHERE name != 'Admin' LIMIT 1;
    END IF;
    
    -- If still null, use any available role
    IF default_role_id IS NULL THEN
      SELECT id INTO default_role_id FROM roles LIMIT 1;
    END IF;
    
    -- Insert the user role
    IF default_role_id IS NOT NULL THEN
      INSERT INTO user_roles (user_id, role_id)
      VALUES (new_user_id, default_role_id);
    END IF;
  ELSE
    -- Insert the specified role
    INSERT INTO user_roles (user_id, role_id)
    VALUES (new_user_id, new_role_id);
  END IF;
  
  RETURN new_user_id;
END;
$$;


ALTER FUNCTION "public"."admin_create_user"("admin_user_id" "uuid", "new_email" "text", "new_password" "text", "new_first_name" "text", "new_last_name" "text", "new_department" "text", "new_job_title" "text", "new_role_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_profile_for_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_profile_for_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_default_roles"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  admin_role_id UUID;
BEGIN
  -- Check if Admin role exists
  IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'Admin') THEN
    INSERT INTO public.roles (name, description) VALUES ('Admin', 'Full system access')
    RETURNING id INTO admin_role_id;
  ELSE
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'Admin';
  END IF;
  
  -- Check if Manager role exists
  IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'Manager') THEN
    INSERT INTO public.roles (name, description) VALUES ('Manager', 'Can manage users and workflows');
  END IF;
  
  -- Check if Staff role exists
  IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'Staff') THEN
    INSERT INTO public.roles (name, description) VALUES ('Staff', 'Regular staff member');
  END IF;
  
  -- Check if Operator role exists
  IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'Operator') THEN
    INSERT INTO public.roles (name, description) VALUES ('Operator', 'Machine operator access');
  END IF;
  
  -- Explicitly using table aliases for all queries involving resource column
  IF EXISTS (SELECT 1 FROM public.permissions p LIMIT 1) THEN
    -- Assign all permissions to Admin role if not already assigned
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT admin_role_id, p.id
    FROM public.permissions p
    WHERE NOT EXISTS (
      SELECT 1 
      FROM public.role_permissions rp 
      WHERE rp.role_id = admin_role_id AND rp.permission_id = p.id
    );
  END IF;
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in ensure_default_roles: %', SQLERRM;
  RETURN FALSE;
END;
$$;


ALTER FUNCTION "public"."ensure_default_roles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_role_permissions"("role_id" "uuid") RETURNS TABLE("permission_id" "uuid", "permission_name" "text", "permission_resource" "text", "permission_action" "text", "permission_description" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS permission_id,
    p.name AS permission_name,
    p.resource AS permission_resource,
    p.action AS permission_action,
    p.description AS permission_description
  FROM public.permissions p
  JOIN public.role_permissions rp ON p.id = rp.permission_id
  WHERE rp.role_id = get_role_permissions.role_id;
END;
$$;


ALTER FUNCTION "public"."get_role_permissions"("role_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_manager_of"("manager_uuid" "uuid", "employee_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  is_manager BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = employee_uuid
    AND manager_id = manager_uuid
  ) INTO is_manager;
  
  RETURN is_manager;
END;
$$;


ALTER FUNCTION "public"."is_manager_of"("manager_uuid" "uuid", "employee_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_has_permission"("user_uuid" "uuid", "resource" "text", "action" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  has_perm BOOLEAN;
BEGIN
  -- Check direct role-based permissions
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = user_uuid
    AND p.resource = resource
    AND p.action = action
  ) INTO has_perm;
  
  -- If no direct permission, check group-based permissions
  IF NOT has_perm THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.user_group_members ugm
      JOIN public.group_roles gr ON ugm.group_id = gr.group_id
      JOIN public.role_permissions rp ON gr.role_id = rp.role_id
      JOIN public.permissions p ON rp.permission_id = p.id
      WHERE ugm.user_id = user_uuid
      AND p.resource = resource
      AND p.action = action
    ) INTO has_perm;
  END IF;
  
  RETURN has_perm;
END;
$$;


ALTER FUNCTION "public"."user_has_permission"("user_uuid" "uuid", "resource" "text", "action" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."available_roles_view" AS
 SELECT "r"."id",
    "r"."name",
    "r"."description",
    "r"."created_at",
    "count"("rp"."permission_id") AS "permission_count"
   FROM ("public"."roles" "r"
     LEFT JOIN "public"."role_permissions" "rp" ON (("r"."id" = "rp"."role_id")))
  GROUP BY "r"."id", "r"."name", "r"."description", "r"."created_at";


ALTER TABLE "public"."available_roles_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "company" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "address" "text",
    "notes" "text",
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."group_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."operation_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "operation_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "url" "text" NOT NULL,
    "type" "text" NOT NULL,
    "size" integer,
    "uploaded_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."operation_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."operation_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "part_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "machining_methods" "text",
    "setup_instructions" "text",
    "estimated_duration" integer,
    "sequence" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."operation_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."operations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "work_order_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'Not Started'::"text" NOT NULL,
    "machining_methods" "text",
    "setup_instructions" "text",
    "estimated_start_time" timestamp with time zone,
    "estimated_end_time" timestamp with time zone,
    "actual_start_time" timestamp with time zone,
    "actual_end_time" timestamp with time zone,
    "assigned_to_id" "uuid",
    "comments" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sequence" integer DEFAULT 0 NOT NULL,
    "is_custom" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."operations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."part_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "part_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "url" "text" NOT NULL,
    "type" "text" NOT NULL,
    "uploaded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "size" integer
);


ALTER TABLE "public"."part_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."parts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "part_number" "text" NOT NULL,
    "description" "text",
    "active" boolean DEFAULT true NOT NULL,
    "materials" "text"[] DEFAULT ARRAY[]::"text"[],
    "setup_instructions" "text",
    "machining_methods" "text",
    "revision_number" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "archived" boolean DEFAULT false NOT NULL,
    "archived_at" timestamp with time zone,
    "archive_reason" "text",
    "previous_revision_id" "uuid",
    "customer_id" "uuid"
);


ALTER TABLE "public"."parts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "resource" "text" NOT NULL,
    "action" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."permissions_view" AS
 SELECT "p"."id",
    "p"."name",
    "p"."description",
    "p"."resource",
    "p"."action",
    "p"."created_at"
   FROM "public"."permissions" "p";


ALTER TABLE "public"."permissions_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "job_title" "text",
    "department" "text",
    "manager_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."role_permissions_view" AS
 SELECT "rp"."id",
    "rp"."role_id",
    "rp"."permission_id",
    "rp"."created_at"
   FROM "public"."role_permissions" "rp";


ALTER TABLE "public"."role_permissions_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."roles_with_permissions_view" AS
 SELECT "r"."id" AS "role_id",
    "r"."name" AS "role_name",
    "r"."description" AS "role_description",
    "r"."created_at" AS "role_created_at",
    "p"."id" AS "permission_id",
    "p"."name" AS "permission_name",
    "p"."description" AS "permission_description",
    "p"."resource" AS "permission_resource",
    "p"."action" AS "permission_action",
    "p"."created_at" AS "permission_created_at"
   FROM (("public"."roles" "r"
     LEFT JOIN "public"."role_permissions" "rp" ON (("r"."id" = "rp"."role_id")))
     LEFT JOIN "public"."permissions" "p" ON (("rp"."permission_id" = "p"."id")));


ALTER TABLE "public"."roles_with_permissions_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_group_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_group_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role_id" "uuid" NOT NULL,
    "assigned_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "role" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['Administrator'::"text", 'Manager'::"text", 'Staff'::"text", 'Operator'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "work_order_number" "text" NOT NULL,
    "purchase_order_number" "text",
    "customer_id" "uuid" NOT NULL,
    "part_id" "uuid" NOT NULL,
    "quantity" integer NOT NULL,
    "status" "text" DEFAULT 'Not Started'::"text" NOT NULL,
    "priority" "text" DEFAULT 'Normal'::"text" NOT NULL,
    "start_date" timestamp with time zone,
    "due_date" timestamp with time zone NOT NULL,
    "completed_date" timestamp with time zone,
    "assigned_to_id" "uuid",
    "notes" "text",
    "archived" boolean DEFAULT false NOT NULL,
    "archived_at" timestamp with time zone,
    "archive_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "use_operation_templates" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."work_orders" OWNER TO "postgres";


COMMENT ON COLUMN "public"."work_orders"."use_operation_templates" IS 'Determines whether operations should be created from part templates when creating a work order';



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_roles"
    ADD CONSTRAINT "group_roles_group_id_role_id_key" UNIQUE ("group_id", "role_id");



ALTER TABLE ONLY "public"."group_roles"
    ADD CONSTRAINT "group_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."operation_documents"
    ADD CONSTRAINT "operation_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."operation_templates"
    ADD CONSTRAINT "operation_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."operations"
    ADD CONSTRAINT "operations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."part_documents"
    ADD CONSTRAINT "part_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."parts"
    ADD CONSTRAINT "parts_part_number_key" UNIQUE ("part_number");



ALTER TABLE ONLY "public"."parts"
    ADD CONSTRAINT "parts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_resource_action_key" UNIQUE ("resource", "action");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_permission_id_key" UNIQUE ("role_id", "permission_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_group_members"
    ADD CONSTRAINT "user_group_members_group_id_user_id_key" UNIQUE ("group_id", "user_id");



ALTER TABLE ONLY "public"."user_group_members"
    ADD CONSTRAINT "user_group_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_groups"
    ADD CONSTRAINT "user_groups_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."user_groups"
    ADD CONSTRAINT "user_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_id_key" UNIQUE ("user_id", "role_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."work_orders"
    ADD CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."work_orders"
    ADD CONSTRAINT "work_orders_work_order_number_key" UNIQUE ("work_order_number");



CREATE INDEX "idx_parts_archived" ON "public"."parts" USING "btree" ("archived");



CREATE INDEX "idx_parts_customer_id" ON "public"."parts" USING "btree" ("customer_id");



ALTER TABLE ONLY "public"."operation_documents"
    ADD CONSTRAINT "fk_operation" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_roles"
    ADD CONSTRAINT "group_roles_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."user_groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_roles"
    ADD CONSTRAINT "group_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."operation_documents"
    ADD CONSTRAINT "operation_documents_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("id");



ALTER TABLE ONLY "public"."operation_templates"
    ADD CONSTRAINT "operation_templates_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id");



ALTER TABLE ONLY "public"."operations"
    ADD CONSTRAINT "operations_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id");



ALTER TABLE ONLY "public"."part_documents"
    ADD CONSTRAINT "part_documents_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."parts"
    ADD CONSTRAINT "parts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."parts"
    ADD CONSTRAINT "parts_previous_revision_id_fkey" FOREIGN KEY ("previous_revision_id") REFERENCES "public"."parts"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_group_members"
    ADD CONSTRAINT "user_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."user_groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_group_members"
    ADD CONSTRAINT "user_group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_groups"
    ADD CONSTRAINT "user_groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_orders"
    ADD CONSTRAINT "work_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."work_orders"
    ADD CONSTRAINT "work_orders_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id");



CREATE POLICY "Admins and managers can assign roles" ON "public"."user_roles" USING (("public"."user_has_permission"("auth"."uid"(), 'user_roles'::"text", 'write'::"text") OR "public"."is_manager_of"("auth"."uid"(), "user_id")));



CREATE POLICY "Admins can manage roles" ON "public"."roles" USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("lower"("r"."name") = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("lower"("r"."name") = 'admin'::"text")))));



CREATE POLICY "Admins can modify permissions" ON "public"."permissions" USING ("public"."user_has_permission"("auth"."uid"(), 'permissions'::"text", 'write'::"text"));



CREATE POLICY "Admins can modify roles" ON "public"."roles" USING ("public"."user_has_permission"("auth"."uid"(), 'roles'::"text", 'write'::"text"));



CREATE POLICY "Admins have full access to user_roles" ON "public"."user_roles" USING ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("lower"("r"."name") = 'admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."user_roles" "ur"
     JOIN "public"."roles" "r" ON (("ur"."role_id" = "r"."id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("lower"("r"."name") = 'admin'::"text")))));



CREATE POLICY "Allow anonymous delete on part_documents" ON "public"."part_documents" FOR DELETE USING (true);



CREATE POLICY "Allow anonymous delete on parts" ON "public"."parts" FOR DELETE USING (true);



CREATE POLICY "Allow anonymous insert on part_documents" ON "public"."part_documents" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow anonymous insert on parts" ON "public"."parts" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow anonymous select on part_documents" ON "public"."part_documents" FOR SELECT USING (true);



CREATE POLICY "Allow anonymous select on parts" ON "public"."parts" FOR SELECT USING (true);



CREATE POLICY "Allow anonymous update on part_documents" ON "public"."part_documents" FOR UPDATE USING (true);



CREATE POLICY "Allow anonymous update on parts" ON "public"."parts" FOR UPDATE USING (true);



CREATE POLICY "Allow authenticated users to delete operation documents" ON "public"."operation_documents" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to insert customers" ON "public"."customers" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert operation documents" ON "public"."operation_documents" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to view operation documents" ON "public"."operation_documents" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Anyone can view roles" ON "public"."roles" FOR SELECT USING (true);



CREATE POLICY "Enable delete for authenticated users only" ON "public"."part_documents" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable insert for all users" ON "public"."operations" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for all users" ON "public"."work_orders" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."part_documents" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."parts" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable read access for all users" ON "public"."customers" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."operations" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."part_documents" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."parts" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."work_orders" FOR SELECT USING (true);



CREATE POLICY "Enable update for all users" ON "public"."operations" FOR UPDATE USING (true);



CREATE POLICY "Enable update for all users" ON "public"."work_orders" FOR UPDATE USING (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."parts" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Managers can read and update team profiles" ON "public"."profiles" TO "authenticated" USING (("public"."is_manager_of"("auth"."uid"(), "id") AND (("current_setting"('match.op'::"text") = 'SELECT'::"text") OR ("current_setting"('match.op'::"text") = 'UPDATE'::"text"))));



CREATE POLICY "Users can read permissions" ON "public"."permissions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can read roles" ON "public"."roles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can read their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("id" = "auth"."uid"()) OR "public"."user_has_permission"("auth"."uid"(), 'profiles'::"text", 'read'::"text")));



CREATE POLICY "Users can read their own roles" ON "public"."user_roles" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."user_has_permission"("auth"."uid"(), 'user_roles'::"text", 'read'::"text")));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can view their own roles" ON "public"."user_roles" FOR SELECT USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."operation_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."operations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."part_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."parts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_group_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."work_orders" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."admin_create_user"("admin_user_id" "uuid", "new_email" "text", "new_password" "text", "new_first_name" "text", "new_last_name" "text", "new_department" "text", "new_job_title" "text", "new_role_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_create_user"("admin_user_id" "uuid", "new_email" "text", "new_password" "text", "new_first_name" "text", "new_last_name" "text", "new_department" "text", "new_job_title" "text", "new_role_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_create_user"("admin_user_id" "uuid", "new_email" "text", "new_password" "text", "new_first_name" "text", "new_last_name" "text", "new_department" "text", "new_job_title" "text", "new_role_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_profile_for_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile_for_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile_for_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_default_roles"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_default_roles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_default_roles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_role_permissions"("role_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_role_permissions"("role_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_role_permissions"("role_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_manager_of"("manager_uuid" "uuid", "employee_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_manager_of"("manager_uuid" "uuid", "employee_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_manager_of"("manager_uuid" "uuid", "employee_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_permission"("user_uuid" "uuid", "resource" "text", "action" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_permission"("user_uuid" "uuid", "resource" "text", "action" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_permission"("user_uuid" "uuid", "resource" "text", "action" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."available_roles_view" TO "anon";
GRANT ALL ON TABLE "public"."available_roles_view" TO "authenticated";
GRANT ALL ON TABLE "public"."available_roles_view" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."group_roles" TO "anon";
GRANT ALL ON TABLE "public"."group_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."group_roles" TO "service_role";



GRANT ALL ON TABLE "public"."operation_documents" TO "anon";
GRANT ALL ON TABLE "public"."operation_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."operation_documents" TO "service_role";



GRANT ALL ON TABLE "public"."operation_templates" TO "anon";
GRANT ALL ON TABLE "public"."operation_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."operation_templates" TO "service_role";



GRANT ALL ON TABLE "public"."operations" TO "anon";
GRANT ALL ON TABLE "public"."operations" TO "authenticated";
GRANT ALL ON TABLE "public"."operations" TO "service_role";



GRANT ALL ON TABLE "public"."part_documents" TO "anon";
GRANT ALL ON TABLE "public"."part_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."part_documents" TO "service_role";



GRANT ALL ON TABLE "public"."parts" TO "anon";
GRANT ALL ON TABLE "public"."parts" TO "authenticated";
GRANT ALL ON TABLE "public"."parts" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON TABLE "public"."permissions_view" TO "anon";
GRANT ALL ON TABLE "public"."permissions_view" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions_view" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions_view" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions_view" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions_view" TO "service_role";



GRANT ALL ON TABLE "public"."roles_with_permissions_view" TO "anon";
GRANT ALL ON TABLE "public"."roles_with_permissions_view" TO "authenticated";
GRANT ALL ON TABLE "public"."roles_with_permissions_view" TO "service_role";



GRANT ALL ON TABLE "public"."user_group_members" TO "anon";
GRANT ALL ON TABLE "public"."user_group_members" TO "authenticated";
GRANT ALL ON TABLE "public"."user_group_members" TO "service_role";



GRANT ALL ON TABLE "public"."user_groups" TO "anon";
GRANT ALL ON TABLE "public"."user_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."user_groups" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."work_orders" TO "anon";
GRANT ALL ON TABLE "public"."work_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."work_orders" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
