--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    room_id uuid NOT NULL,
    sender_id character varying NOT NULL,
    message text NOT NULL,
    message_type character varying DEFAULT 'text'::character varying,
    file_url character varying,
    file_name character varying,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.chat_messages OWNER TO neondb_owner;

--
-- Name: chat_rooms; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.chat_rooms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quote_id uuid NOT NULL,
    customer_id character varying NOT NULL,
    printer_id character varying NOT NULL,
    status character varying DEFAULT 'active'::character varying,
    last_message_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.chat_rooms OWNER TO neondb_owner;

--
-- Name: contracts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.contracts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    customer_id character varying NOT NULL,
    printer_id character varying NOT NULL,
    contract_number character varying NOT NULL,
    title character varying NOT NULL,
    description text,
    terms text NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    status character varying DEFAULT 'draft'::character varying NOT NULL,
    customer_signed_at timestamp without time zone,
    printer_signed_at timestamp without time zone,
    customer_signature text,
    printer_signature text,
    contract_pdf_path character varying,
    valid_until timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.contracts OWNER TO neondb_owner;

--
-- Name: files; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    filename character varying NOT NULL,
    original_name character varying NOT NULL,
    mime_type character varying NOT NULL,
    size integer NOT NULL,
    uploaded_by character varying NOT NULL,
    quote_id uuid,
    created_at timestamp without time zone DEFAULT now(),
    file_type character varying DEFAULT 'other'::character varying NOT NULL,
    status character varying DEFAULT 'uploading'::character varying NOT NULL,
    thumbnail_path character varying,
    dimensions character varying,
    color_profile character varying,
    resolution integer,
    has_transparency boolean DEFAULT false,
    page_count integer DEFAULT 1,
    processing_notes text,
    download_count integer DEFAULT 0,
    is_public boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now(),
    file_hash character varying,
    virus_scan_status character varying DEFAULT 'pending'::character varying,
    encryption_status character varying DEFAULT 'none'::character varying,
    retention_policy character varying DEFAULT 'standard'::character varying,
    last_accessed timestamp without time zone,
    access_count integer DEFAULT 0,
    ip_address character varying,
    user_agent character varying
);


ALTER TABLE public.files OWNER TO neondb_owner;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quote_id uuid NOT NULL,
    customer_id character varying NOT NULL,
    printer_id character varying NOT NULL,
    printer_quote_id uuid NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    status character varying DEFAULT 'pending_payment'::character varying NOT NULL,
    payment_status character varying DEFAULT 'pending'::character varying NOT NULL,
    tracking_number character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.orders OWNER TO neondb_owner;

--
-- Name: printer_quotes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.printer_quotes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quote_id uuid NOT NULL,
    printer_id character varying NOT NULL,
    price numeric(10,2) NOT NULL,
    estimated_days integer NOT NULL,
    notes text,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.printer_quotes OWNER TO neondb_owner;

--
-- Name: quotes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quotes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id character varying NOT NULL,
    type character varying NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    title character varying NOT NULL,
    description text,
    specifications jsonb NOT NULL,
    file_urls text[],
    deadline timestamp without time zone,
    budget numeric(10,2),
    selected_quote_id uuid,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.quotes OWNER TO neondb_owner;

--
-- Name: ratings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ratings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    customer_id character varying NOT NULL,
    printer_id character varying NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ratings OWNER TO neondb_owner;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    role character varying DEFAULT 'customer'::character varying NOT NULL,
    credit_balance numeric(10,2) DEFAULT 0.00,
    subscription_status character varying DEFAULT 'inactive'::character varying,
    subscription_expires_at timestamp without time zone,
    company_name character varying,
    company_description text,
    company_address text,
    company_phone character varying,
    rating numeric(3,2) DEFAULT 0.00,
    total_ratings integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    phone character varying,
    is_active boolean DEFAULT true,
    password character varying,
    last_login_at timestamp without time zone,
    permissions text[] DEFAULT '{}'::text[],
    two_factor_enabled boolean DEFAULT false,
    two_factor_secret text,
    gdpr_consent boolean DEFAULT false,
    gdpr_consent_date timestamp without time zone,
    data_retention_period integer DEFAULT 2555
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.chat_messages (id, room_id, sender_id, message, message_type, file_url, file_name, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: chat_rooms; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.chat_rooms (id, quote_id, customer_id, printer_id, status, last_message_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.contracts (id, order_id, customer_id, printer_id, contract_number, title, description, terms, total_amount, status, customer_signed_at, printer_signed_at, customer_signature, printer_signature, contract_pdf_path, valid_until, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.files (id, filename, original_name, mime_type, size, uploaded_by, quote_id, created_at, file_type, status, thumbnail_path, dimensions, color_profile, resolution, has_transparency, page_count, processing_notes, download_count, is_public, updated_at, file_hash, virus_scan_status, encryption_status, retention_policy, last_accessed, access_count, ip_address, user_agent) FROM stdin;
74d0caaa-ad41-41a4-9cda-1e64b54ec50a	dac469f821d8fb7e53054ce897fff933	DERMÄ°N 1 METRE.pdf	application/pdf	2780210	PRT-1749043658182-GLSYSM	\N	2025-06-04 19:07:54.607282	design	ready		Vector Rectangle	\N	\N	f	1	\N	0	f	2025-06-04 19:07:54.607282	\N	pending	none	standard	\N	0	\N	\N
c7e4ee87-99de-4072-aad1-3d6fbab90b47	8de74d5a066bdc2ca99cd086fc834027	VC 1 MT.pdf	application/pdf	4811979	PRT-1749043658182-GLSYSM	\N	2025-06-04 21:24:16.030458	design	warning		Vector Rectangle	\N	\N	f	1	PDF analyzed - 200x200mm rectangle shape	0	f	2025-06-04 21:24:16.030458	\N	pending	none	standard	\N	0	\N	\N
52ae2c34-a232-43f5-9017-0b146c8d4248	892269863dd0fdcfe22547c8426117de	TAKVA.pdf	application/pdf	467267	PRT-1749043658182-GLSYSM	\N	2025-06-04 21:24:49.953019	design	warning		Vector Rectangle	\N	\N	f	1	PDF analyzed - 320x450mm rectangle shape	0	f	2025-06-04 21:24:49.953019	\N	pending	none	standard	\N	0	\N	\N
884351ef-66f6-410f-b606-67d28637dd44	f13c2072404dfd9837d655df7590329b	DERMÄ°N VEST 1 METRE.pdf	application/pdf	2382816	PRT-1749043658182-GLSYSM	\N	2025-06-04 21:26:33.667739	design	warning		Vector Rectangle	\N	\N	f	1	PDF analyzed - 200x200mm rectangle shape	0	f	2025-06-04 21:26:33.667739	\N	pending	none	standard	\N	0	\N	\N
2e107972-f48d-4989-89dd-6fcd8ee83c85	a1a681c2bfaf10e55b3d6695eaf9d81c	HÄ°LTON YALDIZ.pdf	application/pdf	484133	PRT-1749043658182-GLSYSM	\N	2025-06-04 21:26:53.091164	design	warning		Vector Rectangle	\N	\N	f	1	PDF analyzed - 330x480mm rectangle shape	0	f	2025-06-04 21:26:53.091164	\N	pending	none	standard	\N	0	\N	\N
cf5b3250-dd27-4ec8-854d-4e884e3f0397	61bb490c806b155895c3c98bd65a75b4	KETTI1234.pdf	application/pdf	459109	PRT-1749043658182-GLSYSM	\N	2025-06-04 21:29:13.14232	design	ready		Vector Rectangle	\N	\N	f	1	PDF analyzed - 330x480mm rectangle shape	0	f	2025-06-04 21:29:13.14232	\N	pending	none	standard	\N	0	\N	\N
980cf233-e009-4b7c-97fe-fde1fe2f773b	4268b78dfc5341a4f79ad45a47b6f3ff	6 TBK.pdf	application/pdf	6466544	PRT-1749043658182-GLSYSM	\N	2025-06-04 21:31:56.364143	design	ready		Vector Rectangle	\N	\N	f	1	PDF analyzed - 200x200mm rectangle shape	0	f	2025-06-04 21:31:56.364143	\N	pending	none	standard	\N	0	\N	\N
97995187-e5b7-45ac-b40d-e3a751906721	8a86fa503bf3e18f1f79998d1fa1ba9c	KUÅE YALDIZ.pdf	application/pdf	4671772	PRT-1749043658182-GLSYSM	\N	2025-06-04 21:31:56.569662	design	ready		Vector Rectangle	\N	\N	f	1	PDF analyzed - 330x480mm rectangle shape	0	f	2025-06-04 21:31:56.569662	\N	pending	none	standard	\N	0	\N	\N
230358ef-69e1-4d47-9f37-011d3b2d0112	2a01145c5129b443c925b453f779dec0	50x30.pdf	application/pdf	373840	PRT-1749043658182-GLSYSM	\N	2025-06-04 21:34:16.169836	design	ready		Vector Rectangle	\N	\N	f	1	PDF analyzed - 50x30mm rectangle shape	0	f	2025-06-04 21:34:16.169836	\N	pending	none	standard	\N	0	\N	\N
0d460669-21f5-46b5-b856-15bedf0d4104	2228b9253ba463dba3e5744e1a3486d2	50x30.pdf	application/pdf	373840	PRT-1749043658182-GLSYSM	\N	2025-06-04 21:39:46.718635	design	ready		Vector Rectangle	\N	\N	f	1	PDF analyzed - 50x30mm rectangle shape	0	f	2025-06-04 21:39:46.718635	\N	pending	none	standard	\N	0	\N	\N
8ddb0fc6-e684-4cad-873d-d7662b037483	d2e772e2ab604a78734c422c98aea466	logo5.pdf	application/pdf	322740	PRT-1749043658182-GLSYSM	\N	2025-06-04 22:24:06.313104	design	ready		Vector Rectangle	\N	\N	f	1	PDF analyzed - 339x191mm rectangle shape	0	f	2025-06-04 22:24:06.313104	\N	pending	none	standard	\N	0	\N	\N
8e910c19-b19c-4cc4-9efd-7279bd5bbe83	70418c03e069c3a4e43f4d6845dd11f0	ozan logo yeni.pdf	application/pdf	74283	PRT-1749043658182-GLSYSM	\N	2025-06-04 22:30:06.289214	design	ready		Vector Rectangle	\N	\N	f	1	PDF analyzed - 210x297mm rectangle shape	0	f	2025-06-04 22:30:06.289214	\N	pending	none	standard	\N	0	\N	\N
44691900-0ded-4bab-97f8-85795223f71b	957dfed1547d18c4e1edd1ce454c5082	50x30.pdf	application/pdf	373840	PRT-1749043658182-GLSYSM	\N	2025-06-04 22:30:38.302093	design	ready		Vector Rectangle	\N	\N	f	1	PDF analyzed - 50x30mm rectangle shape	0	f	2025-06-04 22:30:38.302093	\N	pending	none	standard	\N	0	\N	\N
1d0db3d7-6dff-4dc0-90d4-90e02091998a	146a0f1eebf200943a90cbf673a2c8c9	Ä°RVHOME BAS.pdf	application/pdf	624094	PRT-1749043658182-GLSYSM	\N	2025-06-04 23:43:59.710467	design	ready		Vector Rectangle	\N	\N	f	1	PDF analyzed - 297x500mm rectangle shape	0	f	2025-06-04 23:43:59.710467	\N	pending	none	standard	\N	0	\N	\N
502fbb5b-02a4-45a6-ac89-02bb65e20a62	89e3a195dc30e9ea52d6e54505898ed2	BaÅlÄ±ksÄ±z-1.ai	application/postscript	1927819	PRT-1749043658182-GLSYSM	\N	2025-06-04 23:45:09.382013	design	ready		EPS Vector	CMYK	\N	f	1	EPS processed - 50x30mm	0	f	2025-06-04 23:45:09.382013	\N	pending	none	standard	\N	0	\N	\N
2d7a61cd-fcfe-427c-916b-f6b1e4dc8d15	62dcdf31ffda6f7c8c26262ecad9d6da	matbixx-dizim-2025-06-04 (3).pdf	application/pdf	1727	PRT-1749043658182-GLSYSM	\N	2025-06-05 00:13:08.884636	design	ready		Vector Rectangle	\N	\N	f	1	PDF analyzed - 330x480mm rectangle shape	0	f	2025-06-05 00:13:08.884636	\N	pending	none	standard	\N	0	\N	\N
ac546b88-a356-41de-aa9d-fdc5304ddb30	f1d891a654718795508b69cb0ec28263	matbixx-dizim-2025-06-04 (5).pdf	application/pdf	1727	PRT-1749043658182-GLSYSM	\N	2025-06-05 00:15:21.05765	design	ready		Vector Rectangle	\N	\N	f	1	PDF analyzed - 330x480mm rectangle shape	0	f	2025-06-05 00:15:21.05765	\N	pending	none	standard	\N	0	\N	\N
bbe22a54-500e-4db0-b0f0-cea1b51816e1	24a966790b823659f9905a212392dcba	50x30.pdf	application/pdf	373840	PRT-1749043658182-GLSYSM	\N	2025-06-05 00:28:14.271358	design	ready		Vector Rectangle	\N	\N	f	1	PDF analyzed - 50x30mm rectangle shape	0	f	2025-06-05 00:28:14.271358	\N	pending	none	standard	\N	0	\N	\N
558eef8b-d032-45f4-ada9-585ded0ed2fa	d05640230e470946384e29c8e9ba784b	BaÅlÄ±ksÄ±z-1.ai	application/postscript	1927819	PRT-1749043658182-GLSYSM	\N	2025-06-05 00:54:03.543089	design	ready		Unknown	\N	\N	f	1	EPS file processed	0	f	2025-06-05 00:54:03.543089	\N	pending	none	standard	\N	0	\N	\N
713aeaab-91fb-4aec-b5fc-f666a84c2305	08fd2c458171faa23f5ec2fc4e10bb6e	700 Gr TatlÄ±.pdf	application/pdf	690846	PRT-1749043658182-GLSYSM	\N	2025-06-05 00:56:45.722706	design	ready		Vector Rectangle	\N	\N	f	1	PDF analyzed - 99x400mm rectangle shape	0	f	2025-06-05 00:56:45.722706	\N	pending	none	standard	\N	0	\N	\N
5fe6aec0-8719-44f2-b483-bc6eb130594d	3ae04a75ee08abfd952fd3a515420c86	5 ER TABAKA.pdf	application/pdf	5510644	PRT-1749043658182-GLSYSM	\N	2025-06-05 00:59:36.319794	design	ready		Vector Rectangle	\N	\N	f	1	PDF analyzed - 216x279mm rectangle shape	0	f	2025-06-05 00:59:36.319794	\N	pending	none	standard	\N	0	\N	\N
66789444-d871-42b3-923e-2833ad3a3e5b	02fcba30c9b17757f544876717b0698f	6 TBK.pdf	application/pdf	6466544	PRT-1749043658182-GLSYSM	\N	2025-06-05 00:59:36.379926	design	ready		Vector Rectangle	\N	\N	f	1	PDF analyzed - 330x700mm rectangle shape	0	f	2025-06-05 00:59:36.379926	\N	pending	none	standard	\N	0	\N	\N
10667421-ca0b-411f-b0e4-9b05b648621c	51dbe12ee32d6e3628123bed5d65b740	7 TBK.pdf	application/pdf	5442927	PRT-1749043658182-GLSYSM	\N	2025-06-05 00:59:36.436583	design	ready		Vector Rectangle	\N	\N	f	1	PDF analyzed - 330x700mm rectangle shape	0	f	2025-06-05 00:59:36.436583	\N	pending	none	standard	\N	0	\N	\N
cdce36fd-d5ee-430f-aee7-ea37d3bb7eda	53695f5ccd08fc6c979fe754b9003b30	KARTVÄ°ZT.ai	application/postscript	788612	PRT-1749043658182-GLSYSM	\N	2025-06-05 01:13:02.236333	design	warning		Unknown	\N	\N	f	1	File integrity check failed	0	f	2025-06-05 01:13:02.236333	\N	pending	none	standard	\N	0	\N	\N
2ad59947-0f6d-4fc8-97cf-c6f3c14c4279	e080f4afe1926158c202129b0aed948c	BaÅlÄ±ksÄ±z-1.ai	application/postscript	1927819	PRT-1749043658182-GLSYSM	\N	2025-06-05 01:17:10.369472	design	ready		Unknown	CMYK	\N	f	1	EPS/AI processed: 210x297mm	0	f	2025-06-05 01:17:10.369472	\N	pending	none	standard	\N	0	\N	\N
5fb2434b-69cc-47d4-8f0f-fb4233b90c89	81baebce9bf8735a622fddaf0caf27d7	BaÅlÄ±ksÄ±z-1.ai	application/postscript	1927819	PRT-1749043658182-GLSYSM	\N	2025-06-05 01:22:01.941692	design	ready		Unknown	CMYK	\N	f	1	EPS/AI processed: 210x297mm	0	f	2025-06-05 01:22:01.941692	\N	pending	none	standard	\N	0	\N	\N
7a962726-f0d1-4a67-b449-af9cfcda7e5e	590945dcdf3fd32d1449a76d9d809aa2	HÄ°LTON 1.pdf	application/pdf	110112	PRT-1749043658182-GLSYSM	\N	2025-06-05 01:30:43.360061	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 60×40mm	0	f	2025-06-05 01:30:43.360061	\N	pending	none	standard	\N	0	\N	\N
8af6937e-49b3-4a9a-85f2-1156ea443e7e	a59122a406677069412f8ee5d89b6ddb	50x30.pdf	application/pdf	373840	PRT-1749043658182-GLSYSM	\N	2025-06-05 01:34:29.781021	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 50×30mm	0	f	2025-06-05 01:34:29.781021	\N	pending	none	standard	\N	0	\N	\N
a4942cf9-a158-4686-b542-15ce33b3cb52	9023f0595ab0986d3b25e8ebe95ea33f	HÄ°LTON 1.pdf	application/pdf	110112	PRT-1749043658182-GLSYSM	\N	2025-06-05 01:43:00.520353	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 60×40mm	0	f	2025-06-05 01:43:00.520353	\N	pending	none	standard	\N	0	\N	\N
8d9185e8-33c4-45d9-bdc1-735983dbec30	94b26b189d4eb3a9bb58ccf6dc15ca2c	50x30.pdf	application/pdf	373840	PRT-1749043658182-GLSYSM	\N	2025-06-05 01:45:02.473142	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 50×30mm	0	f	2025-06-05 01:45:02.473142	\N	pending	none	standard	\N	0	\N	\N
5f087de5-1014-457a-9b5d-46d9bbeb4d4d	e258eb1e017b6787417841971cddc0e9	50x30.pdf	application/pdf	373840	PRT-1749043658182-GLSYSM	\N	2025-06-05 01:45:40.051623	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 50×30mm	0	f	2025-06-05 01:45:40.051623	\N	pending	none	standard	\N	0	\N	\N
9ededb41-3b75-491b-b713-1025216df9e9	49dc6157dc2bdf6d5a4e7460faae3989	50x30.pdf	application/pdf	373840	PRT-1749043658182-GLSYSM	\N	2025-06-05 01:47:46.088578	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 50×30mm	0	f	2025-06-05 01:47:46.088578	\N	pending	none	standard	\N	0	\N	\N
4e5679e7-9b5f-4f1f-b30a-010d3f61291b	34a15985140a95211aee588f30ba08c4	50x30.pdf	application/pdf	373840	PRT-1749043658182-GLSYSM	\N	2025-06-05 01:49:24.144977	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 50×30mm	0	f	2025-06-05 01:49:24.144977	\N	pending	none	standard	\N	0	\N	\N
3f56b9fc-8d4e-4bff-af7e-2fcd0c83fe76	456759da303ccd0f92ba27f9da0c3534	50x30.pdf	application/pdf	373840	PRT-1749043658182-GLSYSM	\N	2025-06-05 11:22:29.504824	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 50×30mm	0	f	2025-06-05 11:22:29.504824	\N	pending	none	standard	\N	0	\N	\N
a3635412-8341-48e6-9111-246ccdc1e955	29a3cf258cec0506e4a0005aff200ed2	50x30.pdf	application/pdf	373840	PRT-1749043658182-GLSYSM	\N	2025-06-05 11:31:18.926137	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 50×30mm	0	f	2025-06-05 11:31:18.926137	\N	pending	none	standard	\N	0	\N	\N
08db6bb8-8cfd-4b76-b8ae-8f331a41ffc4	0869d4c05e7386f0e8863b89e5802350	HÄ°LTON 1.pdf	application/pdf	110112	PRT-1749043658182-GLSYSM	\N	2025-06-05 12:24:27.638658	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 60×40mm	0	f	2025-06-05 12:24:27.638658	\N	pending	none	standard	\N	0	\N	\N
43edcc0a-92f1-44ca-9314-6b9578a94fd6	f5ea8c0cd10fdb0cf28fb20c3425a43b	HÄ°LTON 1.pdf	application/pdf	110112	PRT-1749043658182-GLSYSM	\N	2025-06-05 12:31:56.943269	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 60×40mm	0	f	2025-06-05 12:31:56.943269	\N	pending	none	standard	\N	0	\N	\N
84c4af6d-0bda-42a7-ab05-0633da0b6ade	d25f61ee7c7bfca180269dcdf6aa95bf	50x30.pdf	application/pdf	373840	PRT-1749043658182-GLSYSM	\N	2025-06-05 12:38:15.259415	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 50×30mm	0	f	2025-06-05 12:38:15.259415	\N	pending	none	standard	\N	0	\N	\N
325dfe45-4a66-4690-a0a6-92dd832116bb	cbae459dda504fd4203c8d899d6758d3	50x30.pdf	application/pdf	373840	PRT-1749043658182-GLSYSM	\N	2025-06-05 12:54:55.370645	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 50×30mm	0	f	2025-06-05 12:54:55.370645	\N	pending	none	standard	\N	0	\N	\N
2629ac9b-c5b9-4625-8692-d1c13209bf8a	d2f9245b2be8c0fece9b625d34c0726a	HÄ°LTON YALDIZ.pdf	application/pdf	484133	PRT-1749043658182-GLSYSM	\N	2025-06-05 12:58:44.571083	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 330×480mm	0	f	2025-06-05 12:58:44.571083	\N	pending	none	standard	\N	0	\N	\N
e2c1ebe6-67d8-46d2-a831-995623c255d4	c75b2a4e666f0a92c34e2af9ff924eda	ysf 300gr.pdf	application/pdf	417360	PRT-1749043658182-GLSYSM	\N	2025-06-05 13:08:03.768515	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 320×450mm	0	f	2025-06-05 13:08:03.768515	\N	pending	none	standard	\N	0	\N	\N
8a1e416d-aea9-474f-9eb6-2a394544816a	ac75d4fcc0737f2df235ec813bdbd649	KETTI1234.pdf	application/pdf	459109	PRT-1749043658182-GLSYSM	\N	2025-06-05 13:38:58.873314	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 330×480mm	0	f	2025-06-05 13:38:58.873314	\N	pending	none	standard	\N	0	\N	\N
621df831-e97a-49df-aec0-02ed98e64cb9	19ec6b3d5551d7ef4e80279325b1d624	50x30.pdf	application/pdf	373840	PRT-1749043658182-GLSYSM	\N	2025-06-05 13:43:15.301101	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 50×30mm	0	f	2025-06-05 13:43:15.301101	\N	pending	none	standard	\N	0	\N	\N
b9f76c4a-941a-4f87-8c32-2e3ff0b19637	d45e9134bbacb976e22688c7018efe8d	KARTVÄ°ZT.ai	application/postscript	788612	PRT-1749043658182-GLSYSM	\N	2025-06-05 13:47:15.559765	design	ready		Vector Document	CMYK	\N	f	1	EPS file processed	0	f	2025-06-05 13:47:15.559765	\N	pending	none	standard	\N	0	\N	\N
d046c48b-a781-4829-8d36-f0cb5650e5aa	7d791c0d04aabc2b22e8e481c63387ab	KETTI1234.pdf	application/pdf	459109	PRT-1749043658182-GLSYSM	\N	2025-06-05 14:13:50.585215	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 330×480mm	0	f	2025-06-05 14:13:50.585215	\N	pending	none	standard	\N	0	\N	\N
720cb187-522f-4a6c-803e-1c733fb1e6c1	98eb568e87c831b5469e55229f6c98ca	HÄ°LTON 1.pdf	application/pdf	110112	PRT-1749043658182-GLSYSM	\N	2025-06-05 14:23:55.039186	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 60×40mm	0	f	2025-06-05 14:23:55.039186	\N	pending	none	standard	\N	0	\N	\N
1b2ec481-4991-4e7c-b011-d06524b378bb	c5819fdd58bb6c04cfb6d4275e256294	50x30.pdf	application/pdf	373840	PRT-1749043658182-GLSYSM	\N	2025-06-05 14:31:54.007267	design	ready		Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 50×30mm	0	f	2025-06-05 14:31:54.007267	\N	pending	none	standard	\N	0	\N	\N
3ba58022-f5af-4035-81eb-7abb4b995eb8	95a8606aa969f8c5596d4fe68c78d593	5 ER TABAKA.pdf	application/pdf	5510644	CUS-TEST-001	\N	2025-06-09 17:02:48.613	document	ready	\N	\N	\N	\N	f	1	\N	0	f	2025-06-09 17:02:48.613	\N	pending	none	standard	\N	0	\N	\N
acde1000-f346-44f1-bb77-6da4c8a3be8b	16b77c7de2e1b282aa93ede67bed5b77	7 TBK.pdf	application/pdf	5442927	CUS-TEST-001	\N	2025-06-09 17:05:53.104	document	ready	\N	Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 330×700mm	0	f	2025-06-09 17:05:53.255	\N	pending	none	standard	\N	0	\N	\N
55a6dad5-fe31-4608-a184-561ce2ccb553	36bcfd254db2f32c0d9ac12b4d2c5507	5 ER TABAKA.pdf	application/pdf	5510644	CUS-TEST-001	\N	2025-06-09 17:13:19.477	document	ready	\N	Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 216×279mm	0	f	2025-06-09 17:13:19.649	\N	pending	none	standard	\N	0	\N	\N
5b3d4d40-1158-40c1-b0f7-c61a44063c06	99c57edf6b16fd8038fdb5f3d7d9c944	02.03.2020.pdf	application/pdf	51740	CUS-TEST-001	\N	2025-06-09 17:14:06.94	document	ready	\N	Vector Document	CMYK	\N	f	1	PDF analyzed via MediaBox: 210×297mm	0	f	2025-06-09 17:14:07.083	\N	pending	none	standard	\N	0	\N	\N
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.orders (id, quote_id, customer_id, printer_id, printer_quote_id, total_amount, status, payment_status, tracking_number, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: printer_quotes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.printer_quotes (id, quote_id, printer_id, price, estimated_days, notes, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.quotes (id, customer_id, type, status, title, description, specifications, file_urls, deadline, budget, selected_quote_id, created_at, updated_at) FROM stdin;
011d7be5-c993-4553-9a22-e6ab811f8e89	CUS-TEST-001	general_printing	pending	reterter	324234234	{"printType": "poster", "uploadedFiles": []}	\N	2026-05-15 00:00:00	5500.00	\N	2025-06-09 10:06:07.14571	2025-06-09 10:06:07.14571
6f16fab4-b59a-40b8-9324-cf1abf00d212	CUS-TEST-001	general_printing	pending	3432432	234234234	{"foilType": "gold", "printSize": "custom", "printType": "magazine", "printColor": "pantone", "printPaper": "kraft", "printQuantity": "5000", "uploadedFiles": []}	\N	2025-05-18 00:00:00	450000.00	\N	2025-06-09 10:06:46.175849	2025-06-09 10:06:46.175849
1809c70f-1c89-4e77-9615-cb8bbe83d243	CUS-TEST-001	roll_label	pending	ewrwer		{"adhesive": "freezer", "material": "pp-transparent", "rollSize": "50x30", "labelType": "thermal-transfer", "coreDiameter": "40", "totalQuantity": "5000", "uploadedFiles": [], "perforationGap": "custom", "windingDirection": "in"}	\N	2025-12-18 00:00:00	324234.00	\N	2025-06-09 10:09:04.770685	2025-06-09 10:09:04.770685
405632f8-9c9e-4696-a6db-82f540d96316	CUS-TEST-001	roll_label	pending	4		{"adhesive": "removable", "material": "pp-white", "rollSize": "50x30", "labelType": "thermal-transfer", "coreDiameter": "40", "totalQuantity": "5000", "uploadedFiles": [], "perforationGap": "3", "windingDirection": "in"}	\N	2026-08-18 00:00:00	444.00	\N	2025-06-09 10:25:36.055707	2025-06-09 10:25:36.055707
6cbe8df1-8686-431d-882d-d291fc38f99e	CUS-TEST-001	sheet_label	pending	ewrewr	23424	{"size": "15x20", "color": "pantone", "cutting": "die-cut", "foilType": "gold", "quantity": "500", "packaging": "individual", "paperType": "sticker-transparent", "customWidth": "33", "customHeight": "33", "uploadedFiles": []}	\N	\N	NaN	\N	2025-06-09 10:34:00.350841	2025-06-09 10:34:00.350841
df738897-6e9a-4658-963a-cff800bd0988	CUS-TEST-001	sheet_label	pending	ewrewr	23424	{"size": "15x20", "color": "pantone", "cutting": "die-cut", "foilType": "gold", "quantity": "500", "packaging": "individual", "paperType": "sticker-white", "customWidth": "33", "customHeight": "33", "uploadedFiles": []}	\N	\N	NaN	\N	2025-06-09 10:34:00.444283	2025-06-09 10:34:00.444283
c3cfa036-f7c7-4a2a-8bab-ecc0d5b8d5e2	CUS-TEST-001	sheet_label	pending	ererre	weew	{"size": "20x30", "color": "4-4", "quantity": "100", "paperType": "coated-90", "uploadedFiles": []}	\N	2026-06-18 00:00:00	50000.00	\N	2025-06-10 12:53:00.812487	2025-06-10 12:53:00.812487
fe0944da-e6e4-4454-be19-c8b99452438c	CUS-TEST-001	sheet_label	pending	werwer		{"paperType": "coated-90", "uploadedFiles": []}	\N	\N	324234.00	\N	2025-06-10 12:59:29.488735	2025-06-10 12:59:29.488735
\.


--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ratings (id, order_id, customer_id, printer_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
w1QAMcz1Kf1_zkwKcuM-Po_1BZYad1wm	{"user": {"id": "PRT-TEST-001", "role": "printer", "email": "printer@test.com", "lastName": "Matbaa", "firstName": "Test", "companyName": "Test Matbaası", "creditBalance": "0.00", "profileImageUrl": null, "subscriptionStatus": "active"}, "cookie": {"path": "/", "secure": false, "expires": "2025-06-17T13:46:59.132Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-06-17 17:02:19
t0BoN3WbIll8aKmf9lbTY0JaLaZv5ury	{"cookie": {"path": "/", "secure": true, "expires": "2025-06-10T19:58:49.183Z", "httpOnly": true, "originalMaxAge": 604800000}, "replit.com": {"code_verifier": "qH6D_akaai8SKGxUaCwPl5E2jRec7d7ak1moM2VpoUA"}}	2025-06-10 20:01:58
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, first_name, last_name, profile_image_url, role, credit_balance, subscription_status, subscription_expires_at, company_name, company_description, company_address, company_phone, rating, total_ratings, created_at, updated_at, phone, is_active, password, last_login_at, permissions, two_factor_enabled, two_factor_secret, gdpr_consent, gdpr_consent_date, data_retention_period) FROM stdin;
customer_dev-user-1749034834845	asdfsadfsfdsaf@gmail.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-04 11:00:34.864585	2025-06-04 11:00:34.864585	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
customer_dev-user-1749035110035	asdfsdaf@gmail.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-04 11:05:10.054763	2025-06-04 11:05:10.054763	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
PRT-1749037737494-E603AD	dasfdsafdsfa@gmailc.om	asdfsadfsadf	sdafdsdaf	\N	printer	0.00	active	\N	qweqweqwe	\N	wqeqweqwe, qweqweqwe wqeqwe	\N	0.00	0	2025-06-04 11:48:57.517716	2025-06-04 11:48:57.517716	05383554785	t	\N	\N	{}	f	\N	f	\N	2555
CUS-1749037814861-NJC0IF	dsfsdfsfsdf@gmail.com	babafdbf	adfasdfsda	\N	customer	1000.00	inactive	\N	asdasdasd	\N	adsfsaf, asdfsafsda dsafsdaf	\N	0.00	0	2025-06-04 11:50:14.879719	2025-06-04 11:50:14.879719	05383554785	t	\N	\N	{}	f	\N	f	\N	2555
PRT-1749043658182-GLSYSM	hakan@gmail.com	Hakan	Can	\N	printer	0.00	active	\N	Reptum Print	\N	aadsasdsa, wadasasd asdasdasd	\N	0.00	0	2025-06-04 13:27:38.202443	2025-06-04 13:27:38.202443	5383554785	t	\N	\N	{}	f	\N	f	\N	2555
CUS-TEST-001	customer@test.com	Test	Müşteri	\N	customer	500.00	inactive	\N	Test Şirketi	\N	Test Adres, İstanbul	\N	0.00	0	2025-06-06 12:59:53.837014	2025-06-06 12:59:53.837014	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
PRT-TEST-001	printer@test.com	Test	Matbaa	\N	printer	0.00	active	\N	Test Matbaası	\N	Test Matbaa Adresi, İstanbul	\N	0.00	0	2025-06-06 12:59:53.928174	2025-06-06 12:59:53.928174	+90 555 765 4321	t	\N	\N	{}	f	\N	f	\N	2555
ADM-TEST-001	admin@test.com	Test	Admin	\N	admin	999999.00	active	\N	Matbixx Admin	\N	\N	\N	0.00	0	2025-06-06 12:59:53.999914	2025-06-06 12:59:53.999914	+90 555 987 6543	t	\N	\N	{}	f	\N	f	\N	2555
PRT-1749232946404-GJLVD5	custo@gmail.com	dfasfsafsaf	asdfsadfsaf	\N	printer	0.00	active	\N	abababab	\N	sadafasdfasfsaf, asdasdad 324234234324	\N	0.00	0	2025-06-06 18:02:26.404	2025-06-06 18:02:26.404	5383554785	t	\N	\N	{}	f	\N	f	\N	2555
user_1749233723746_aitpri1sl	ersrsrsr@gmail.com	Batuhan	Kaya	\N	customer	0.00	inactive	\N	adadaad	\N	adadadad	\N	0.00	0	2025-06-06 18:15:23.76797	2025-06-06 18:15:23.76797	05383554785	t	temp123	\N	{}	f	\N	f	\N	2555
43420000	bycici67@gmail.com	Batuhan	Kaya	\N	customer	0.00	inactive	\N	\N	\N	\N	\N	0.00	0	2025-06-03 02:20:01.111723	2025-06-03 17:20:57.925	\N	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1748981533183	dev@example.com	Development	User	\N	printer	1000.00	active	\N	Dev Matbaa	\N	\N	\N	0.00	0	2025-06-03 20:12:13.701603	2025-06-03 20:12:13.701603	\N	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1748984198261	dev-customer-1748984198262@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	\N	\N	0.00	0	2025-06-03 20:56:38.427872	2025-06-03 20:56:38.427872	\N	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1748984442328	dev-customer-1748984442329@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	\N	\N	0.00	0	2025-06-03 21:00:44.814425	2025-06-03 21:00:44.814425	\N	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1748984467450	dev-customer-1748984467450@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	\N	\N	0.00	0	2025-06-03 21:01:07.601933	2025-06-03 21:01:07.601933	\N	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1748984472808	dev-printer-1748984472809@example.com	Development	User	\N	printer	1000.00	active	\N	Dev Matbaa	\N	\N	\N	0.00	0	2025-06-03 21:01:12.831256	2025-06-03 21:01:12.831256	\N	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1748985348025	dev-customer-1748985348026@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-03 21:15:48.61643	2025-06-03 21:15:48.61643	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1748989605205	dev-customer-1748989605206@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-03 22:26:45.385818	2025-06-03 22:26:45.385818	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1748993419064	dev-admin-1748993419065@example.com	Development	User	\N	admin	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-03 23:30:19.205773	2025-06-03 23:30:19.205773	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1748993436134	dev-printer-1748993436135@example.com	Development	User	\N	printer	1000.00	active	\N	Dev Matbaa	\N	Development Address	\N	0.00	0	2025-06-03 23:30:36.27438	2025-06-03 23:30:36.27438	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1748993667518	dev-customer-1748993667519@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-03 23:34:29.668029	2025-06-03 23:34:29.668029	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1748993750077	dev-customer-1748993750078@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-03 23:35:50.217312	2025-06-03 23:35:50.217312	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1748993787508	dev-customer-1748993787508@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-03 23:36:27.635696	2025-06-03 23:36:27.635696	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1748994169998	dev-customer-1748994169999@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-03 23:42:50.158462	2025-06-03 23:42:50.158462	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1748994634251	dev-customer-1748994634251@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-03 23:50:34.457125	2025-06-03 23:50:34.457125	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1748994767383	dev-customer-1748994767384@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-03 23:52:49.531607	2025-06-03 23:52:49.531607	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1748994778401	dev-customer-1748994778401@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-03 23:52:58.419946	2025-06-03 23:52:58.419946	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1748995086511	dev-customer-1748995086512@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-03 23:58:06.998451	2025-06-03 23:58:06.998451	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
user-1749033795146-cotljkddi	alastikc@gmail.com	Batuhan	Kaya	\N	customer	100.00	inactive	\N	\N	\N	\N	\N	0.00	0	2025-06-04 10:43:15.322794	2025-06-04 10:43:15.322794	5383554785	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1749033806060	dev-customer-1749033806061@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-04 10:43:26.189722	2025-06-04 10:43:26.189722	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1749033940260	dev-customer-1749033940261@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-04 10:45:40.406424	2025-06-04 10:45:40.406424	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1749034054360	dev-customer-1749034054361@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-04 10:47:34.533951	2025-06-04 10:47:34.533951	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1749034069202	dev-printer-1749034069203@example.com	Development	User	\N	printer	1000.00	active	\N	Dev Matbaa	\N	Development Address	\N	0.00	0	2025-06-04 10:47:49.342213	2025-06-04 10:47:49.342213	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1749034283296	dev-customer-1749034283297@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-04 10:51:23.450326	2025-06-04 10:51:23.450326	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1749034352896	dev-customer-1749034352897@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-04 10:52:33.05384	2025-06-04 10:52:33.05384	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
dev-user-1749034375398	dev-printer-1749034375399@example.com	Development	User	\N	printer	1000.00	active	\N	Dev Matbaa	\N	Development Address	\N	0.00	0	2025-06-04 10:52:55.524195	2025-06-04 10:52:55.524195	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
customer_dev-user-1749034495988	dev-customer-1749034495988@example.com	Development	User	\N	customer	1000.00	inactive	\N	\N	\N	Development Address	\N	0.00	0	2025-06-04 10:54:56.136509	2025-06-04 10:54:56.136509	+90 555 123 4567	t	\N	\N	{}	f	\N	f	\N	2555
user_1749233837450_qvznga0iq	random@gmail.com	324234qe	123123123	\N	customer	0.00	inactive	\N	asdfasdfadfadf	\N	asdfasfadfasdfaf	\N	0.00	0	2025-06-06 18:17:17.468851	2025-06-06 18:17:17.468851	05383554785	t	temp123	\N	{}	f	\N	f	\N	2555
\.


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: chat_rooms chat_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_rooms
    ADD CONSTRAINT chat_rooms_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_contract_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_contract_number_unique UNIQUE (contract_number);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: printer_quotes printer_quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.printer_quotes
    ADD CONSTRAINT printer_quotes_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: chat_messages chat_messages_room_id_chat_rooms_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_room_id_chat_rooms_id_fk FOREIGN KEY (room_id) REFERENCES public.chat_rooms(id);


--
-- Name: chat_messages chat_messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: chat_rooms chat_rooms_customer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_rooms
    ADD CONSTRAINT chat_rooms_customer_id_users_id_fk FOREIGN KEY (customer_id) REFERENCES public.users(id);


--
-- Name: chat_rooms chat_rooms_printer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_rooms
    ADD CONSTRAINT chat_rooms_printer_id_users_id_fk FOREIGN KEY (printer_id) REFERENCES public.users(id);


--
-- Name: chat_rooms chat_rooms_quote_id_quotes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_rooms
    ADD CONSTRAINT chat_rooms_quote_id_quotes_id_fk FOREIGN KEY (quote_id) REFERENCES public.quotes(id);


--
-- Name: contracts contracts_customer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_customer_id_users_id_fk FOREIGN KEY (customer_id) REFERENCES public.users(id);


--
-- Name: contracts contracts_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: contracts contracts_printer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_printer_id_users_id_fk FOREIGN KEY (printer_id) REFERENCES public.users(id);


--
-- Name: files files_quote_id_quotes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_quote_id_quotes_id_fk FOREIGN KEY (quote_id) REFERENCES public.quotes(id);


--
-- Name: files files_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: orders orders_customer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_users_id_fk FOREIGN KEY (customer_id) REFERENCES public.users(id);


--
-- Name: orders orders_printer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_printer_id_users_id_fk FOREIGN KEY (printer_id) REFERENCES public.users(id);


--
-- Name: orders orders_printer_quote_id_printer_quotes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_printer_quote_id_printer_quotes_id_fk FOREIGN KEY (printer_quote_id) REFERENCES public.printer_quotes(id);


--
-- Name: orders orders_quote_id_quotes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_quote_id_quotes_id_fk FOREIGN KEY (quote_id) REFERENCES public.quotes(id);


--
-- Name: printer_quotes printer_quotes_printer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.printer_quotes
    ADD CONSTRAINT printer_quotes_printer_id_users_id_fk FOREIGN KEY (printer_id) REFERENCES public.users(id);


--
-- Name: printer_quotes printer_quotes_quote_id_quotes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.printer_quotes
    ADD CONSTRAINT printer_quotes_quote_id_quotes_id_fk FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;


--
-- Name: quotes quotes_customer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_customer_id_users_id_fk FOREIGN KEY (customer_id) REFERENCES public.users(id);


--
-- Name: ratings ratings_customer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_customer_id_users_id_fk FOREIGN KEY (customer_id) REFERENCES public.users(id);


--
-- Name: ratings ratings_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: ratings ratings_printer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_printer_id_users_id_fk FOREIGN KEY (printer_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

