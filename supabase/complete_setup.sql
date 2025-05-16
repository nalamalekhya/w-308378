-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.echoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration NUMERIC NOT NULL,
  mood TEXT NOT NULL,
  unlock_date TIMESTAMP WITH TIME ZONE NOT NULL,
  unlocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  echo_id UUID NOT NULL REFERENCES public.echoes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS echoes_user_id_idx ON public.echoes(user_id);
CREATE INDEX IF NOT EXISTS reflections_echo_id_idx ON public.reflections(echo_id);
CREATE INDEX IF NOT EXISTS reflections_user_id_idx ON public.reflections(user_id);

-- Set up Row Level Security (RLS)
-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.echoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Echoes policies
CREATE POLICY "Users can view their own echoes"
  ON public.echoes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own echoes"
  ON public.echoes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own echoes"
  ON public.echoes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own echoes"
  ON public.echoes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Reflections policies
CREATE POLICY "Users can view their own reflections"
  ON public.reflections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reflections"
  ON public.reflections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections"
  ON public.reflections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections"
  ON public.reflections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.echoes TO authenticated;
GRANT ALL ON public.reflections TO authenticated;

-- Create a trigger function to handle new users
-- This will automatically create a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$$;

-- Create trigger (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;
