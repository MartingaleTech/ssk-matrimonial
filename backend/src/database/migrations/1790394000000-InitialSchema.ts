import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1790394000000 implements MigrationInterface {
  name = 'InitialSchema1790394000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "device_info" character varying(500), "ip_address" character varying(45), "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e93e031a5fed190d4789b6bfd83" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "otp_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "channel" character varying(20) NOT NULL, "code" character varying(10) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9d0487965ac1837d57fec4d6a26" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" character varying(50) NOT NULL, "data" jsonb, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_notification_settings" ("user_id" uuid NOT NULL, "email_enabled" boolean NOT NULL DEFAULT true, "sms_enabled" boolean NOT NULL DEFAULT true, "push_enabled" boolean NOT NULL DEFAULT true, "connection_notifications" boolean NOT NULL DEFAULT true, "message_notifications" boolean NOT NULL DEFAULT true, "marketing_notifications" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_52182ffd0f785e8256f8fcb4fd6" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255), "phone" character varying(255), "password_hash" character varying(255) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "last_login_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile_managers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "profile_id" uuid NOT NULL, "role" character varying(20) NOT NULL, "is_primary" boolean NOT NULL DEFAULT false, "added_by_manager_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_3f8510b73adb58f27e2b4fecfb1" UNIQUE ("user_id", "profile_id"), CONSTRAINT "PK_74512e22eef1b2a178722704ee4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile_basic_details" ("profile_id" uuid NOT NULL, "first_name" character varying(100), "last_name" character varying(100), "community" character varying(100), "mother_tongue" character varying(100), "religion" character varying(100), "caste_subgroup" character varying(100), "gotra" character varying(100), CONSTRAINT "PK_937a7e0fe3f304e4af99d502085" PRIMARY KEY ("profile_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile_education_career" ("profile_id" uuid NOT NULL, "highest_education" character varying(100), "education_details" text, "occupation" character varying(100), "company_name" character varying(255), "annual_income_range" character varying(50), "work_location_city" character varying(100), "work_location_country" character varying(100), CONSTRAINT "PK_781dfcb8086e7a6bc6b53a2d623" PRIMARY KEY ("profile_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile_family_info" ("profile_id" uuid NOT NULL, "family_type" character varying(50), "father_occupation" character varying(100), "mother_occupation" character varying(100), "siblings_brothers" integer, "siblings_sisters" integer, "family_status" character varying(50), "family_values" character varying(50), CONSTRAINT "PK_3fa92e20504bf50055c60070e57" PRIMARY KEY ("profile_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile_lifestyle" ("profile_id" uuid NOT NULL, "diet" character varying(50), "smoking" character varying(20), "drinking" character varying(20), "hobbies" jsonb, CONSTRAINT "PK_1a148a4f02530d8a9345aa86aab" PRIMARY KEY ("profile_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile_location" ("profile_id" uuid NOT NULL, "country" character varying(100), "state" character varying(100), "city" character varying(100), "pincode" character varying(10), "latitude" numeric(10,7), "longitude" numeric(10,7), CONSTRAINT "PK_c421843921f4b644248bbe77f3d" PRIMARY KEY ("profile_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile_photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profile_id" uuid NOT NULL, "url" character varying(1000) NOT NULL, "storage_key" character varying(500), "is_primary" boolean NOT NULL DEFAULT false, "visibility" character varying(20) NOT NULL DEFAULT 'public', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a7e588425c00912ee9e50f47dc1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile_privacy_settings" ("profile_id" uuid NOT NULL, "show_full_name" boolean NOT NULL DEFAULT true, "show_work_details" boolean NOT NULL DEFAULT true, "show_location_city" boolean NOT NULL DEFAULT true, "show_kundali_public" boolean NOT NULL DEFAULT false, "allow_non_connected_chat_requests" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c1907c6af789ee21febbe627c58" PRIMARY KEY ("profile_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile_partner_preferences" ("profile_id" uuid NOT NULL, "age_min" integer, "age_max" integer, "height_min_cm" integer, "height_max_cm" integer, "marital_status_allowed" jsonb, "education_levels" jsonb, "occupations" jsonb, "locations" jsonb, "diet_preferences" jsonb, "smoking_preference" character varying(20), "drinking_preference" character varying(20), "kundali_requirements" jsonb, CONSTRAINT "PK_110dc61a58bbcb6d533089ac5a6" PRIMARY KEY ("profile_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile_kundali" ("profile_id" uuid NOT NULL, "birth_date" date, "birth_time" TIME, "birth_place" character varying(255), "latitude" numeric(10,7), "longitude" numeric(10,7), "timezone" character varying(50), "rashi" character varying(50), "nakshatra" character varying(50), "lagna" character varying(50), "manglik_status" character varying(20), "planetary_positions" jsonb, "houses" jsonb, "doshas" jsonb, "kundali_generated" boolean NOT NULL DEFAULT false, "kundali_source" character varying(50), "generated_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c63050bfb4e718d7fd3279b4394" PRIMARY KEY ("profile_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "kundali_preferences" ("profile_id" uuid NOT NULL, "require_kundali_match" boolean NOT NULL DEFAULT false, "minimum_guna_score" integer, "preferred_doshas" jsonb, "preferred_rashi" jsonb, "preferred_nakshatra" jsonb, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_06466ef8754e3cb1c44f229da23" PRIMARY KEY ("profile_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile_search_index" ("profile_id" uuid NOT NULL, "gender" character varying(20), "age" integer, "height_cm" integer, "marital_status" character varying(50), "education_level" character varying(100), "occupation" character varying(100), "city" character varying(100), "state" character varying(100), "country" character varying(100), "community" character varying(100), "manglik_status" character varying(20), "rashi" character varying(50), "nakshatra" character varying(50), "guna_total_score" numeric(4,1), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f048271dc519fa61fc39536f324" PRIMARY KEY ("profile_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "display_name" character varying(255) NOT NULL, "gender" character varying(20) NOT NULL, "date_of_birth" date NOT NULL, "height_cm" integer, "marital_status" character varying(50) NOT NULL, "about_me" text, "profile_status" character varying(20) NOT NULL DEFAULT 'draft', "country" character varying(2), "currency" character varying(3), "has_kundali" boolean NOT NULL DEFAULT false, "email_verified" boolean NOT NULL DEFAULT false, "phone_verified" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "verifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profile_id" uuid NOT NULL, "type" character varying(50) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'pending', "requested_at" TIMESTAMP WITH TIME ZONE, "verified_at" TIMESTAMP WITH TIME ZONE, "verified_by_admin_id" uuid, "metadata" text, CONSTRAINT "PK_2127ad1b143cf012280390b01d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "plan_prices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "plan_id" uuid NOT NULL, "country" character varying(2) NOT NULL, "currency" character varying(3) NOT NULL, "amount" integer NOT NULL, "interval" character varying(20) NOT NULL DEFAULT 'month', "provider_price_id" character varying(255), CONSTRAINT "UQ_4c3973bfd427ac47ed4c3d0deb3" UNIQUE ("plan_id", "country"), CONSTRAINT "PK_69b05dce9891d42a3d0fc77eec1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscription_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(20) NOT NULL, "name" character varying(100) NOT NULL, "features" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_2d2df70a81d37c893ef216caf8a" UNIQUE ("code"), CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profile_id" uuid NOT NULL, "plan_id" uuid NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'trialing', "provider" character varying(20), "provider_subscription_id" character varying(255), "provider_customer_id" character varying(255), "current_period_start" TIMESTAMP WITH TIME ZONE, "current_period_end" TIMESTAMP WITH TIME ZONE, "is_free_trial" boolean NOT NULL DEFAULT false, "cancelled_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reported_by_profile_id" uuid NOT NULL, "reported_profile_id" uuid NOT NULL, "reason" text NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "resolved_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subscription_id" uuid, "provider" character varying(20) NOT NULL, "provider_payment_id" character varying(255), "amount" integer NOT NULL, "currency" character varying(3) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'pending', "method" character varying(20), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "guna_match_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profile1_id" uuid NOT NULL, "profile2_id" uuid NOT NULL, "guna_total_score" numeric(4,1), "guna_breakdown" jsonb, "match_quality" character varying(50), "ai_summary" text, "generated_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_31347292e36bae553dd408a5ff4" UNIQUE ("profile1_id", "profile2_id"), CONSTRAINT "PK_8685a5d007f661fe9d6ca0c6201" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "favorites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profile_id" uuid NOT NULL, "favorited_profile_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_86526e318e9879f793d4bf05791" UNIQUE ("profile_id", "favorited_profile_id"), CONSTRAINT "PK_890818d27523748dd36a4d1bdc8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "connections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "from_profile_id" uuid NOT NULL, "to_profile_id" uuid NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'pending', "initiated_by_manager_id" uuid, "requested_at" TIMESTAMP WITH TIME ZONE, "responded_at" TIMESTAMP WITH TIME ZONE, "message" text, CONSTRAINT "UQ_15f0c00031d084486f67a764655" UNIQUE ("from_profile_id", "to_profile_id"), CONSTRAINT "PK_0a1f844af3122354cbd487a8d03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "thread_id" uuid NOT NULL, "sender_profile_id" uuid NOT NULL, "sender_manager_id" uuid NOT NULL, "message_type" character varying(20) NOT NULL DEFAULT 'text', "content" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "read_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "chat_threads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profile1_id" uuid NOT NULL, "profile2_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_message_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_5e9fb6eb92702e4ea9185c5fee1" UNIQUE ("profile1_id", "profile2_id"), CONSTRAINT "PK_973a81c0adb9b18a5ea3ef95bf8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "blocks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "blocked_by_profile_id" uuid NOT NULL, "blocked_profile_id" uuid NOT NULL, "reason" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_785de7e8dba53094bf9e4f90cb4" UNIQUE ("blocked_by_profile_id", "blocked_profile_id"), CONSTRAINT "PK_8244fa1495c4e9222a01059244b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actor_user_id" uuid, "actor_manager_id" uuid, "profile_id" uuid, "action" character varying(100) NOT NULL, "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "admins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "role" character varying(20) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_e9658e959c490b0a634dfc54783" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp_codes" ADD CONSTRAINT "FK_318b850fc020b1e0f8670f66e12" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" ADD CONSTRAINT "FK_52182ffd0f785e8256f8fcb4fd6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_managers" ADD CONSTRAINT "FK_5921d1b64d21f703024690cf670" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_managers" ADD CONSTRAINT "FK_532b706c2252e64c2c7a904da2d" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_managers" ADD CONSTRAINT "FK_e801a871a0894aa8f55fe6b9f45" FOREIGN KEY ("added_by_manager_id") REFERENCES "profile_managers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_basic_details" ADD CONSTRAINT "FK_937a7e0fe3f304e4af99d502085" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_education_career" ADD CONSTRAINT "FK_781dfcb8086e7a6bc6b53a2d623" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_family_info" ADD CONSTRAINT "FK_3fa92e20504bf50055c60070e57" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_lifestyle" ADD CONSTRAINT "FK_1a148a4f02530d8a9345aa86aab" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_location" ADD CONSTRAINT "FK_c421843921f4b644248bbe77f3d" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_photos" ADD CONSTRAINT "FK_d525db7563d955fdc7d0e5463a7" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_privacy_settings" ADD CONSTRAINT "FK_c1907c6af789ee21febbe627c58" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_partner_preferences" ADD CONSTRAINT "FK_110dc61a58bbcb6d533089ac5a6" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_kundali" ADD CONSTRAINT "FK_c63050bfb4e718d7fd3279b4394" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "kundali_preferences" ADD CONSTRAINT "FK_06466ef8754e3cb1c44f229da23" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_search_index" ADD CONSTRAINT "FK_f048271dc519fa61fc39536f324" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "verifications" ADD CONSTRAINT "FK_9cbaee3d073062d801715124e8f" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_prices" ADD CONSTRAINT "FK_486db649897ac5901b8e93e5b7d" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_f246395048c652107a519bc19ac" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ADD CONSTRAINT "FK_2f7b15b5f7e43ba3a757ea78e75" FOREIGN KEY ("reported_by_profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ADD CONSTRAINT "FK_fbf064a2a6b628f5341166fd9bb" FOREIGN KEY ("reported_profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_75848dfef07fd19027e08ca81d2" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "guna_match_results" ADD CONSTRAINT "FK_6e430e675e94a2ab30c97f97063" FOREIGN KEY ("profile1_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "guna_match_results" ADD CONSTRAINT "FK_9cc5a15aff60864265395ab7073" FOREIGN KEY ("profile2_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" ADD CONSTRAINT "FK_fa22978a1a669a770fbcf8e60d9" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" ADD CONSTRAINT "FK_992829cfa8a212964ad77094a14" FOREIGN KEY ("favorited_profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "connections" ADD CONSTRAINT "FK_c9a95ec19932793124c148d763a" FOREIGN KEY ("from_profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "connections" ADD CONSTRAINT "FK_41fe849f669ba16b201a60c1ad8" FOREIGN KEY ("to_profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "connections" ADD CONSTRAINT "FK_462fcc94489b8792ce6b17e9ba5" FOREIGN KEY ("initiated_by_manager_id") REFERENCES "profile_managers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_0b7e57fe586503d477a8d5adaed" FOREIGN KEY ("thread_id") REFERENCES "chat_threads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_7bd750cac2d1e7ed2fb1ee2a38a" FOREIGN KEY ("sender_profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_880741f2cc7bb73fdc304b7fb46" FOREIGN KEY ("sender_manager_id") REFERENCES "profile_managers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_threads" ADD CONSTRAINT "FK_2d618e055b8a89bd54250ecbe4f" FOREIGN KEY ("profile1_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_threads" ADD CONSTRAINT "FK_c1d0ef4adb63a4996e12229e98f" FOREIGN KEY ("profile2_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "blocks" ADD CONSTRAINT "FK_af42c86d4464ca987ec34d89457" FOREIGN KEY ("blocked_by_profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "blocks" ADD CONSTRAINT "FK_cdaf8987df47fdb72dec9c321e3" FOREIGN KEY ("blocked_profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_f160d97a931844109de9d04228f" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_d3111227d98237eebd5c1b6790e" FOREIGN KEY ("actor_manager_id") REFERENCES "profile_managers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_c26bbca00e1d7268c5a832ad347" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_c26bbca00e1d7268c5a832ad347"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_d3111227d98237eebd5c1b6790e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_f160d97a931844109de9d04228f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "blocks" DROP CONSTRAINT "FK_cdaf8987df47fdb72dec9c321e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "blocks" DROP CONSTRAINT "FK_af42c86d4464ca987ec34d89457"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_threads" DROP CONSTRAINT "FK_c1d0ef4adb63a4996e12229e98f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_threads" DROP CONSTRAINT "FK_2d618e055b8a89bd54250ecbe4f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_880741f2cc7bb73fdc304b7fb46"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_7bd750cac2d1e7ed2fb1ee2a38a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_0b7e57fe586503d477a8d5adaed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "connections" DROP CONSTRAINT "FK_462fcc94489b8792ce6b17e9ba5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "connections" DROP CONSTRAINT "FK_41fe849f669ba16b201a60c1ad8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "connections" DROP CONSTRAINT "FK_c9a95ec19932793124c148d763a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" DROP CONSTRAINT "FK_992829cfa8a212964ad77094a14"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorites" DROP CONSTRAINT "FK_fa22978a1a669a770fbcf8e60d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "guna_match_results" DROP CONSTRAINT "FK_9cc5a15aff60864265395ab7073"`,
    );
    await queryRunner.query(
      `ALTER TABLE "guna_match_results" DROP CONSTRAINT "FK_6e430e675e94a2ab30c97f97063"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_75848dfef07fd19027e08ca81d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" DROP CONSTRAINT "FK_fbf064a2a6b628f5341166fd9bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" DROP CONSTRAINT "FK_2f7b15b5f7e43ba3a757ea78e75"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_f246395048c652107a519bc19ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plan_prices" DROP CONSTRAINT "FK_486db649897ac5901b8e93e5b7d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "verifications" DROP CONSTRAINT "FK_9cbaee3d073062d801715124e8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_search_index" DROP CONSTRAINT "FK_f048271dc519fa61fc39536f324"`,
    );
    await queryRunner.query(
      `ALTER TABLE "kundali_preferences" DROP CONSTRAINT "FK_06466ef8754e3cb1c44f229da23"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_kundali" DROP CONSTRAINT "FK_c63050bfb4e718d7fd3279b4394"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_partner_preferences" DROP CONSTRAINT "FK_110dc61a58bbcb6d533089ac5a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_privacy_settings" DROP CONSTRAINT "FK_c1907c6af789ee21febbe627c58"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_photos" DROP CONSTRAINT "FK_d525db7563d955fdc7d0e5463a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_location" DROP CONSTRAINT "FK_c421843921f4b644248bbe77f3d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_lifestyle" DROP CONSTRAINT "FK_1a148a4f02530d8a9345aa86aab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_family_info" DROP CONSTRAINT "FK_3fa92e20504bf50055c60070e57"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_education_career" DROP CONSTRAINT "FK_781dfcb8086e7a6bc6b53a2d623"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_basic_details" DROP CONSTRAINT "FK_937a7e0fe3f304e4af99d502085"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_managers" DROP CONSTRAINT "FK_e801a871a0894aa8f55fe6b9f45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_managers" DROP CONSTRAINT "FK_532b706c2252e64c2c7a904da2d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_managers" DROP CONSTRAINT "FK_5921d1b64d21f703024690cf670"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" DROP CONSTRAINT "FK_52182ffd0f785e8256f8fcb4fd6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp_codes" DROP CONSTRAINT "FK_318b850fc020b1e0f8670f66e12"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_e9658e959c490b0a634dfc54783"`,
    );
    await queryRunner.query(`DROP TABLE "admins"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "blocks"`);
    await queryRunner.query(`DROP TABLE "chat_threads"`);
    await queryRunner.query(`DROP TABLE "chat_messages"`);
    await queryRunner.query(`DROP TABLE "connections"`);
    await queryRunner.query(`DROP TABLE "favorites"`);
    await queryRunner.query(`DROP TABLE "guna_match_results"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "reports"`);
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TABLE "subscription_plans"`);
    await queryRunner.query(`DROP TABLE "plan_prices"`);
    await queryRunner.query(`DROP TABLE "verifications"`);
    await queryRunner.query(`DROP TABLE "profiles"`);
    await queryRunner.query(`DROP TABLE "profile_search_index"`);
    await queryRunner.query(`DROP TABLE "kundali_preferences"`);
    await queryRunner.query(`DROP TABLE "profile_kundali"`);
    await queryRunner.query(`DROP TABLE "profile_partner_preferences"`);
    await queryRunner.query(`DROP TABLE "profile_privacy_settings"`);
    await queryRunner.query(`DROP TABLE "profile_photos"`);
    await queryRunner.query(`DROP TABLE "profile_location"`);
    await queryRunner.query(`DROP TABLE "profile_lifestyle"`);
    await queryRunner.query(`DROP TABLE "profile_family_info"`);
    await queryRunner.query(`DROP TABLE "profile_education_career"`);
    await queryRunner.query(`DROP TABLE "profile_basic_details"`);
    await queryRunner.query(`DROP TABLE "profile_managers"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "user_notification_settings"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "otp_codes"`);
    await queryRunner.query(`DROP TABLE "user_sessions"`);
  }
}
