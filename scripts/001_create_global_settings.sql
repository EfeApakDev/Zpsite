-- Create global settings table for departments, fonts, and templates
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings (no auth required for this public app)
CREATE POLICY "Allow public read access to app settings"
  ON public.app_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to insert/update settings (password protection will be in app layer)
CREATE POLICY "Allow public write access to app settings"
  ON public.app_settings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update access to app settings"
  ON public.app_settings FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public delete access to app settings"
  ON public.app_settings FOR DELETE
  TO anon, authenticated
  USING (true);

-- Insert default departments
INSERT INTO public.app_settings (setting_key, setting_value) VALUES
  ('departments', '[
    {
      "id": "genclik",
      "name": "Gençlik Kolları",
      "templateUrl": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/genclik-template-Hn8xqJZQxvXxqxqxqxqxqxqxqxqxqx.png"
    },
    {
      "id": "kadin",
      "name": "Kadın Kolları",
      "templateUrl": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kadin-template-Hn8xqJZQxvXxqxqxqxqxqxqxqxqxqx.png"
    },
    {
      "id": "merkezefendi",
      "name": "Merkezefendi",
      "templateUrl": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/merkezefendi-template-Hn8xqJZQxvXxqxqxqxqxqxqxqxqxqx.png"
    },
    {
      "id": "pau",
      "name": "PAÜ",
      "templateUrl": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pau-template-Hn8xqJZQxvXxqxqxqxqxqxqxqxqxqx.png"
    },
    {
      "id": "il",
      "name": "İl Başkanlığı",
      "templateUrl": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/il-template-Hn8xqJZQxvXxqxqxqxqxqxqxqxqxqx.png"
    },
    {
      "id": "basin",
      "name": "Basın",
      "templateUrl": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/basin-template-Hn8xqJZQxvXxqxqxqxqxqxqxqxqxqx.png"
    }
  ]'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default fonts
INSERT INTO public.app_settings (setting_key, setting_value) VALUES
  ('fonts', '[
    {"name": "Arial", "url": null, "isDefault": true},
    {"name": "Times New Roman", "url": null, "isDefault": true},
    {"name": "Courier New", "url": null, "isDefault": true},
    {"name": "Georgia", "url": null, "isDefault": true},
    {"name": "Verdana", "url": null, "isDefault": true}
  ]'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert theme setting
INSERT INTO public.app_settings (setting_key, setting_value) VALUES
  ('theme', '"dark"'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;
