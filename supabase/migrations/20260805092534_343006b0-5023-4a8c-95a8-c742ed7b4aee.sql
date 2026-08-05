DROP POLICY IF EXISTS "aurora public read avatars" ON storage.objects;
CREATE POLICY "aurora public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id IN ('avatars','music'));

DROP POLICY IF EXISTS "aurora owner insert files" ON storage.objects;
CREATE POLICY "aurora owner insert files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('avatars','music') AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "aurora owner update files" ON storage.objects;
CREATE POLICY "aurora owner update files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('avatars','music') AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id IN ('avatars','music') AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "aurora owner delete files" ON storage.objects;
CREATE POLICY "aurora owner delete files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('avatars','music') AND (storage.foldername(name))[1] = auth.uid()::text);