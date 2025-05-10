SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

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

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '0486b3e2-d942-4deb-8075-ff7535a88905', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"admin@precisionflow.us","user_id":"db94d3da-b289-4f03-bd1a-01dca3132335","user_phone":""}}', '2025-04-18 21:26:13.917329+00', ''),
	('00000000-0000-0000-0000-000000000000', '7e76cdcf-288a-42a4-acae-ba59af7fc6ae', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-18 21:32:41.760254+00', ''),
	('00000000-0000-0000-0000-000000000000', '0de8933b-10c7-4bd0-98b6-147988b059e6', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-18 21:32:46.049991+00', ''),
	('00000000-0000-0000-0000-000000000000', '82a33b61-2fc0-44d2-9081-3f9eb7e3aca5', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-18 21:32:47.274456+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b1ac6d99-e704-4810-b1e7-b62dee8bc418', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-18 21:32:50.25203+00', ''),
	('00000000-0000-0000-0000-000000000000', 'db4462cc-043a-4eb4-bf3b-f991c3589b78', '{"action":"logout","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account"}', '2025-04-18 21:38:43.862112+00', ''),
	('00000000-0000-0000-0000-000000000000', '26ac765c-cd9d-49b1-ab7d-b15dd507d311', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-18 21:38:46.977758+00', ''),
	('00000000-0000-0000-0000-000000000000', '0076c048-5e6c-4d0b-9e0d-33ae8c94f5e9', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-18 21:52:03.795337+00', ''),
	('00000000-0000-0000-0000-000000000000', '99259788-5d8a-4757-be2d-872ce9994d4a', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"ben.t@precisionflow.us","user_id":"0509ebcc-d2c6-4558-9912-dbee858c1d6a","user_phone":""}}', '2025-04-18 21:52:31.857175+00', ''),
	('00000000-0000-0000-0000-000000000000', '83c8c4c0-8cc6-49c0-ab82-636a73f22a15', '{"action":"logout","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account"}', '2025-04-18 22:00:05.092545+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a48adab2-0ab2-43ec-a271-1f6f9b381170', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-18 22:00:10.037272+00', ''),
	('00000000-0000-0000-0000-000000000000', '487c099a-2e0a-458c-a178-01349f10082d', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"ben.t@precisionflow.us","user_id":"0509ebcc-d2c6-4558-9912-dbee858c1d6a","user_phone":""}}', '2025-04-18 22:22:31.469918+00', ''),
	('00000000-0000-0000-0000-000000000000', '121fd73a-79f6-4c64-816f-12736624f131', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"ben.t@precisionflow.us","user_id":"f7dfd485-de76-49b8-a98e-8c88094976a2","user_phone":""}}', '2025-04-18 22:22:53.6702+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cfc3a781-7dfb-4d5f-99df-3cc7c412b541', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-18 22:35:14.847342+00', ''),
	('00000000-0000-0000-0000-000000000000', '097cb6b3-ea31-481e-9cd4-68830c3816b8', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"anh.t@precisionflow.us","user_id":"74aa1dd3-5795-4dc1-b2ec-4c49f9f12742","user_phone":""}}', '2025-04-18 22:38:21.480352+00', ''),
	('00000000-0000-0000-0000-000000000000', '2400c3f4-e399-4165-b005-a77b67268414', '{"action":"logout","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account"}', '2025-04-18 22:38:55.458071+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cf25eaf7-ba4e-451d-857b-8e33f93e5ed4', '{"action":"login","actor_id":"f7dfd485-de76-49b8-a98e-8c88094976a2","actor_username":"ben.t@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-18 22:39:01.764095+00', ''),
	('00000000-0000-0000-0000-000000000000', '1d0ddb36-5983-4553-a6e7-58098bcabf7a', '{"action":"login","actor_id":"74aa1dd3-5795-4dc1-b2ec-4c49f9f12742","actor_username":"anh.t@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-18 22:39:10.917842+00', ''),
	('00000000-0000-0000-0000-000000000000', '3c845be2-c096-4871-a153-9039ea79ce9b', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-18 23:08:31.276362+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b51dbae4-8c51-41be-923d-29f0ce095c28', '{"action":"login","actor_id":"74aa1dd3-5795-4dc1-b2ec-4c49f9f12742","actor_username":"anh.t@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-18 23:12:50.762304+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a06d3c04-b53b-43c8-9211-a183c7aa3345', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-18 23:17:53.317856+00', ''),
	('00000000-0000-0000-0000-000000000000', '9724ccbe-8ebc-42aa-8106-fe58a9e01dcd', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"luke.s@precisionflow.us","user_id":"fad6cb1e-a375-4ddd-b2b2-7fc24efa389b","user_phone":""}}', '2025-04-18 23:19:52.190941+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f11d60a3-0407-4cfc-8d58-f172f7d1c435', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"anh.t@precisionflow.us","user_id":"74aa1dd3-5795-4dc1-b2ec-4c49f9f12742","user_phone":""}}', '2025-04-18 23:20:01.685999+00', ''),
	('00000000-0000-0000-0000-000000000000', '2a454ac7-71f2-41bb-a37f-189da097c1f4', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"ben.t@precisionflow.us","user_id":"f7dfd485-de76-49b8-a98e-8c88094976a2","user_phone":""}}', '2025-04-18 23:20:01.700107+00', ''),
	('00000000-0000-0000-0000-000000000000', '8b6a58b3-c17c-4686-bae4-6b4590176233', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"anh.t@precisionflow.us","user_id":"dbf9bcff-330f-42b6-a6a7-a3374a89c591","user_phone":""}}', '2025-04-18 23:20:19.21219+00', ''),
	('00000000-0000-0000-0000-000000000000', '1b9be047-88b5-4177-aa7c-8ccbd5dfaf6b', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"ben.t@precisionflow.us","user_id":"aaaf54f4-f6f2-40bd-8707-b379e4d13d29","user_phone":""}}', '2025-04-18 23:20:32.721275+00', ''),
	('00000000-0000-0000-0000-000000000000', '746e8e94-63e7-4cb3-838d-569b692c841f', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"ben.t@precisionflow.us","user_id":"aaaf54f4-f6f2-40bd-8707-b379e4d13d29","user_phone":""}}', '2025-04-18 23:22:26.948852+00', ''),
	('00000000-0000-0000-0000-000000000000', '0422420a-2388-43ac-b22b-0dd3c2a6e581', '{"action":"logout","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account"}', '2025-04-18 23:22:35.04287+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a9639cb4-9c0c-4760-b61b-ede1d7ab7f21', '{"action":"login","actor_id":"dbf9bcff-330f-42b6-a6a7-a3374a89c591","actor_username":"anh.t@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-18 23:22:45.615243+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f7cd3264-764b-4054-9463-352e874ff249', '{"action":"logout","actor_id":"dbf9bcff-330f-42b6-a6a7-a3374a89c591","actor_username":"anh.t@precisionflow.us","actor_via_sso":false,"log_type":"account"}', '2025-04-18 23:39:37.492964+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f9f6ae83-bcbb-484a-9443-81223af20335', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-18 23:39:44.978371+00', ''),
	('00000000-0000-0000-0000-000000000000', '3e6d4a88-90e6-4885-9732-1f405ab038a6', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-20 03:10:07.334893+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c5595d49-4f93-48e9-88ee-1d1a7bec144a', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-20 04:50:01.259214+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c9bd9e71-6c13-4081-9b43-2a58f825a5e4', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-20 04:50:01.262774+00', ''),
	('00000000-0000-0000-0000-000000000000', '74589b4d-c281-4164-bd41-cd66d7ecf910', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-20 05:02:49.319309+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c1af1d43-d2c7-4f73-8e59-19f95182361e', '{"action":"logout","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account"}', '2025-04-20 05:10:41.582853+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cf25eafd-d397-4418-bec9-e73ae42dba8d', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-20 05:10:46.176846+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd71224dd-9051-40d9-9f5a-21ba9027f142', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-20 19:35:23.265295+00', ''),
	('00000000-0000-0000-0000-000000000000', '5e2fd3f0-4a91-457f-a8a0-55350bd3b072', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-20 19:38:51.807086+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cc071966-6b17-4cb6-a27d-511ff01aa242', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-20 19:38:51.810179+00', ''),
	('00000000-0000-0000-0000-000000000000', '95a8aa8b-190f-48fa-97eb-20d4398115af', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-20 20:36:56.957563+00', ''),
	('00000000-0000-0000-0000-000000000000', '5b0155a0-1f2b-45cd-9cb9-34c6300bebef', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-20 20:36:56.95842+00', ''),
	('00000000-0000-0000-0000-000000000000', '1547452f-1e76-4694-b092-1dc5a6b7e281', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-20 21:35:08.500872+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c6350c27-b220-4c77-8320-f32624bbe8e3', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-20 21:35:08.501764+00', ''),
	('00000000-0000-0000-0000-000000000000', 'de7f723d-2449-4c6d-b6d9-bc44b826fb23', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-21 03:02:28.036366+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ef25a537-59eb-4427-83a0-900c85606fc2', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-21 03:02:28.055279+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f9c03178-b6e5-4769-87c1-ad59a7d9dc21', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-21 04:07:35.648901+00', ''),
	('00000000-0000-0000-0000-000000000000', '8db8ea8f-33d1-43cf-b19a-c164d88340a1', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-21 04:07:35.650525+00', ''),
	('00000000-0000-0000-0000-000000000000', '7c1f9def-2c83-453e-a0fa-58b7884f8950', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-21 04:15:03.772225+00', ''),
	('00000000-0000-0000-0000-000000000000', '5048f1d7-776c-497a-85a2-63c2b16ef90e', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-21 04:28:38.44326+00', ''),
	('00000000-0000-0000-0000-000000000000', '9b6e7163-0429-4ec0-9b16-4873fbbb8740', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-21 04:28:38.444841+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f6f02c49-70b4-44d6-b751-26efb9cca5e4', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-21 05:27:15.553919+00', ''),
	('00000000-0000-0000-0000-000000000000', '208cbbd7-2327-44ad-b5a1-8551caaa55c4', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-21 05:27:15.56062+00', ''),
	('00000000-0000-0000-0000-000000000000', '812ef5c3-6ed7-4f2d-88c9-c58ed277a524', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-21 20:08:10.173092+00', ''),
	('00000000-0000-0000-0000-000000000000', '5b668aef-cc3e-40e1-b6e2-3010d4922302', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-21 20:13:02.674229+00', ''),
	('00000000-0000-0000-0000-000000000000', '00bd4909-def9-4bb5-8973-26b8037f8ebc', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-21 21:11:26.57821+00', ''),
	('00000000-0000-0000-0000-000000000000', '44e5945b-bbbd-4e02-9dd3-190f40d19169', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-21 21:11:26.579802+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c0cd9eb2-1a54-4862-8ddc-23c692fb35dc', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-21 21:49:11.992161+00', ''),
	('00000000-0000-0000-0000-000000000000', '2be3f68d-8826-421f-8248-b19809ec54a6', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-21 21:49:11.99395+00', ''),
	('00000000-0000-0000-0000-000000000000', '1726dd87-7b1f-488f-9ece-b6815bd7558c', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-21 22:14:09.550251+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b47dc47b-a2ee-45be-9e71-aa499959aa02', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-21 22:14:09.554401+00', ''),
	('00000000-0000-0000-0000-000000000000', '30771fe2-7eb8-4a8c-8878-260fb888210a', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-22 02:11:28.457796+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f320ff57-3523-4949-bf63-d187cbd0f4a1', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-22 02:11:28.471264+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b1525f46-1dc8-44c8-a776-dd59c2df3a5f', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-22 02:25:20.474738+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd608dfdf-ee5b-4d68-9ef5-f3b80d0654ce', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-22 02:25:20.476261+00', ''),
	('00000000-0000-0000-0000-000000000000', '82a86a0f-1bfb-4ede-a05d-4102f16f3cdd', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-22 02:27:05.534205+00', ''),
	('00000000-0000-0000-0000-000000000000', '327e07fc-7912-4b10-b2af-87db97ca039e', '{"action":"logout","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account"}', '2025-04-22 02:32:52.147164+00', ''),
	('00000000-0000-0000-0000-000000000000', '578dc840-ed75-4dc4-9dde-80bb7e2f5a1f', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-22 02:32:56.584286+00', ''),
	('00000000-0000-0000-0000-000000000000', '1facbd85-d3ee-4a1f-89ca-705d655f7fdc', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-22 03:33:30.149321+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd7e51e05-7726-4fef-93f5-29d6eb0ce2be', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-22 03:33:30.151858+00', ''),
	('00000000-0000-0000-0000-000000000000', '0eb86714-400a-4c81-8ab9-2863e82803e1', '{"action":"logout","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account"}', '2025-04-22 03:42:24.372354+00', ''),
	('00000000-0000-0000-0000-000000000000', '06ac3d16-dad1-4184-a8b9-a828a40dcddf', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-22 03:42:28.81129+00', ''),
	('00000000-0000-0000-0000-000000000000', '48bdcd6f-cca5-456c-946a-84a77ead6755', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-22 04:40:41.865508+00', ''),
	('00000000-0000-0000-0000-000000000000', '662f4b30-f9e4-4012-bcc4-6733f74f2acb', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-22 04:40:41.868612+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c5f3200f-7ce9-40bb-8ff3-af4080da1023', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-22 05:40:14.918247+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b31b592f-8b93-42a3-a1a4-56d6be9f24bb', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-22 05:40:14.920442+00', ''),
	('00000000-0000-0000-0000-000000000000', '76d98c13-8b6b-417e-b4d7-74c50624b181', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-22 05:40:24.711956+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd2846763-b9a9-4804-9616-585215262f8c', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-22 06:01:31.015288+00', ''),
	('00000000-0000-0000-0000-000000000000', '2334fe44-4555-433f-9a08-3ca566638688', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-22 06:06:17.076591+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c893dcab-7772-4e41-8c5d-e511ebd8603b', '{"action":"logout","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account"}', '2025-04-22 06:09:49.64803+00', ''),
	('00000000-0000-0000-0000-000000000000', '5f9df00a-147b-46e2-ad82-186426e54641', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-22 18:32:05.333594+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b9a4e711-d477-4d21-8b48-1933fc9ac3d0', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"adolfo.z@precisionflow.us","user_id":"004601ee-eca2-4123-9ac6-355264c79797","user_phone":""}}', '2025-04-22 18:37:14.330735+00', ''),
	('00000000-0000-0000-0000-000000000000', '083e8eaf-9d01-4d49-822a-257adc1bd31d', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-23 02:05:12.643968+00', ''),
	('00000000-0000-0000-0000-000000000000', '5d4dd3d9-07ed-4bb7-a26f-fbd05cc1debb', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-23 02:12:55.896559+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f7a913c0-2cb0-4b57-920b-c90ea179d1a4', '{"action":"logout","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account"}', '2025-04-23 02:14:21.574919+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fbbbac16-8088-44a8-8cb8-cab04d00c1f6', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-23 02:14:34.692002+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dede44fe-d78e-458e-acd5-9c25f87ca1f3', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-23 04:27:59.878184+00', ''),
	('00000000-0000-0000-0000-000000000000', '1082ea2c-0404-45b5-a489-65779afce430', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-23 04:42:50.91296+00', ''),
	('00000000-0000-0000-0000-000000000000', '4b3bf94f-a202-4927-aea4-3cd5c6d0305e', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-23 05:33:44.630901+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f4e6b5b6-4d86-4120-a1ea-4916bbf5cd17', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-23 05:33:44.634649+00', ''),
	('00000000-0000-0000-0000-000000000000', '74641042-fa01-40b6-a4f1-b829eecab8fb', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-23 21:46:41.706562+00', ''),
	('00000000-0000-0000-0000-000000000000', '648e0943-c0c6-4065-938b-3254f9c94293', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-23 22:18:35.264155+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b2876b64-c7c2-4446-869a-ad2d257b4f58', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-23 23:22:07.387278+00', ''),
	('00000000-0000-0000-0000-000000000000', 'da450dc8-8e60-4fe0-ba37-8f9613539356', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-23 23:22:07.389324+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd4f9d9fb-fc09-4604-83aa-208727a83d8e', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-23 23:37:22.937829+00', ''),
	('00000000-0000-0000-0000-000000000000', '7c1b6a33-b384-45e8-8a2e-da09c3659c30', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-23 23:37:22.938735+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ec5cf51f-06cc-4778-bf25-7667e76ddbca', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 02:04:41.878509+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f5192cfb-d99e-48e6-956c-fc787baa2459', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 02:04:41.880568+00', ''),
	('00000000-0000-0000-0000-000000000000', '1c9c9403-9fea-434f-8812-fd7317bac49b', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 03:11:49.211205+00', ''),
	('00000000-0000-0000-0000-000000000000', '8b4e659e-6fca-4c59-83f8-e413f79245af', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 03:11:49.213376+00', ''),
	('00000000-0000-0000-0000-000000000000', '2a90f579-6d14-4e8d-b984-b7c4ecceeb3d', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 03:24:51.878768+00', ''),
	('00000000-0000-0000-0000-000000000000', '0bef82fa-ab42-427e-8bb2-1cd8bdb28d15', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 03:24:51.881025+00', ''),
	('00000000-0000-0000-0000-000000000000', '1eed85ec-ac64-4b9f-b49e-8eaeed3badba', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-24 04:13:46.393683+00', ''),
	('00000000-0000-0000-0000-000000000000', '39a6bf2f-f4fa-4cda-b40d-a2f8cbfb14f4', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 04:25:52.109637+00', ''),
	('00000000-0000-0000-0000-000000000000', '2037c033-8227-4286-8c19-72968c8bf521', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 04:25:52.111509+00', ''),
	('00000000-0000-0000-0000-000000000000', '2a5a4415-33c4-46a5-abb0-14b92c8e14b6', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 04:36:52.744151+00', ''),
	('00000000-0000-0000-0000-000000000000', '133d796c-7d2f-479d-a4ba-dc99dd39dac9', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 04:36:52.746198+00', ''),
	('00000000-0000-0000-0000-000000000000', '2bea95a7-0299-4526-9b1a-dd41fe118ffb', '{"action":"login","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-24 04:42:09.945134+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c2ede902-4fe0-46b6-a1fe-2874cf7de2f0', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 07:23:07.080571+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ffe45bbf-278d-4b75-a525-2a1e2c3e802b', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 07:23:07.088428+00', ''),
	('00000000-0000-0000-0000-000000000000', '514d4153-73f9-4f0b-9a8c-9c6c20de78b1', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 08:23:09.837071+00', ''),
	('00000000-0000-0000-0000-000000000000', '74fefaea-f141-4d4d-bf33-69710362e997', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 08:23:09.83909+00', ''),
	('00000000-0000-0000-0000-000000000000', '2c860522-34ae-49ee-b464-9f90ba8dff04', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 09:23:20.493449+00', ''),
	('00000000-0000-0000-0000-000000000000', '0eb34924-224a-494e-acde-4454bf36b907', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 09:23:20.496028+00', ''),
	('00000000-0000-0000-0000-000000000000', '98a9a812-b86b-4928-b2cc-b13a40a6eba2', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 11:23:24.995865+00', ''),
	('00000000-0000-0000-0000-000000000000', '5e51f9cf-1cd9-4afe-80a7-f584aa3a277c', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 11:23:24.998423+00', ''),
	('00000000-0000-0000-0000-000000000000', '8468e434-d86c-4c79-9d2e-f7f93b1de170', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 13:23:37.26195+00', ''),
	('00000000-0000-0000-0000-000000000000', 'df17271c-6463-457f-b532-7bac26fb0b43', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 13:23:37.264758+00', ''),
	('00000000-0000-0000-0000-000000000000', '0bd6cb73-7d24-4cff-b0c5-d6a53859ad17', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 14:23:49.612403+00', ''),
	('00000000-0000-0000-0000-000000000000', '40bbf081-aece-46e8-a25b-b4dde023ee39', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 14:23:49.615181+00', ''),
	('00000000-0000-0000-0000-000000000000', 'aa057839-323b-4318-8d60-83d88063dc20', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 15:24:02.477814+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd9dbfea5-312e-4d3f-bb58-0f63b33dbb01', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 15:24:02.491157+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ba91e2e9-df21-492e-b1df-a841c76ad7a8', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 16:24:12.85733+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dd2f72f9-367d-49ba-895b-4091cae484dd', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 16:24:12.860427+00', ''),
	('00000000-0000-0000-0000-000000000000', 'acb8ca3b-913a-44c7-b7d9-6a162958d728', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 17:24:33.845153+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b0428bb7-0616-4d45-9915-1ba22b193255', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 17:24:33.847304+00', ''),
	('00000000-0000-0000-0000-000000000000', '34831dac-3b2c-4503-9b5e-eed4f75fd828', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 18:24:39.917148+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ac3909b8-2b4e-45e2-a213-7bbca0be46ac', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 18:24:39.918609+00', ''),
	('00000000-0000-0000-0000-000000000000', '7bd006ef-e4ab-4d7f-b3cf-bf04f8ab420c', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 19:24:51.339983+00', ''),
	('00000000-0000-0000-0000-000000000000', 'de251c34-9811-4df6-8dbc-4af993c6c6d0', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 19:24:51.342062+00', ''),
	('00000000-0000-0000-0000-000000000000', '8d2dddcc-f0ee-4a6f-9aba-3fd4f472ca74', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 20:24:58.27208+00', ''),
	('00000000-0000-0000-0000-000000000000', '549ca59b-8119-4a7c-abd8-0c985c92819e', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 20:24:58.274007+00', ''),
	('00000000-0000-0000-0000-000000000000', '4c435429-863c-4c00-bdd3-000057785a41', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 21:55:01.303989+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b82eae3b-f7c9-43d2-bbb2-a8b613dbfde8', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 21:55:01.306205+00', ''),
	('00000000-0000-0000-0000-000000000000', '9fd6c432-6b35-478a-8290-8091befa4d1c', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 22:55:09.079378+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e4fa27fb-17a5-42f4-8be7-ac689599c3f6', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-24 22:55:09.082474+00', ''),
	('00000000-0000-0000-0000-000000000000', '3a084d42-8c79-4c44-bde2-0d33aeb15637', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 02:07:21.525993+00', ''),
	('00000000-0000-0000-0000-000000000000', '4081ac5c-04ec-4baa-b032-a58e14934971', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 02:07:21.52847+00', ''),
	('00000000-0000-0000-0000-000000000000', '5610475c-3aa7-4675-9ae3-44c143d2ab78', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 08:56:07.307822+00', ''),
	('00000000-0000-0000-0000-000000000000', '25474267-381c-4d76-a1be-63cf6228f09a', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 08:56:07.31743+00', ''),
	('00000000-0000-0000-0000-000000000000', '6d141774-89b5-4a49-9c32-47b95536fa46', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 09:56:13.140569+00', ''),
	('00000000-0000-0000-0000-000000000000', '3f4e8755-5f28-4a56-8acb-a317e6df4884', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 09:56:13.142759+00', ''),
	('00000000-0000-0000-0000-000000000000', '11dadb89-2185-47ce-8c1d-48e44740fb2a', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 11:26:18.248135+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e4cea4b7-d5e5-41ed-aafc-9b79fc244ab9', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 11:26:18.258883+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e1c9f68e-7bfd-432d-8c48-dd3acc279faa', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 12:26:29.626982+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c5eacde5-4401-4c55-b435-9cd4b11d37b9', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 12:26:29.629098+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e084f297-0cab-4db5-8252-e4a9969a6893', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 13:26:41.962259+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dd4b12f7-b60c-4fa0-9b76-1a4906b14af6', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 13:26:41.965356+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e242aa2b-8b9e-4061-a353-2bc0b3eee1b3', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 14:26:50.09165+00', ''),
	('00000000-0000-0000-0000-000000000000', '83e18630-3e5c-4ec5-af59-1b241980ac42', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 14:26:50.094871+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bd6f7400-3e1f-4057-b1b6-64b61c601faa', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 15:57:02.519845+00', ''),
	('00000000-0000-0000-0000-000000000000', '94566e30-3d3f-43a8-8eb6-5676bff170e4', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 15:57:02.522841+00', ''),
	('00000000-0000-0000-0000-000000000000', '87955c47-7afb-4771-9023-adf35494fd47', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 16:57:09.739883+00', ''),
	('00000000-0000-0000-0000-000000000000', 'df513a68-7888-4a8a-84bb-e3797e96f2ec', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 16:57:09.744343+00', ''),
	('00000000-0000-0000-0000-000000000000', '7597e68f-a1e8-41e8-b292-10e907f1201d', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 18:27:16.204308+00', ''),
	('00000000-0000-0000-0000-000000000000', '080ed472-964e-4398-a2e8-0f3a0fc2f61b', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-25 18:27:16.2065+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cfaf1b4f-e280-410f-9347-e6ea46cc36f8', '{"action":"token_refreshed","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-30 23:09:57.061165+00', ''),
	('00000000-0000-0000-0000-000000000000', '7ac1f80c-5a25-487d-88f9-744364356232', '{"action":"token_revoked","actor_id":"db94d3da-b289-4f03-bd1a-01dca3132335","actor_username":"admin@precisionflow.us","actor_via_sso":false,"log_type":"token"}', '2025-04-30 23:09:57.077567+00', ''),
	('00000000-0000-0000-0000-000000000000', '8d4613a0-763d-4b1e-83ca-24ce98456e93', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"anh.tuan@precisionflow.us","user_id":"7e837f4e-343d-4a3d-ad2e-a4aaf0b6da63","user_phone":""}}', '2025-04-30 23:11:32.193952+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'fad6cb1e-a375-4ddd-b2b2-7fc24efa389b', 'authenticated', 'authenticated', 'luke.s@precisionflow.us', '$2a$10$9PrjgTDWGnGpE5SZW9/aAedB/nY/w/xwEBtMZSsiOXldWvsjQSLEy', '2025-04-18 23:19:52.19247+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-04-18 23:19:52.185025+00', '2025-04-18 23:19:52.19336+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '004601ee-eca2-4123-9ac6-355264c79797', 'authenticated', 'authenticated', 'adolfo.z@precisionflow.us', '$2a$10$fNEq/KEIXK/t84BK1z1.H.wRfw4oa8xlMonQfU3YrTcVbXmDB8Gka', '2025-04-22 18:37:14.334885+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-04-22 18:37:14.311615+00', '2025-04-22 18:37:14.3363+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'dbf9bcff-330f-42b6-a6a7-a3374a89c591', 'authenticated', 'authenticated', 'anh.t@precisionflow.us', '$2a$10$AhWAkYBHdDanOVCTNApY..9f4vzUt4tIuQraYm1QSLAH3T8jiu.ea', '2025-04-18 23:20:19.213193+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-04-18 23:22:45.615906+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-04-18 23:20:19.209525+00', '2025-04-18 23:22:45.619213+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'db94d3da-b289-4f03-bd1a-01dca3132335', 'authenticated', 'authenticated', 'admin@precisionflow.us', '$2a$10$kTiAwYjf6pHTBAeDdTOzz.MGOD0uRndGx7Tab.7ww6xTaId0nGucG', '2025-04-18 21:26:13.927413+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-04-24 04:42:09.947323+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-04-18 21:26:13.88194+00', '2025-04-30 23:09:57.094478+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '7e837f4e-343d-4a3d-ad2e-a4aaf0b6da63', 'authenticated', 'authenticated', 'anh.tuan@precisionflow.us', '$2a$10$Oj9Glafw.q1OECBLu3nTbePOK9wPp7IuiLQGhvOkZ3XffNrQCYZDu', '2025-04-30 23:11:32.198265+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-04-30 23:11:32.180283+00', '2025-04-30 23:11:32.200394+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('db94d3da-b289-4f03-bd1a-01dca3132335', 'db94d3da-b289-4f03-bd1a-01dca3132335', '{"sub": "db94d3da-b289-4f03-bd1a-01dca3132335", "email": "admin@precisionflow.us", "email_verified": false, "phone_verified": false}', 'email', '2025-04-18 21:26:13.911605+00', '2025-04-18 21:26:13.911663+00', '2025-04-18 21:26:13.911663+00', '6cee2683-c47c-433d-960d-2c69d0742da4'),
	('fad6cb1e-a375-4ddd-b2b2-7fc24efa389b', 'fad6cb1e-a375-4ddd-b2b2-7fc24efa389b', '{"sub": "fad6cb1e-a375-4ddd-b2b2-7fc24efa389b", "email": "luke.s@precisionflow.us", "email_verified": false, "phone_verified": false}', 'email', '2025-04-18 23:19:52.190056+00', '2025-04-18 23:19:52.19011+00', '2025-04-18 23:19:52.19011+00', '2927eeb7-43eb-4b6a-b9ae-ec14296559c1'),
	('dbf9bcff-330f-42b6-a6a7-a3374a89c591', 'dbf9bcff-330f-42b6-a6a7-a3374a89c591', '{"sub": "dbf9bcff-330f-42b6-a6a7-a3374a89c591", "email": "anh.t@precisionflow.us", "email_verified": false, "phone_verified": false}', 'email', '2025-04-18 23:20:19.211468+00', '2025-04-18 23:20:19.211521+00', '2025-04-18 23:20:19.211521+00', '36b370b0-8da1-4458-ba82-3f31a8c46888'),
	('004601ee-eca2-4123-9ac6-355264c79797', '004601ee-eca2-4123-9ac6-355264c79797', '{"sub": "004601ee-eca2-4123-9ac6-355264c79797", "email": "adolfo.z@precisionflow.us", "email_verified": false, "phone_verified": false}', 'email', '2025-04-22 18:37:14.327594+00', '2025-04-22 18:37:14.32765+00', '2025-04-22 18:37:14.32765+00', '82d846b4-dd66-4758-b7da-f22947cb87e5'),
	('7e837f4e-343d-4a3d-ad2e-a4aaf0b6da63', '7e837f4e-343d-4a3d-ad2e-a4aaf0b6da63', '{"sub": "7e837f4e-343d-4a3d-ad2e-a4aaf0b6da63", "email": "anh.tuan@precisionflow.us", "email_verified": false, "phone_verified": false}', 'email', '2025-04-30 23:11:32.191844+00', '2025-04-30 23:11:32.191898+00', '2025-04-30 23:11:32.191898+00', '17402b1e-eff6-4c6b-9553-56037a122aca');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('48161767-4715-42ae-9da5-b74295f5a8db', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-23 21:46:41.725906+00', '2025-04-30 23:09:57.104701+00', NULL, 'aal1', NULL, '2025-04-30 23:09:57.104616', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '50.47.6.217', NULL),
	('bcbe0950-0251-4b80-b177-475152f51658', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-23 04:27:59.879236+00', '2025-04-23 04:27:59.879236+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '50.54.216.68', NULL),
	('53c65248-958e-435d-95fd-fe671cad863d', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-23 22:18:35.266681+00', '2025-04-23 23:37:22.944223+00', NULL, 'aal1', NULL, '2025-04-23 23:37:22.944156', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '50.47.6.217', NULL),
	('5f803056-330d-43a1-aebc-4bc09d20f9f4', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-24 04:13:46.395513+00', '2025-04-24 04:13:46.395513+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '50.54.216.68', NULL),
	('4e084437-56b6-4a5f-b556-a9c865dba4a3', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-23 02:14:34.692751+00', '2025-04-24 04:25:52.115619+00', NULL, 'aal1', NULL, '2025-04-24 04:25:52.115552', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36', '50.54.216.68', NULL),
	('4da8e5f3-68c5-4f32-b40b-4f080a1ab0c9', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-24 04:42:09.947397+00', '2025-04-24 04:42:09.947397+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '50.54.216.68', NULL),
	('4f371176-a7a7-4812-aad6-84ca82a812a6', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-23 04:42:50.914768+00', '2025-04-25 02:07:21.535213+00', NULL, 'aal1', NULL, '2025-04-25 02:07:21.535137', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '50.54.216.68', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('4e084437-56b6-4a5f-b556-a9c865dba4a3', '2025-04-23 02:14:34.697231+00', '2025-04-23 02:14:34.697231+00', 'password', '10ba5ada-d4b8-4f29-a30a-ff0cb979dab6'),
	('bcbe0950-0251-4b80-b177-475152f51658', '2025-04-23 04:27:59.884075+00', '2025-04-23 04:27:59.884075+00', 'password', '9d7d0e90-b366-4734-8e94-96cf27a142bb'),
	('4f371176-a7a7-4812-aad6-84ca82a812a6', '2025-04-23 04:42:50.91857+00', '2025-04-23 04:42:50.91857+00', 'password', 'ac04d84b-6343-413d-a636-8f083750c9c6'),
	('48161767-4715-42ae-9da5-b74295f5a8db', '2025-04-23 21:46:41.768576+00', '2025-04-23 21:46:41.768576+00', 'password', '57c2fde9-2abc-4a6f-adfa-eb2dcb38e2dc'),
	('53c65248-958e-435d-95fd-fe671cad863d', '2025-04-23 22:18:35.273115+00', '2025-04-23 22:18:35.273115+00', 'password', 'f2089e63-fb1b-4964-a72a-790fe3a6be60'),
	('5f803056-330d-43a1-aebc-4bc09d20f9f4', '2025-04-24 04:13:46.402535+00', '2025-04-24 04:13:46.402535+00', 'password', '561be903-9c9c-4cab-92de-b1afba532b37'),
	('4da8e5f3-68c5-4f32-b40b-4f080a1ab0c9', '2025-04-24 04:42:09.953883+00', '2025-04-24 04:42:09.953883+00', 'password', 'a9b549c3-6d97-44da-a582-43835e2c0358');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 49, 'hBR1QdZGIQfQe-epORIq4A', 'db94d3da-b289-4f03-bd1a-01dca3132335', false, '2025-04-23 04:27:59.88154+00', '2025-04-23 04:27:59.88154+00', NULL, 'bcbe0950-0251-4b80-b177-475152f51658'),
	('00000000-0000-0000-0000-000000000000', 48, 'rWgooZ-5yeGUmyWTDxMC9A', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-23 02:14:34.693599+00', '2025-04-23 05:33:44.635131+00', NULL, '4e084437-56b6-4a5f-b556-a9c865dba4a3'),
	('00000000-0000-0000-0000-000000000000', 52, '-VRvoeQKmZcXLANoB-WF7A', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-23 21:46:41.740007+00', '2025-04-23 23:22:07.389827+00', NULL, '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 53, 'TVB1CyIwxsLHxOARqHsa7g', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-23 22:18:35.269798+00', '2025-04-23 23:37:22.940034+00', NULL, '53c65248-958e-435d-95fd-fe671cad863d'),
	('00000000-0000-0000-0000-000000000000', 55, 'XNq3bNwaC-2XK7fj1bhWlg', 'db94d3da-b289-4f03-bd1a-01dca3132335', false, '2025-04-23 23:37:22.941257+00', '2025-04-23 23:37:22.941257+00', 'TVB1CyIwxsLHxOARqHsa7g', '53c65248-958e-435d-95fd-fe671cad863d'),
	('00000000-0000-0000-0000-000000000000', 50, 'diJPNnsxlIe135J23QjLIg', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-23 04:42:50.916597+00', '2025-04-24 02:04:41.881046+00', NULL, '4f371176-a7a7-4812-aad6-84ca82a812a6'),
	('00000000-0000-0000-0000-000000000000', 51, 'woMSz4QVgqZ6x_OQSiKYig', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-23 05:33:44.638219+00', '2025-04-24 03:11:49.214498+00', 'rWgooZ-5yeGUmyWTDxMC9A', '4e084437-56b6-4a5f-b556-a9c865dba4a3'),
	('00000000-0000-0000-0000-000000000000', 56, 'c61xUdKxS0MkQGByS17hjg', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 02:04:41.88277+00', '2025-04-24 03:24:51.881481+00', 'diJPNnsxlIe135J23QjLIg', '4f371176-a7a7-4812-aad6-84ca82a812a6'),
	('00000000-0000-0000-0000-000000000000', 59, 'w0SkrelPmoUrzz1myDEK6Q', 'db94d3da-b289-4f03-bd1a-01dca3132335', false, '2025-04-24 04:13:46.399932+00', '2025-04-24 04:13:46.399932+00', NULL, '5f803056-330d-43a1-aebc-4bc09d20f9f4'),
	('00000000-0000-0000-0000-000000000000', 57, 'JYbBdF_aizV_W-VGfY6sAg', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 03:11:49.216321+00', '2025-04-24 04:25:52.112036+00', 'woMSz4QVgqZ6x_OQSiKYig', '4e084437-56b6-4a5f-b556-a9c865dba4a3'),
	('00000000-0000-0000-0000-000000000000', 60, 'aHFKqXMy9jI3c_LgEBFwdw', 'db94d3da-b289-4f03-bd1a-01dca3132335', false, '2025-04-24 04:25:52.112624+00', '2025-04-24 04:25:52.112624+00', 'JYbBdF_aizV_W-VGfY6sAg', '4e084437-56b6-4a5f-b556-a9c865dba4a3'),
	('00000000-0000-0000-0000-000000000000', 58, 'Wfj6gBpNc9CcUrk4VyMcJg', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 03:24:51.884382+00', '2025-04-24 04:36:52.746664+00', 'c61xUdKxS0MkQGByS17hjg', '4f371176-a7a7-4812-aad6-84ca82a812a6'),
	('00000000-0000-0000-0000-000000000000', 62, 'swCE_Oso2LBB8VEVf-lCjQ', 'db94d3da-b289-4f03-bd1a-01dca3132335', false, '2025-04-24 04:42:09.950312+00', '2025-04-24 04:42:09.950312+00', NULL, '4da8e5f3-68c5-4f32-b40b-4f080a1ab0c9'),
	('00000000-0000-0000-0000-000000000000', 54, 'BaIcPhlph60NrLxrie2UhA', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-23 23:22:07.391353+00', '2025-04-24 07:23:07.088982+00', '-VRvoeQKmZcXLANoB-WF7A', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 63, 'BN4SMTVaAhiMGbSNCEQofw', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 07:23:07.100858+00', '2025-04-24 08:23:09.8396+00', 'BaIcPhlph60NrLxrie2UhA', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 64, 'CYqIKodaLNYQKKNHtAUoRw', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 08:23:09.841384+00', '2025-04-24 09:23:20.496493+00', 'BN4SMTVaAhiMGbSNCEQofw', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 65, 'LTo-dRd2R_i9SLUFUQiwzw', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 09:23:20.497703+00', '2025-04-24 11:23:24.998954+00', 'CYqIKodaLNYQKKNHtAUoRw', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 66, 'H8DXPrNIIBzapOTOTDifMQ', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 11:23:25.001951+00', '2025-04-24 13:23:37.266008+00', 'LTo-dRd2R_i9SLUFUQiwzw', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 67, 'ztoAcUJjUjuznNny-vr_yw', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 13:23:37.267834+00', '2025-04-24 14:23:49.615668+00', 'H8DXPrNIIBzapOTOTDifMQ', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 68, 'Kq-G3R-vR6lNYy9TmxiagQ', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 14:23:49.617728+00', '2025-04-24 15:24:02.491738+00', 'ztoAcUJjUjuznNny-vr_yw', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 69, 'UXEbIYjtMT5gIVVamXZV-w', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 15:24:02.497571+00', '2025-04-24 16:24:12.863653+00', 'Kq-G3R-vR6lNYy9TmxiagQ', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 70, 'i1hgCF0T5NJRzuFl-4A-7w', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 16:24:12.865393+00', '2025-04-24 17:24:33.847802+00', 'UXEbIYjtMT5gIVVamXZV-w', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 71, 'SKEsXmrUQLHqAZgK1_JcLw', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 17:24:33.849685+00', '2025-04-24 18:24:39.919097+00', 'i1hgCF0T5NJRzuFl-4A-7w', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 72, '3UBXpTIJXob5BLXk0pcHgQ', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 18:24:39.921567+00', '2025-04-24 19:24:51.342547+00', 'SKEsXmrUQLHqAZgK1_JcLw', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 73, 'ODlFu1pI9fTTvm8JfyIohg', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 19:24:51.34441+00', '2025-04-24 20:24:58.274512+00', '3UBXpTIJXob5BLXk0pcHgQ', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 74, 'x8h6vwYxj79UNPO5peFqNw', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 20:24:58.277492+00', '2025-04-24 21:55:01.306714+00', 'ODlFu1pI9fTTvm8JfyIohg', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 75, 'ZCz6_3CBFq07anYpfcAxXA', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 21:55:01.309105+00', '2025-04-24 22:55:09.083017+00', 'x8h6vwYxj79UNPO5peFqNw', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 61, 'LRjroEg57cPQFHrVGx1kfw', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 04:36:52.747247+00', '2025-04-25 02:07:21.528992+00', 'Wfj6gBpNc9CcUrk4VyMcJg', '4f371176-a7a7-4812-aad6-84ca82a812a6'),
	('00000000-0000-0000-0000-000000000000', 77, 'vxowXRMXkFss8ZA0PHIQ4A', 'db94d3da-b289-4f03-bd1a-01dca3132335', false, '2025-04-25 02:07:21.532807+00', '2025-04-25 02:07:21.532807+00', 'LRjroEg57cPQFHrVGx1kfw', '4f371176-a7a7-4812-aad6-84ca82a812a6'),
	('00000000-0000-0000-0000-000000000000', 76, 'N3GdpvnYDjrFaeGpbyZT2A', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-24 22:55:09.085548+00', '2025-04-25 08:56:07.318623+00', 'ZCz6_3CBFq07anYpfcAxXA', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 78, 'NcbtDi4b9C4UrFh5-P3L4g', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-25 08:56:07.323182+00', '2025-04-25 09:56:13.143313+00', 'N3GdpvnYDjrFaeGpbyZT2A', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 79, '9f49EkuXo4_Fv8swahLGpw', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-25 09:56:13.146279+00', '2025-04-25 11:26:18.259442+00', 'NcbtDi4b9C4UrFh5-P3L4g', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 80, 'hXMtW_oVw5v_dMYEMakgwg', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-25 11:26:18.267787+00', '2025-04-25 12:26:29.629582+00', '9f49EkuXo4_Fv8swahLGpw', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 81, 'x7nAIeZNUercGTxYndBncw', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-25 12:26:29.632545+00', '2025-04-25 13:26:41.965862+00', 'hXMtW_oVw5v_dMYEMakgwg', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 82, 'fXB4NAX9VeLd-1jQ9LYfbQ', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-25 13:26:41.968845+00', '2025-04-25 14:26:50.095411+00', 'x7nAIeZNUercGTxYndBncw', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 83, 'QVoIuPId3D7xA_zNXu8h2Q', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-25 14:26:50.097407+00', '2025-04-25 15:57:02.523354+00', 'fXB4NAX9VeLd-1jQ9LYfbQ', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 84, 'kLwvrqQskC10TgcYpqO-wQ', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-25 15:57:02.52571+00', '2025-04-25 16:57:09.744861+00', 'QVoIuPId3D7xA_zNXu8h2Q', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 85, 'cQoN6CoUEpMZCJuerSZmYg', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-25 16:57:09.746155+00', '2025-04-25 18:27:16.207013+00', 'kLwvrqQskC10TgcYpqO-wQ', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 86, 'cPTSzOuscZKMjAjazDvxew', 'db94d3da-b289-4f03-bd1a-01dca3132335', true, '2025-04-25 18:27:16.208974+00', '2025-04-30 23:09:57.079348+00', 'cQoN6CoUEpMZCJuerSZmYg', '48161767-4715-42ae-9da5-b74295f5a8db'),
	('00000000-0000-0000-0000-000000000000', 87, 'qPHq2Xrl2MpgescE0pJmCQ', 'db94d3da-b289-4f03-bd1a-01dca3132335', false, '2025-04-30 23:09:57.088779+00', '2025-04-30 23:09:57.088779+00', 'cPTSzOuscZKMjAjazDvxew', '48161767-4715-42ae-9da5-b74295f5a8db');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."customers" ("id", "name", "company", "email", "phone", "address", "notes", "active", "created_at", "updated_at") VALUES
	('08e4cfdd-6057-430d-a015-4d61eec57051', 'Mike Hence', 'Hence Design Corp.', 'mike@hence.com', '32155666', '1010 Far Away Ave, City, WA 98270', NULL, true, '2025-04-16 03:18:36.66001+00', '2025-04-16 03:18:36.66001+00'),
	('e8dd3d40-ab62-43bb-8cf2-552f493ca0e2', 'Karen Lee', 'Airo Defense System', 'karen@ads.com', '213999777', '381 58th St SW, City, WA 98141', NULL, true, '2025-04-16 17:30:41.888721+00', '2025-04-16 17:30:41.888721+00'),
	('527429f3-5b26-4f30-bd21-d3f1599d1785', 'Bob Chaikin', 'Coridor Inc.', 'bchaikin@coridor.com', '987111111', '2937 King St W, Bombay, NJ 41814', NULL, true, '2025-04-17 03:15:37.531504+00', '2025-04-17 03:15:37.531504+00'),
	('b24773a5-a8f0-4a11-9b9e-23fdcc48e972', 'John Cena', 'Cena Metalworks', 'john.cena@cena.com', '999444777', '4611 Wee Woo St, Tahoma, IL 21931', NULL, true, '2025-04-21 04:19:36.254519+00', '2025-04-21 04:19:36.254519+00'),
	('af99ebbf-4c76-4237-af44-b269594b8b69', 'Rodolfo Gonzalez', 'Westwood', 'rodolfo@ww.com', NULL, NULL, NULL, true, '2025-04-23 02:13:38.180504+00', '2025-04-23 02:13:38.180504+00');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."roles" ("id", "name", "description", "created_at", "updated_at") VALUES
	('9c4bd813-fe33-48cb-9db9-10755df4cef8', 'Admin', 'Full system access', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('3cfb622a-2df3-4e9e-a734-f56592a20d45', 'Manager', 'Can manage team members and their permissions', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('da0017a4-faf1-4bd1-8542-6ff73b824822', 'Machinist', 'Shop floor worker with limited access', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('2a6ffd99-a79c-403c-ac93-8582893fc036', 'Staff', 'Regular staff member', '2025-04-18 04:40:33.104998+00', '2025-04-18 04:40:33.104998+00'),
	('ff758033-d3eb-4097-bba0-5766cff3f38c', 'Operator', 'Machine operator access', '2025-04-18 04:40:33.104998+00', '2025-04-18 04:40:33.104998+00');


--
-- Data for Name: user_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: group_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: parts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."parts" ("id", "name", "part_number", "description", "active", "materials", "setup_instructions", "machining_methods", "revision_number", "created_at", "updated_at", "archived", "archived_at", "archive_reason", "previous_revision_id", "customer_id") VALUES
	('bb0a1c69-d580-4509-b972-46345512c2fc', 'Test Part 1', 'TES-123', 'Test Part 1', false, '{}', 'Mill then Turn', 'Test Part 1', 'B', '2025-04-16 02:01:19.162696+00', '2025-04-16 02:03:26.146+00', true, '2025-04-16 02:03:43.936+00', 'Test Archiving a part', NULL, NULL),
	('4518d4a8-6d12-4d99-b47d-dbd8b36160c6', 'Turbine Blade Mounting Bracket', 'TB-2025-A', 'High-temperature resistant mounting bracket for gas turbine blade assembly', true, '{"Inconel 718","Stainless Steel 316"}', '1. Use 5-axis fixture #TB27\n2. Reference datum A for primary alignment', 'Operation 1: Face milling\nOperation 2: Contour milling', 'D', '2025-04-15 19:58:54.128729+00', '2025-04-16 20:28:06.47+00', false, NULL, NULL, NULL, NULL),
	('0b7ef7b4-d88d-4a97-949b-91aad18c3abe', 'Test Part 6', 'TES-600', '', true, '{}', NULL, NULL, '', '2025-04-21 05:34:55.185832+00', '2025-04-21 20:08:34.235+00', true, '2025-04-22 02:11:57.027+00', 'Test part done', NULL, 'b24773a5-a8f0-4a11-9b9e-23fdcc48e972'),
	('b8d5b213-c788-4d75-98df-4a5f7a244f1c', 'Hydraulic Manifold Block', 'HM-1042-B', 'Precision machined hydraulic manifold with complex internal channels', true, '{"Aluminum 6061-T6","Aluminum 7075-T6"}', '1. Use tombstone fixture #HT15\n2. Ensure all tooling is pre-set', 'Operation 1: Rough milling\nOperation 2: Precision boring', 'B', '2025-04-15 19:58:54.128729+00', '2025-04-22 05:01:11.222+00', false, NULL, NULL, NULL, 'e8dd3d40-ab62-43bb-8cf2-552f493ca0e2'),
	('9bcf1d2b-d47c-4f2d-bc93-159f3c616f2b', 'End Cap 17410', 'COR-17410', 'Bob Chaikin Part', true, '{"Steel PH15-5","Heat Treated 45HRC"}', NULL, NULL, '1.1', '2025-04-20 20:44:06.841673+00', '2025-04-22 05:01:30.389+00', false, NULL, NULL, NULL, '527429f3-5b26-4f30-bd21-d3f1599d1785'),
	('e34cb86e-7565-49ef-87bf-6d2457582db4', 'Radio Housing', 'TES-441', 'Radio Housing for 31941 Coridor Assembly', true, '{}', '', '', '4.2', '2025-04-17 03:16:33.183852+00', '2025-04-22 18:33:54.96+00', false, NULL, NULL, NULL, NULL),
	('b7976866-3822-4691-87c3-f0e78b50167b', 'Motor Gear Assembly', 'TEST-500', 'Motor Gear Assembly model 500 replacement for Cena Metalworks', true, '{Plastic}', NULL, NULL, '3.6', '2025-04-20 20:57:09.33146+00', '2025-04-22 18:34:34.457+00', false, NULL, NULL, NULL, NULL),
	('7d9d8e22-a92b-47a0-adaa-c276d03388ab', 'Test Part 3', 'TES-345', 'In House Part for stress testing.', true, '{}', 'Mill Turn', 'Mill Turn', 'A', '2025-04-16 02:30:41.600526+00', '2025-04-22 18:35:04.057+00', false, NULL, NULL, NULL, NULL);


--
-- Data for Name: work_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."work_orders" ("id", "work_order_number", "purchase_order_number", "customer_id", "part_id", "quantity", "status", "priority", "start_date", "due_date", "completed_date", "assigned_to_id", "notes", "archived", "archived_at", "archive_reason", "created_at", "updated_at", "use_operation_templates") VALUES
	('b639e757-378e-4aa3-a016-b92d8d1ef754', 'WO-160985', '25002', '08e4cfdd-6057-430d-a015-4d61eec57051', '7d9d8e22-a92b-47a0-adaa-c276d03388ab', 6544, 'In Progress', 'Low', '2025-05-14 00:00:00+00', '2025-06-19 00:00:00+00', NULL, NULL, NULL, true, '2025-04-16 04:32:18.34+00', 'Remove to update the operation', '2025-04-16 03:46:00.99673+00', '2025-04-16 03:46:00.99673+00', true),
	('49ac5126-ca3f-4640-a893-63261b0cd501', 'WO-584904', '25001', '08e4cfdd-6057-430d-a015-4d61eec57051', 'b8d5b213-c788-4d75-98df-4a5f7a244f1c', 500, 'Complete', 'Normal', '2025-04-17 00:00:00+00', '2025-06-25 00:00:00+00', '2025-04-16 03:45:02.421+00', NULL, NULL, true, '2025-04-16 04:32:27.384+00', 'Completed ', '2025-04-16 03:19:45.066548+00', '2025-04-16 03:19:45.066548+00', true),
	('3d13784f-c9e3-4450-b1dc-cc2fef6057bd', 'WO-140631', '25003', '08e4cfdd-6057-430d-a015-4d61eec57051', '7d9d8e22-a92b-47a0-adaa-c276d03388ab', 200, 'Not Started', 'Normal', '2025-04-18 00:00:00+00', '2025-04-30 00:00:00+00', NULL, NULL, NULL, true, '2025-04-16 18:46:06.65+00', 'Duplicate 1', '2025-04-16 18:45:40.694809+00', '2025-04-16 18:45:40.694809+00', true),
	('ecf8245b-d7c4-459c-87c5-caf696f0524e', 'WO-204611', '25003', '08e4cfdd-6057-430d-a015-4d61eec57051', '7d9d8e22-a92b-47a0-adaa-c276d03388ab', 200, 'Not Started', 'Normal', '2025-04-18 00:00:00+00', '2025-04-30 00:00:00+00', NULL, NULL, NULL, true, '2025-04-16 18:46:22.038+00', 'Duplicate 3', '2025-04-16 18:30:04.713699+00', '2025-04-16 18:30:04.713699+00', true),
	('3332ca72-670d-49b5-b0c5-7404214241df', 'WO-210177', '25003', '08e4cfdd-6057-430d-a015-4d61eec57051', '7d9d8e22-a92b-47a0-adaa-c276d03388ab', 200, 'Not Started', 'Normal', '2025-04-18 00:00:00+00', '2025-04-30 00:00:00+00', NULL, NULL, NULL, true, '2025-04-16 18:46:28.48+00', 'Duplicate 4', '2025-04-16 18:30:10.273346+00', '2025-04-16 18:30:10.273346+00', true),
	('e4732e6f-8eb8-45b5-a159-f5dac30ce600', 'WO-515890', '25008', 'e8dd3d40-ab62-43bb-8cf2-552f493ca0e2', 'b8d5b213-c788-4d75-98df-4a5f7a244f1c', 757, 'In Progress', 'Low', '2025-04-26 00:00:00+00', '2025-07-16 00:00:00+00', NULL, NULL, NULL, false, NULL, NULL, '2025-04-16 22:11:56.111508+00', '2025-04-16 22:11:56.111508+00', true),
	('98cc0d95-bd8c-4071-9cd1-6544bf70c2a0', 'WO-943240', '25006', 'e8dd3d40-ab62-43bb-8cf2-552f493ca0e2', 'b8d5b213-c788-4d75-98df-4a5f7a244f1c', 115, 'Complete', 'High', '2025-04-25 00:00:00+00', '2025-05-30 00:00:00+00', '2025-04-16 23:40:36.543+00', NULL, NULL, true, '2025-04-16 22:02:29.316+00', 'Testing inline edit method', '2025-04-16 20:39:03.359176+00', '2025-04-16 20:39:03.359176+00', true),
	('334c86a6-ebf1-4ba0-98f0-db48824231bb', 'WO-133759', '25004', 'e8dd3d40-ab62-43bb-8cf2-552f493ca0e2', '7d9d8e22-a92b-47a0-adaa-c276d03388ab', 1600, 'In Progress', 'High', '2025-04-17 00:00:00+00', '2025-04-28 00:00:00+00', NULL, NULL, NULL, false, NULL, NULL, '2025-04-16 19:18:53.846631+00', '2025-04-16 19:18:53.846631+00', true),
	('2a5d6cb0-c7af-4800-ab82-99be07a47294', 'WO-216297', '25012', 'b24773a5-a8f0-4a11-9b9e-23fdcc48e972', 'b7976866-3822-4691-87c3-f0e78b50167b', 77, 'Not Started', 'Normal', '2025-04-26 00:00:00+00', '2025-04-30 00:00:00+00', NULL, NULL, NULL, false, NULL, NULL, '2025-04-22 03:06:55.870426+00', '2025-04-22 03:06:55.870426+00', true),
	('9113640b-1c24-4e37-9ca9-adb2590510f3', 'WO-194278', '25013', '527429f3-5b26-4f30-bd21-d3f1599d1785', '9bcf1d2b-d47c-4f2d-bc93-159f3c616f2b', 15, 'Not Started', 'Normal', '2025-04-24 00:00:00+00', '2025-05-08 00:00:00+00', NULL, NULL, NULL, false, NULL, NULL, '2025-04-22 05:03:13.733526+00', '2025-04-22 05:03:13.733526+00', true),
	('cf29002f-693c-43a5-8ce9-eaefbdc36bea', 'WO-135711', '25003', '08e4cfdd-6057-430d-a015-4d61eec57051', '7d9d8e22-a92b-47a0-adaa-c276d03388ab', 200, 'Complete', 'Normal', '2025-04-18 00:00:00+00', '2025-04-30 00:00:00+00', '2025-04-22 05:46:12.886+00', NULL, NULL, true, '2025-04-16 18:46:13.645+00', 'Duplicate 2', '2025-04-16 18:45:35.842695+00', '2025-04-16 18:45:35.842695+00', true),
	('a4442cb2-a8da-40e6-ae90-f1e2600706a1', '25-25014', '25014', '08e4cfdd-6057-430d-a015-4d61eec57051', 'e34cb86e-7565-49ef-87bf-6d2457582db4', 145, 'Not Started', 'Urgent', '2025-04-20 00:00:00+00', '2025-04-25 00:00:00+00', NULL, NULL, NULL, false, NULL, NULL, '2025-04-22 05:44:17.020636+00', '2025-04-22 05:44:17.020636+00', true);


--
-- Data for Name: operations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."operations" ("id", "work_order_id", "name", "description", "status", "machining_methods", "setup_instructions", "estimated_start_time", "estimated_end_time", "actual_start_time", "actual_end_time", "assigned_to_id", "comments", "created_at", "updated_at", "sequence", "is_custom") VALUES
	('876ca05a-7ffd-43e0-853f-69f380e4c6d9', 'b639e757-378e-4aa3-a016-b92d8d1ef754', 'Turning', NULL, 'In Progress', NULL, NULL, '2025-04-17 20:48:00+00', '2025-04-17 20:48:00+00', '2025-04-16 03:49:25.45+00', NULL, NULL, NULL, '2025-04-16 03:48:23.019062+00', '2025-04-16 03:48:23.019062+00', 0, false),
	('9e9a3d59-cf6a-4f11-a7c4-dab463a88491', 'b639e757-378e-4aa3-a016-b92d8d1ef754', 'Programming', NULL, 'In Progress', NULL, NULL, '2025-04-15 20:47:00+00', '2025-04-16 20:47:00+00', '2025-04-16 03:49:30.527+00', NULL, NULL, NULL, '2025-04-16 03:47:34.717383+00', '2025-04-16 03:47:34.717383+00', 0, false),
	('23f0b0af-9d85-44fb-9ae9-2d4733b3781c', 'b639e757-378e-4aa3-a016-b92d8d1ef754', 'Final Inspection', NULL, 'In Progress', NULL, NULL, NULL, NULL, '2025-04-16 03:49:18.551+00', NULL, NULL, NULL, '2025-04-16 03:49:13.745861+00', '2025-04-16 03:49:13.745861+00', 0, false),
	('64a3108b-f22e-4c8e-bea9-d7ae4c5686f7', '98cc0d95-bd8c-4071-9cd1-6544bf70c2a0', 'Programming', 'Program part', 'Complete', 'Test 55', 'Test 66', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-16 20:39:03.545494+00', '2025-04-16 20:39:03.545494+00', 10, true),
	('7e12e21e-4b04-4dda-adb6-f00ebc42c479', '98cc0d95-bd8c-4071-9cd1-6544bf70c2a0', 'Saw', 'Cut raw material to 7 inches in lengths.', 'Not Started', 'SAW', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-16 20:39:03.545494+00', '2025-04-16 20:39:03.545494+00', 20, true),
	('a9cdd181-df78-4cc5-91ef-a7bbff14bfb1', '98cc0d95-bd8c-4071-9cd1-6544bf70c2a0', 'Turning', 'Rough & finish to pre-milling spec', 'In Progress', 'Mill Part', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-16 20:39:03.545494+00', '2025-04-16 20:39:03.545494+00', 30, true),
	('a87359e8-5945-4982-b692-7fa228a9ae2a', '98cc0d95-bd8c-4071-9cd1-6544bf70c2a0', 'Magnetic Inspection', NULL, 'Not Started', 'Inspect', 'Inspect Part - vendor', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-16 21:14:48.584146+00', '2025-04-16 21:14:48.584146+00', 40, true),
	('3f198558-8a47-487b-8d6f-3db6a303646f', 'e4732e6f-8eb8-45b5-a159-f5dac30ce600', 'Mill-Turn Programming', 'Program part', 'Complete', 'Test 55', 'Test New Operation Instruction 99 Test again For 4th time', NULL, NULL, NULL, NULL, NULL, 'Comments here', '2025-04-16 22:11:56.295153+00', '2025-04-21 04:58:23.295+00', 10, false),
	('b9c8569a-5878-4dfb-a189-70eae5699287', '2a5d6cb0-c7af-4800-ab82-99be07a47294', 'Saw ', 'Cut Part to 12" x 7" x 7"', 'Not Started', 'Raw Material handling', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-22 03:06:56.096769+00', '2025-04-22 03:06:56.096769+00', 10, false),
	('1b8405ec-55c2-40bb-9736-763228292cd6', '2a5d6cb0-c7af-4800-ab82-99be07a47294', '20', 'Mill Part to specs', 'Not Started', 'Mill 4 Axis', 'Rotovise', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-22 03:06:56.096769+00', '2025-04-22 03:06:56.096769+00', 50, false),
	('f8359f2b-6e45-40c5-bd80-928e9a7c49e5', '9113640b-1c24-4e37-9ca9-adb2590510f3', 'Programming', 'New Part For Bob Cor', 'Not Started', 'Program Part Complete', 'None', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-22 05:03:13.920497+00', '2025-04-22 05:03:13.920497+00', 10, false),
	('236d8c06-277d-450a-9e47-33e6de413361', 'e4732e6f-8eb8-45b5-a159-f5dac30ce600', 'Turning', 'Rough & finish to pre-milling spec', 'QC', 'Mill Part', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-16 22:11:56.295153+00', '2025-04-23 02:09:31.12+00', 30, false),
	('c90783ce-ce99-4b8b-95c0-190d5486c81b', 'a4442cb2-a8da-40e6-ae90-f1e2600706a1', 'Mill', 'Mill Part to specs', 'Not Started', 'Mill VF2', '16 vises on 4 axis table.', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-23 04:43:51.830752+00', '2025-04-23 05:14:17.207+00', 20, true),
	('364a6bb9-82ab-4352-8eff-55032230a739', 'e4732e6f-8eb8-45b5-a159-f5dac30ce600', 'Magnetic Inspection', 'Vendor: ABC', 'In Progress', 'Inspect part per drawing, flag note 2', 'No Set up', '2025-04-29 15:12:00+00', NULL, NULL, NULL, NULL, 'Lead time 7 days from received.', '2025-04-16 22:13:02.072369+00', '2025-04-16 22:30:36.646+00', 58, true),
	('b50e9e6d-4b11-4ad0-aeb1-3d2d5c4cb7da', '334c86a6-ebf1-4ba0-98f0-db48824231bb', 'OSP - Anodizing', 'Send to Vali to finish part', 'Not Started', 'OSP', 'No', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-20 20:35:59.582782+00', '2025-04-20 20:35:59.582782+00', 80, true),
	('4161d606-8787-4dab-bb15-d4d06dcb5337', 'e4732e6f-8eb8-45b5-a159-f5dac30ce600', 'Saw', 'Cut raw material to 7 inches in lengths.', 'Complete', 'SAW', 'Did it work 4/23 9:59PM? ->', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-16 22:11:56.295153+00', '2025-04-24 04:59:31.401+00', 15, false);


--
-- Data for Name: operation_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."operation_documents" ("id", "operation_id", "name", "url", "type", "size", "uploaded_at") VALUES
	('ec0d63f4-43d5-4336-aa27-2b65d1b543de', '3f198558-8a47-487b-8d6f-3db6a303646f', 'Screenshot 2025-01-01 204243.png', 'https://xydntmjbpdzcyjdumnrg.supabase.co/storage/v1/object/public/documents/operations/3f198558-8a47-487b-8d6f-3db6a303646f/1745211500891-Screenshot%202025-01-01%20204243.png', 'image/png', 364300, '2025-04-21 04:58:21.889581+00'),
	('cfb62bd8-8e41-4446-821c-8b968d7207a5', 'c90783ce-ce99-4b8b-95c0-190d5486c81b', 'E02-Cover Letter-SAIA-PA22025.pdf', 'https://xydntmjbpdzcyjdumnrg.supabase.co/storage/v1/object/public/documents/operations/c90783ce-ce99-4b8b-95c0-190d5486c81b/1745383466239-E02-Cover%20Letter-SAIA-PA22025.pdf', 'application/pdf', 21483, '2025-04-23 04:44:26.619+00'),
	('850e78d4-5c8e-47bb-9bd4-848530177a00', '4161d606-8787-4dab-bb15-d4d06dcb5337', '20200909_0_PUMA-TT2100SYY-2-scaled.jpg', 'https://xydntmjbpdzcyjdumnrg.supabase.co/storage/v1/object/public/documents/operations/4161d606-8787-4dab-bb15-d4d06dcb5337/1745446781341-20200909_0_PUMA-TT2100SYY-2-scaled.jpg', 'image/jpeg', 401825, '2025-04-23 22:19:41.873+00');


--
-- Data for Name: operation_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."operation_templates" ("id", "part_id", "name", "description", "machining_methods", "setup_instructions", "estimated_duration", "sequence", "created_at", "updated_at") VALUES
	('47fcb8aa-99c9-4f92-b7c2-8023026b1b0b', 'b8d5b213-c788-4d75-98df-4a5f7a244f1c', 'Turning', 'Rough & finish to pre-milling spec', 'Mill Part', NULL, 30, 30, '2025-04-16 20:32:34.204714+00', '2025-04-16 20:32:34.204714+00'),
	('e1bc95af-0e3a-434e-b881-85074f7b936c', 'b8d5b213-c788-4d75-98df-4a5f7a244f1c', 'Shipping', 'Pack part tightly to prevent damage', NULL, NULL, 5, 70, '2025-04-16 22:14:40.812391+00', '2025-04-16 22:14:40.812391+00'),
	('16f98f8e-a6a8-43fc-b31c-9ef6d1621e99', 'b7976866-3822-4691-87c3-f0e78b50167b', 'Saw ', 'Cut Part to 12" x 7" x 7"', 'Raw Material handling', NULL, 60, 10, '2025-04-21 04:11:16.944113+00', '2025-04-21 04:11:16.944113+00'),
	('2869fb64-3025-46de-852e-56f23475cc9f', 'b7976866-3822-4691-87c3-f0e78b50167b', '20', 'Mill Part to specs', 'Mill 4 Axis', 'Rotovise', 300, 50, '2025-04-21 04:11:49.928683+00', '2025-04-21 04:11:49.928683+00'),
	('61e9be75-75f4-40aa-831a-e5eed60b5c7b', 'b8d5b213-c788-4d75-98df-4a5f7a244f1c', 'Mill-Turn Programming', 'Program part', 'Test 55', 'Test New Operation Instruction 99 Test again For 4th time', NULL, 10, '2025-04-16 20:30:18.197479+00', '2025-04-20 20:48:23.031+00'),
	('f7128ff9-e56c-4b1e-b482-f60725460c7f', '9bcf1d2b-d47c-4f2d-bc93-159f3c616f2b', 'Programming', 'New Part For Bob Cor', 'Program Part Complete', 'None', 360, 10, '2025-04-21 20:43:02.52236+00', '2025-04-21 20:43:02.52236+00'),
	('233b1c36-3ecb-47ef-9c86-c8a254abd3f9', 'b8d5b213-c788-4d75-98df-4a5f7a244f1c', 'Milling', 'Mill on VF2 with 2 vise', 'OP1: Rough
OP2: Finish
OP3: Rotate Part', 'Fixture #56', 60, 60, '2025-04-23 02:07:14.018009+00', '2025-04-23 02:07:14.018009+00'),
	('2bd76bb7-fe3e-45c4-a655-cceb4bb73b46', 'e34cb86e-7565-49ef-87bf-6d2457582db4', 'Mill', 'Mill Part to specs', 'Mill VF2', '16 vises on 4 axis table.', NULL, 20, '2025-04-23 04:44:34.489538+00', '2025-04-23 05:14:17.439+00'),
	('98721dc3-28e6-4bf0-a0bc-bfd6480eb234', 'b8d5b213-c788-4d75-98df-4a5f7a244f1c', 'Saw', 'Cut raw material to 7 inches in lengths.', 'SAW', 'Did it work 4/23 9:59PM? ->', NULL, 15, '2025-04-16 20:31:09.912494+00', '2025-04-24 04:59:31.807+00');


--
-- Data for Name: part_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."part_documents" ("id", "part_id", "name", "url", "type", "uploaded_at", "size") VALUES
	('9766767f-9056-4c6e-a23e-77879e492694', '4518d4a8-6d12-4d99-b47d-dbd8b36160c6', 'Technical Drawing Rev A', 'https://example.com/drawing.pdf', 'drawing', '2025-04-15 19:58:54.128729+00', NULL),
	('f77647ca-8efe-4eb9-ae37-743e75be5559', 'e34cb86e-7565-49ef-87bf-6d2457582db4', '500779 Clevis Swivel Hook 50-70K Rev E.pdf', 'https://example.com/documents/e34cb86e-7565-49ef-87bf-6d2457582db4/1744862852428-500779 Clevis Swivel Hook 50-70K Rev E.pdf', 'application/pdf', '2025-04-17 04:07:32.02827+00', NULL),
	('618d5632-52a3-46c8-a479-e19a734d29eb', 'b8d5b213-c788-4d75-98df-4a5f7a244f1c', '148269.STEP', 'https://xydntmjbpdzcyjdumnrg.supabase.co/storage/v1/object/public/documents/parts/b8d5b213-c788-4d75-98df-4a5f7a244f1c/1745178606631-148269.STEP', 'application/step', '2025-04-20 19:50:06.882+00', 145912),
	('3b662f06-9ad4-439d-ad93-c8006d4321ae', 'b8d5b213-c788-4d75-98df-4a5f7a244f1c', '462199 Rev F.PDF', 'https://xydntmjbpdzcyjdumnrg.supabase.co/storage/v1/object/public/documents/parts/b8d5b213-c788-4d75-98df-4a5f7a244f1c/1745374070140-462199%20Rev%20F.PDF', 'application/pdf', '2025-04-23 02:07:48.917446+00', 140437);


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."permissions" ("id", "name", "description", "resource", "action", "created_at", "updated_at") VALUES
	('c6cf72a3-cfe1-45f1-bb55-54add5bfee65', 'ReadParts', 'Can view parts', 'parts', 'read', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('be2f8f7f-e0c3-4518-8e2f-addbfeb6acbb', 'WriteParts', 'Can create and update parts', 'parts', 'write', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('51f54771-1113-44b5-8007-309038960a1d', 'ReadWorkOrders', 'Can view work orders', 'work_orders', 'read', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('e86c2fc4-298c-4176-8b71-c8ab065a8adf', 'WriteWorkOrders', 'Can create and update work orders', 'work_orders', 'write', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('6b46d746-b7f6-4c5d-81ab-b48b43c0ae1b', 'ReadCustomers', 'Can view customers', 'customers', 'read', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('78876138-d479-4e3b-b731-617cfe553c37', 'WriteCustomers', 'Can create and update customers', 'customers', 'write', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('21ae6f97-a0b7-4449-9246-3f5117204244', 'ReadUsers', 'Can view users', 'users', 'read', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('1f3b787a-1f41-43f4-ba8f-ba0fe0187ab6', 'WriteUsers', 'Can create and update users', 'users', 'write', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('cd122f44-48d8-41fd-874d-d0e87eb542c0', 'ReadRoles', 'Can view roles', 'roles', 'read', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('73230843-55a2-4bc5-afe1-df0310ccdbfc', 'WriteRoles', 'Can create and update roles', 'roles', 'write', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('9a0227c0-2495-46c3-a26e-ee47f91b4a9d', 'ReadPermissions', 'Can view permissions', 'permissions', 'read', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('216a7bee-96d7-4227-ab55-1548f1cc1553', 'WritePermissions', 'Can create and update permissions', 'permissions', 'write', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('40873782-a3ca-487f-818d-487c4e0df01f', 'ReadUserRoles', 'Can view user roles', 'user_roles', 'read', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('6d50e00a-d837-450e-9b42-d2fa411a8a57', 'WriteUserRoles', 'Can assign user roles', 'user_roles', 'write', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('9b758bce-2253-4f4f-92e4-f717c8f41616', 'ReadProfiles', 'Can view user profiles', 'profiles', 'read', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('bc4196d8-2160-4fda-9cc6-0e78b567e311', 'WriteProfiles', 'Can update user profiles', 'profiles', 'write', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "first_name", "last_name", "job_title", "department", "manager_id", "created_at", "updated_at") VALUES
	('db94d3da-b289-4f03-bd1a-01dca3132335', NULL, NULL, NULL, NULL, NULL, '2025-04-18 21:26:13.876855+00', '2025-04-18 21:26:13.876855+00'),
	('fad6cb1e-a375-4ddd-b2b2-7fc24efa389b', NULL, NULL, NULL, NULL, NULL, '2025-04-18 23:19:52.184665+00', '2025-04-18 23:19:52.184665+00'),
	('dbf9bcff-330f-42b6-a6a7-a3374a89c591', NULL, NULL, NULL, NULL, NULL, '2025-04-18 23:20:19.209198+00', '2025-04-18 23:20:19.209198+00'),
	('004601ee-eca2-4123-9ac6-355264c79797', NULL, NULL, NULL, NULL, NULL, '2025-04-22 18:37:14.31127+00', '2025-04-22 18:37:14.31127+00'),
	('7e837f4e-343d-4a3d-ad2e-a4aaf0b6da63', NULL, NULL, NULL, NULL, NULL, '2025-04-30 23:11:32.177432+00', '2025-04-30 23:11:32.177432+00');


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."role_permissions" ("id", "role_id", "permission_id", "created_at", "updated_at") VALUES
	('20cc4646-7288-4218-ad38-68def9543275', '9c4bd813-fe33-48cb-9db9-10755df4cef8', 'c6cf72a3-cfe1-45f1-bb55-54add5bfee65', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('7bfdff69-e1b4-4c80-8208-bda91ce48b8a', '9c4bd813-fe33-48cb-9db9-10755df4cef8', 'be2f8f7f-e0c3-4518-8e2f-addbfeb6acbb', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('4d63266b-f429-4ea3-9ef0-0aa558075418', '9c4bd813-fe33-48cb-9db9-10755df4cef8', '51f54771-1113-44b5-8007-309038960a1d', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('e926a659-4b88-4544-aba9-bad160076731', '9c4bd813-fe33-48cb-9db9-10755df4cef8', 'e86c2fc4-298c-4176-8b71-c8ab065a8adf', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('48ddafc0-7b7c-4991-9c8d-3ca6840332c0', '9c4bd813-fe33-48cb-9db9-10755df4cef8', '6b46d746-b7f6-4c5d-81ab-b48b43c0ae1b', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('176206c8-5479-4172-9475-bde4dda2454b', '9c4bd813-fe33-48cb-9db9-10755df4cef8', '78876138-d479-4e3b-b731-617cfe553c37', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('90bd22f3-07c5-4fde-9ce5-2f6d9736f5c0', '9c4bd813-fe33-48cb-9db9-10755df4cef8', '21ae6f97-a0b7-4449-9246-3f5117204244', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('de1d5b37-7580-4db0-bce7-4393ccc45aab', '9c4bd813-fe33-48cb-9db9-10755df4cef8', '1f3b787a-1f41-43f4-ba8f-ba0fe0187ab6', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('0d19ec01-067e-4f36-ac6a-17076ff741a9', '9c4bd813-fe33-48cb-9db9-10755df4cef8', 'cd122f44-48d8-41fd-874d-d0e87eb542c0', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('69f6991d-a154-400c-b236-c34a07f1662a', '9c4bd813-fe33-48cb-9db9-10755df4cef8', '73230843-55a2-4bc5-afe1-df0310ccdbfc', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('7a9b4974-7f6f-495a-949e-b7d01c74ffd7', '9c4bd813-fe33-48cb-9db9-10755df4cef8', '9a0227c0-2495-46c3-a26e-ee47f91b4a9d', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('4f127f5d-a6cb-4bdc-9885-17494fdce884', '9c4bd813-fe33-48cb-9db9-10755df4cef8', '216a7bee-96d7-4227-ab55-1548f1cc1553', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('440dfe2b-a49d-4e36-a490-6f7708b7dd44', '9c4bd813-fe33-48cb-9db9-10755df4cef8', '40873782-a3ca-487f-818d-487c4e0df01f', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('ba7020bd-87c4-41d6-9db5-809282bddbbb', '9c4bd813-fe33-48cb-9db9-10755df4cef8', '6d50e00a-d837-450e-9b42-d2fa411a8a57', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('66314e6b-93d8-40c7-8b54-4d22a557936a', '9c4bd813-fe33-48cb-9db9-10755df4cef8', '9b758bce-2253-4f4f-92e4-f717c8f41616', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('83f52e21-36ec-485e-8cce-5d88526d6645', '9c4bd813-fe33-48cb-9db9-10755df4cef8', 'bc4196d8-2160-4fda-9cc6-0e78b567e311', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('41ec6c8c-7884-436e-a7a8-26f209830f98', '3cfb622a-2df3-4e9e-a734-f56592a20d45', 'c6cf72a3-cfe1-45f1-bb55-54add5bfee65', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('6bcb03f5-963c-4ba7-a822-347d244db6fa', '3cfb622a-2df3-4e9e-a734-f56592a20d45', 'be2f8f7f-e0c3-4518-8e2f-addbfeb6acbb', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('3506ed8b-3959-4499-b82c-63ce30652ea2', '3cfb622a-2df3-4e9e-a734-f56592a20d45', '51f54771-1113-44b5-8007-309038960a1d', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('c58cc1f2-9605-40be-a3ae-8c1d448ffa01', '3cfb622a-2df3-4e9e-a734-f56592a20d45', 'e86c2fc4-298c-4176-8b71-c8ab065a8adf', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('13f2a2d7-07a6-45f4-9902-b72b8a448085', '3cfb622a-2df3-4e9e-a734-f56592a20d45', '6b46d746-b7f6-4c5d-81ab-b48b43c0ae1b', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('f5e1e511-8c95-4ae4-ae6f-9872a81d3f1e', '3cfb622a-2df3-4e9e-a734-f56592a20d45', '78876138-d479-4e3b-b731-617cfe553c37', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('01d329bc-5be6-44c4-87fc-50af1e7787ba', '3cfb622a-2df3-4e9e-a734-f56592a20d45', '21ae6f97-a0b7-4449-9246-3f5117204244', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('7d03f69c-9664-47ec-8153-709d8a3a91cc', '3cfb622a-2df3-4e9e-a734-f56592a20d45', 'cd122f44-48d8-41fd-874d-d0e87eb542c0', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('bae40a57-db93-4048-a7ce-f9094f9b47dc', '3cfb622a-2df3-4e9e-a734-f56592a20d45', '9a0227c0-2495-46c3-a26e-ee47f91b4a9d', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('d0aa35b7-4e2e-48e1-ada9-c6df85c00896', '3cfb622a-2df3-4e9e-a734-f56592a20d45', '40873782-a3ca-487f-818d-487c4e0df01f', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('ab13b447-92f9-4fdf-af9c-834ae37474eb', '3cfb622a-2df3-4e9e-a734-f56592a20d45', '6d50e00a-d837-450e-9b42-d2fa411a8a57', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('a7f3a6da-8264-4028-a300-76ef3906b054', '3cfb622a-2df3-4e9e-a734-f56592a20d45', '9b758bce-2253-4f4f-92e4-f717c8f41616', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('ca380d7a-2a77-4639-9924-6e12749cacdc', 'da0017a4-faf1-4bd1-8542-6ff73b824822', 'c6cf72a3-cfe1-45f1-bb55-54add5bfee65', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00'),
	('6ac6afd8-a1cb-4491-a885-039f87358ccc', 'da0017a4-faf1-4bd1-8542-6ff73b824822', '51f54771-1113-44b5-8007-309038960a1d', '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00');


--
-- Data for Name: user_group_members; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "email", "role", "created_at") VALUES
	('db94d3da-b289-4f03-bd1a-01dca3132335', 'admin@precisionflow.us', 'Administrator', '2025-04-18 21:36:24.639562+00'),
	('fad6cb1e-a375-4ddd-b2b2-7fc24efa389b', 'luke.s@precisionflow.us', 'Operator', '2025-04-18 23:19:52.288503+00'),
	('004601ee-eca2-4123-9ac6-355264c79797', 'adolfo.z@precisionflow.us', 'Manager', '2025-04-22 18:37:14.397189+00'),
	('dbf9bcff-330f-42b6-a6a7-a3374a89c591', 'anh.t@precisionflow.us', 'Staff', '2025-04-18 23:20:19.277773+00'),
	('7e837f4e-343d-4a3d-ad2e-a4aaf0b6da63', 'anh.tuan@precisionflow.us', 'Manager', '2025-04-30 23:11:32.29298+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id") VALUES
	('documents', 'documents', NULL, '2025-04-17 04:49:30.47007+00', '2025-04-17 04:49:30.47007+00', true, false, NULL, NULL, NULL);


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") VALUES
	('93584efe-0c77-485f-8056-6e3fce88f3eb', 'documents', 'parts/b8d5b213-c788-4d75-98df-4a5f7a244f1c/1745126002347-148269.STEP', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-20 05:13:22.171707+00', '2025-04-20 05:13:22.171707+00', '2025-04-20 05:13:22.171707+00', '{"eTag": "\"62698b1eb656891c8588c20d06860bc9\"", "size": 145912, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-20T05:13:23.000Z", "contentLength": 145912, "httpStatusCode": 200}', 'cb4c1e62-6b5f-4f5c-9f97-f1de147535e7', 'db94d3da-b289-4f03-bd1a-01dca3132335', '{}'),
	('c3cca9d8-fe75-407d-a8e9-77a311bbf35b', 'documents', 'operations/3f198558-8a47-487b-8d6f-3db6a303646f/1745178269704-500779 Clevis Swivel Hook 50-70K Rev E.pdf', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-20 19:44:31.079303+00', '2025-04-20 19:44:31.079303+00', '2025-04-20 19:44:31.079303+00', '{"eTag": "\"d5ca2c86e6b4b24bdb7caef1c8cea60d\"", "size": 126884, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-04-20T19:44:32.000Z", "contentLength": 126884, "httpStatusCode": 200}', 'e3ac5ffb-adcc-4c47-9a8f-2ebcbaf4e3d0', 'db94d3da-b289-4f03-bd1a-01dca3132335', '{}'),
	('30a00158-7f64-417c-9b05-d7218d3aee94', 'documents', 'parts/b8d5b213-c788-4d75-98df-4a5f7a244f1c/1745178606631-148269.STEP', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-20 19:50:07.968922+00', '2025-04-20 19:50:07.968922+00', '2025-04-20 19:50:07.968922+00', '{"eTag": "\"62698b1eb656891c8588c20d06860bc9\"", "size": 145912, "mimetype": "application/octet-stream", "cacheControl": "max-age=3600", "lastModified": "2025-04-20T19:50:08.000Z", "contentLength": 145912, "httpStatusCode": 200}', '891bec24-8380-4fde-a5cf-e6dc5142ba5f', 'db94d3da-b289-4f03-bd1a-01dca3132335', '{}'),
	('217cf213-179a-44fe-a750-f2209b2ee423', 'documents', 'parts/b8d5b213-c788-4d75-98df-4a5f7a244f1c/1745178622207-500779 Clevis Swivel Hook 50-70K Rev E.pdf', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-20 19:50:23.647391+00', '2025-04-20 19:50:23.647391+00', '2025-04-20 19:50:23.647391+00', '{"eTag": "\"d5ca2c86e6b4b24bdb7caef1c8cea60d\"", "size": 126884, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-04-20T19:50:24.000Z", "contentLength": 126884, "httpStatusCode": 200}', '25af948f-9461-498f-a9d3-4b4c57c41da6', 'db94d3da-b289-4f03-bd1a-01dca3132335', '{}'),
	('ceaa23bf-6539-4049-aa6f-f87d84a938a0', 'documents', 'operations/3f198558-8a47-487b-8d6f-3db6a303646f/1745178660910-500779 Clevis Swivel Hook 50-70K Rev E.pdf', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-20 19:51:02.312501+00', '2025-04-20 19:51:02.312501+00', '2025-04-20 19:51:02.312501+00', '{"eTag": "\"d5ca2c86e6b4b24bdb7caef1c8cea60d\"", "size": 126884, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-04-20T19:51:03.000Z", "contentLength": 126884, "httpStatusCode": 200}', 'a61214e3-66dc-4d92-b6a6-595c61568d2a', 'db94d3da-b289-4f03-bd1a-01dca3132335', '{}'),
	('99deb61b-d44a-4498-ac8f-4a0c9bb8148d', 'documents', 'operations/3f198558-8a47-487b-8d6f-3db6a303646f/1745180809465-500779 Clevis Swivel Hook 50-70K Rev E.pdf', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-20 20:26:50.743635+00', '2025-04-20 20:26:50.743635+00', '2025-04-20 20:26:50.743635+00', '{"eTag": "\"d5ca2c86e6b4b24bdb7caef1c8cea60d\"", "size": 126884, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-04-20T20:26:51.000Z", "contentLength": 126884, "httpStatusCode": 200}', 'a552f0b3-b280-4bbc-855d-b721d1631a75', 'db94d3da-b289-4f03-bd1a-01dca3132335', '{}'),
	('df41cdb1-df3c-4b99-8d26-0fbda59d8aa0', 'documents', 'operations/3f198558-8a47-487b-8d6f-3db6a303646f/1745180817094-500779 Clevis Swivel Hook 50-70K Rev E.pdf', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-20 20:26:58.375417+00', '2025-04-20 20:26:58.375417+00', '2025-04-20 20:26:58.375417+00', '{"eTag": "\"d5ca2c86e6b4b24bdb7caef1c8cea60d\"", "size": 126884, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-04-20T20:26:59.000Z", "contentLength": 126884, "httpStatusCode": 200}', 'fa8f90aa-c946-461a-936f-a1f6ed0a87e1', 'db94d3da-b289-4f03-bd1a-01dca3132335', '{}'),
	('96a924fe-c81d-40ca-8cfd-fc3e083e349e', 'documents', 'parts/9bcf1d2b-d47c-4f2d-bc93-159f3c616f2b/1745181954597-462199 Rev F.PDF', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-20 20:45:56.171752+00', '2025-04-20 20:45:56.171752+00', '2025-04-20 20:45:56.171752+00', '{"eTag": "\"3ef2e08271c4a586119a009dd49533e0\"", "size": 140437, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-04-20T20:45:57.000Z", "contentLength": 140437, "httpStatusCode": 200}', 'ccd4317e-22a7-4f2a-be10-c65bc90baf86', 'db94d3da-b289-4f03-bd1a-01dca3132335', '{}'),
	('cc05aff6-a434-46e5-ae0d-c9a60d07ffce', 'documents', 'operations/3f198558-8a47-487b-8d6f-3db6a303646f/1745182504106-Screenshot 2025-01-01 203008.png', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-20 20:55:05.433158+00', '2025-04-20 20:55:05.433158+00', '2025-04-20 20:55:05.433158+00', '{"eTag": "\"6a794e9b0221ef2931719c2bfa6b12b1\"", "size": 309570, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-04-20T20:55:06.000Z", "contentLength": 309570, "httpStatusCode": 200}', '4e8d7c93-5892-4246-a1ea-c4962d0c1ff4', 'db94d3da-b289-4f03-bd1a-01dca3132335', '{}'),
	('85800c75-ff00-4316-be6d-911a56b1ef20', 'documents', 'operations/3f198558-8a47-487b-8d6f-3db6a303646f/1745211500891-Screenshot 2025-01-01 204243.png', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-21 04:58:21.78427+00', '2025-04-21 04:58:21.78427+00', '2025-04-21 04:58:21.78427+00', '{"eTag": "\"034f301bc9e1d8bf47c5c84b21458831\"", "size": 364300, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-04-21T04:58:22.000Z", "contentLength": 364300, "httpStatusCode": 200}', '80cce142-dc27-427c-b072-d3be57222157', 'db94d3da-b289-4f03-bd1a-01dca3132335', '{}'),
	('b8c70d4a-191e-42aa-918c-dbe605e4f282', 'documents', 'parts/b8d5b213-c788-4d75-98df-4a5f7a244f1c/1745374070140-462199 Rev F.PDF', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-23 02:07:48.790567+00', '2025-04-23 02:07:48.790567+00', '2025-04-23 02:07:48.790567+00', '{"eTag": "\"3ef2e08271c4a586119a009dd49533e0\"", "size": 140437, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-04-23T02:07:49.000Z", "contentLength": 140437, "httpStatusCode": 200}', 'fc461654-3b97-46f0-a4c2-02d63154d3a0', 'db94d3da-b289-4f03-bd1a-01dca3132335', '{}'),
	('adaacbc6-cd46-4a71-b7d0-650c1d2a4820', 'documents', 'operations/c90783ce-ce99-4b8b-95c0-190d5486c81b/1745383466239-E02-Cover Letter-SAIA-PA22025.pdf', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-23 04:44:24.616257+00', '2025-04-23 04:44:24.616257+00', '2025-04-23 04:44:24.616257+00', '{"eTag": "\"7dcce9cfa46a1e2501c2348327359493\"", "size": 21483, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-04-23T04:44:25.000Z", "contentLength": 21483, "httpStatusCode": 200}', '2e64204a-681b-421b-9cb8-c18ed96b84fd', 'db94d3da-b289-4f03-bd1a-01dca3132335', '{}'),
	('e881d871-3ae9-4149-813f-bf9e1902d0dc', 'documents', 'operations/4161d606-8787-4dab-bb15-d4d06dcb5337/1745446781341-20200909_0_PUMA-TT2100SYY-2-scaled.jpg', 'db94d3da-b289-4f03-bd1a-01dca3132335', '2025-04-23 22:19:41.895997+00', '2025-04-23 22:19:41.895997+00', '2025-04-23 22:19:41.895997+00', '{"eTag": "\"2a12b54a3a0a066d0f86a68e17ecc412\"", "size": 401825, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-23T22:19:42.000Z", "contentLength": 401825, "httpStatusCode": 200}', 'cb1b89c4-f26a-4bea-8d5b-6020127517bb', 'db94d3da-b289-4f03-bd1a-01dca3132335', '{}');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 87, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
