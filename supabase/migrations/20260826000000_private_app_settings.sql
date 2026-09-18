-- Create a private app settings table to store sensitive configuration (like API Keys)
CREATE TABLE IF NOT EXISTS "public"."private_app_settings" (
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_by" "uuid"
);

ALTER TABLE ONLY "public"."private_app_settings"
    ADD CONSTRAINT "private_app_settings_pkey" PRIMARY KEY ("key");

-- Enable Row Level Security
ALTER TABLE "public"."private_app_settings" ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE OR REPLACE TRIGGER "update_private_app_settings_updated_at" BEFORE UPDATE ON "public"."private_app_settings" FOR EACH ROW 
EXECUTE FUNCTION "public"."update_updated_at_column"();

-- RLS Policies: ONLY admins can insert/update/delete.
-- Nobody can SELECT from the frontend, not even admins (to prevent the key from being intercepted).
-- The Service Role key (used by Edge Functions) will bypass RLS to read the keys.

CREATE POLICY "Admins can insert private app settings" ON "public"."private_app_settings" FOR INSERT TO "authenticated" WITH CHECK 
("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));

CREATE POLICY "Admins can update private app settings" ON "public"."private_app_settings" FOR UPDATE TO "authenticated" USING 
("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")) WITH CHECK ("public"."has_role"("auth"."uid"(), 
'admin'::"public"."app_role"));

CREATE POLICY "Admins can delete private app settings" ON "public"."private_app_settings" FOR DELETE TO "authenticated" USING 
("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));

-- Grants (we grant all so the RLS policies can take effect for authenticated users)
GRANT ALL ON TABLE "public"."private_app_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."private_app_settings" TO "service_role";
