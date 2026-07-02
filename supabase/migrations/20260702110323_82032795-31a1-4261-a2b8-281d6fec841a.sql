
-- Add profile_style column for layout choice
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_style text NOT NULL DEFAULT 'code';

-- Security: require authenticated users to post reviews, and one review per user per profile
DROP POLICY IF EXISTS reviews_anyone_insert ON public.reviews;

CREATE POLICY reviews_authenticated_insert ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = reviews.profile_id)
  );

-- Prevent duplicate reviews per (profile, author)
CREATE UNIQUE INDEX IF NOT EXISTS reviews_unique_author_per_profile
  ON public.reviews (profile_id, author_id)
  WHERE author_id IS NOT NULL;
