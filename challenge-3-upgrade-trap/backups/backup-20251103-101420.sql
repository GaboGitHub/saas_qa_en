--
-- PostgreSQL database dump
--

\restrict 34ThxUIEgBEXtPHERxQfYilshphAoSRBqLFrVjs2Flp4EFMKFgWeIJz1CAmkqi1

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

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
-- Name: legacy_mappings; Type: TABLE; Schema: public; Owner: sekoia
--

CREATE TABLE public.legacy_mappings (
    id integer NOT NULL,
    user_legacy_id integer NOT NULL,
    old_system_ref character varying(100),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.legacy_mappings OWNER TO sekoia;

--
-- Name: legacy_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: sekoia
--

CREATE SEQUENCE public.legacy_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.legacy_mappings_id_seq OWNER TO sekoia;

--
-- Name: legacy_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sekoia
--

ALTER SEQUENCE public.legacy_mappings_id_seq OWNED BY public.legacy_mappings.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: sekoia
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    user_id integer,
    token character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sessions OWNER TO sekoia;

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: sekoia
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sessions_id_seq OWNER TO sekoia;

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sekoia
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: sekoia
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    legacy_id integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO sekoia;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: sekoia
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO sekoia;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sekoia
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: legacy_mappings id; Type: DEFAULT; Schema: public; Owner: sekoia
--

ALTER TABLE ONLY public.legacy_mappings ALTER COLUMN id SET DEFAULT nextval('public.legacy_mappings_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: sekoia
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: sekoia
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: legacy_mappings; Type: TABLE DATA; Schema: public; Owner: sekoia
--

COPY public.legacy_mappings (id, user_legacy_id, old_system_ref, created_at) FROM stdin;
1	1001	OLD-SYS-ALICE	2025-11-03 09:09:53.625339
2	1002	OLD-SYS-BOB	2025-11-03 09:09:53.625339
3	1003	OLD-SYS-CHARLIE	2025-11-03 09:09:53.625339
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: sekoia
--

COPY public.sessions (id, user_id, token, created_at) FROM stdin;
1	1	token-alice-123	2025-11-03 09:09:53.624579
2	2	token-bob-456	2025-11-03 09:09:53.624579
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: sekoia
--

COPY public.users (id, username, email, legacy_id, created_at) FROM stdin;
1	alice	alice@sekoia.io	1001	2025-11-03 09:09:53.623637
2	bob	bob@sekoia.io	1002	2025-11-03 09:09:53.623637
3	charlie	charlie@sekoia.io	1003	2025-11-03 09:09:53.623637
\.


--
-- Name: legacy_mappings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sekoia
--

SELECT pg_catalog.setval('public.legacy_mappings_id_seq', 3, true);


--
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sekoia
--

SELECT pg_catalog.setval('public.sessions_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: sekoia
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: legacy_mappings legacy_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: sekoia
--

ALTER TABLE ONLY public.legacy_mappings
    ADD CONSTRAINT legacy_mappings_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: sekoia
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: sekoia
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_legacy_id_key UNIQUE (legacy_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: sekoia
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: sekoia
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_legacy_mappings_user; Type: INDEX; Schema: public; Owner: sekoia
--

CREATE INDEX idx_legacy_mappings_user ON public.legacy_mappings USING btree (user_legacy_id);


--
-- Name: idx_sessions_user; Type: INDEX; Schema: public; Owner: sekoia
--

CREATE INDEX idx_sessions_user ON public.sessions USING btree (user_id);


--
-- Name: idx_users_legacy; Type: INDEX; Schema: public; Owner: sekoia
--

CREATE INDEX idx_users_legacy ON public.users USING btree (legacy_id);


--
-- Name: legacy_mappings fk_legacy_user; Type: FK CONSTRAINT; Schema: public; Owner: sekoia
--

ALTER TABLE ONLY public.legacy_mappings
    ADD CONSTRAINT fk_legacy_user FOREIGN KEY (user_legacy_id) REFERENCES public.users(legacy_id);


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sekoia
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 34ThxUIEgBEXtPHERxQfYilshphAoSRBqLFrVjs2Flp4EFMKFgWeIJz1CAmkqi1

