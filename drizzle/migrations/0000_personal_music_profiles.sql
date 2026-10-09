CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text NOT NULL DEFAULT 'Meu perfil' CHECK (char_length(display_name) BETWEEN 1 AND 60),
 bio text NOT NULL DEFAULT '' CHECK (char_length(bio) <= 180),
 avatar integer NOT NULL DEFAULT 0 CHECK (avatar BETWEEN 0 AND 8),
 activity jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(activity) = 'array'),
 events jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(events) = 'array')
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated USING ((select auth.uid()) = id);
CREATE POLICY "Create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);
CREATE FUNCTION public.create_music_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING; RETURN NEW; END; $$;
CREATE TRIGGER create_music_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_music_profile();