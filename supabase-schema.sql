-- ============================================================
-- PhLedger Digital Marketing - Supabase Schema (PUBLIC)
-- Project: dtfbcvefttirngkjuqvl
-- Run this in: https://supabase.com/dashboard/project/dtfbcvefttirngkjuqvl/sql/new
-- Tables prefixed with dm_ to avoid conflicts
-- ============================================================

-- ============================================================
-- 1. User Profiles (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS dm_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  company TEXT,
  plan TEXT NOT NULL DEFAULT 'grace' CHECK (plan IN ('grace', 'faithful', 'abundant')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  country TEXT DEFAULT 'AU',
  language TEXT DEFAULT 'en',
  avatar_url TEXT,
  linkedin_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. Services Catalog (all 5 platforms)
-- ============================================================
CREATE TABLE IF NOT EXISTS dm_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'instagram', 'facebook', 'x_twitter', 'google_maps')),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  tier TEXT NOT NULL CHECK (tier IN ('grace', 'faithful', 'abundant')),
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. Bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS dm_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES dm_profiles(id) ON DELETE SET NULL,
  service_id UUID REFERENCES dm_services(id),
  platform TEXT NOT NULL,
  service_name TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  linkedin_url TEXT,
  goals TEXT,
  rush_delivery BOOLEAN DEFAULT FALSE,
  faith_branding BOOLEAN DEFAULT FALSE,
  generate_invoice BOOLEAN DEFAULT TRUE,
  recurring_monthly BOOLEAN DEFAULT FALSE,
  linkedin_tier TEXT DEFAULT 'li_basic',
  cloud_platform TEXT DEFAULT 'cloud_vercel',
  payment_method TEXT DEFAULT 'bank',
  base_price DECIMAL(10,2) DEFAULT 0,
  rush_fee DECIMAL(10,2) DEFAULT 0,
  linkedin_fee DECIMAL(10,2) DEFAULT 0,
  cloud_fee DECIMAL(10,2) DEFAULT 0,
  bank_fee DECIMAL(10,2) DEFAULT 0,
  ad_budget DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. Feedback & Reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS dm_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES dm_profiles(id) ON DELETE SET NULL,
  service_id UUID REFERENCES dm_services(id),
  platform TEXT NOT NULL,
  service_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  bible_impact BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  admin_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. Payments
-- ============================================================
CREATE TABLE IF NOT EXISTS dm_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES dm_bookings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES dm_profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'AUD',
  payment_method TEXT NOT NULL,
  bank_fee DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  tax_type TEXT DEFAULT 'GST',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  invoice_number TEXT,
  phledgertax_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. Campaigns
-- ============================================================
CREATE TABLE IF NOT EXISTS dm_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES dm_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10,2) DEFAULT 0,
  spent DECIMAL(10,2) DEFAULT 0,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. Bible Verses
-- ============================================================
CREATE TABLE IF NOT EXISTS dm_bible_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  reference TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('business', 'finance', 'marketing', 'networking', 'leadership', 'trust', 'diligence', 'wisdom', 'service', 'growth')),
  platform_relevance TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. Audit Trail
-- ============================================================
CREATE TABLE IF NOT EXISTS dm_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES dm_profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE dm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_bible_verses ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users view own profile" ON dm_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON dm_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Insert own profile" ON dm_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON dm_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM dm_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Bookings
CREATE POLICY "Users view own bookings" ON dm_bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create bookings" ON dm_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage bookings" ON dm_bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM dm_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Feedback: public read
CREATE POLICY "Public view feedback" ON dm_feedback FOR SELECT USING (is_published = true);
CREATE POLICY "Users create feedback" ON dm_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payments
CREATE POLICY "Users view own payments" ON dm_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage payments" ON dm_payments FOR ALL USING (
  EXISTS (SELECT 1 FROM dm_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Campaigns
CREATE POLICY "Users manage own campaigns" ON dm_campaigns FOR ALL USING (auth.uid() = user_id);

-- Services: public read
CREATE POLICY "Public view services" ON dm_services FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage services" ON dm_services FOR ALL USING (
  EXISTS (SELECT 1 FROM dm_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Bible verses: public
CREATE POLICY "Public view verses" ON dm_bible_verses FOR SELECT USING (is_active = true);

-- ============================================================
-- Auto-create profile on signup (trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_dm_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO dm_profiles (id, email, full_name, plan, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'plan', 'grace'),
    CASE WHEN NEW.email = 'zhili@phledger.com' THEN 'admin' ELSE 'user' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_dm_user_created ON auth.users;
CREATE TRIGGER on_dm_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_dm_user();

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_dm_bookings_user ON dm_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_dm_bookings_status ON dm_bookings(status);
CREATE INDEX IF NOT EXISTS idx_dm_bookings_platform ON dm_bookings(platform);
CREATE INDEX IF NOT EXISTS idx_dm_feedback_platform ON dm_feedback(platform);
CREATE INDEX IF NOT EXISTS idx_dm_campaigns_user ON dm_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_dm_services_platform ON dm_services(platform);

-- ============================================================
-- Seed: Services (31 across 5 platforms)
-- ============================================================

-- LinkedIn (7)
INSERT INTO dm_services (platform, name, description, price, tier, icon, sort_order) VALUES
('linkedin', 'Profile Optimization', 'Complete LinkedIn profile overhaul with faith-based branding.', 0, 'grace', '👤', 1),
('linkedin', 'Content Strategy', '30-day content calendar with Bible-inspired themes.', 49, 'faithful', '📝', 2),
('linkedin', 'Audience Growth', 'Targeted connection strategy based on ethical principles.', 49, 'faithful', '📈', 3),
('linkedin', 'Engagement Boost', 'Comment strategy, poll creation, and community building.', 49, 'faithful', '💬', 4),
('linkedin', 'Analytics & Reporting', 'Monthly performance reports with faith-aligned KPIs.', 199, 'abundant', '📊', 5),
('linkedin', 'LinkedIn Ads Management', 'Ethical advertising campaigns aligned with your mission.', 199, 'abundant', '🚀', 6),
('linkedin', 'Executive Thought Leadership', 'Position yourself as a faith-driven industry leader.', 199, 'abundant', '👑', 7);

-- Instagram (6)
INSERT INTO dm_services (platform, name, description, price, tier, icon, sort_order) VALUES
('instagram', 'Profile & Bio Optimization', 'Compelling bio, highlights, and aesthetic.', 0, 'grace', '✨', 1),
('instagram', 'Content Calendar & Reels', '30-day plan with Reels, Stories, and carousels.', 59, 'faithful', '🎬', 2),
('instagram', 'Hashtag & SEO Research', 'Data-driven hashtags for maximum discoverability.', 39, 'faithful', '#️⃣', 3),
('instagram', 'Engagement & Community', 'Authentic engagement strategy and DM funnels.', 79, 'faithful', '💬', 4),
('instagram', 'Instagram Ads', 'Story ads, reel ads with faith-aligned messaging.', 149, 'abundant', '📢', 5),
('instagram', 'Influencer Collaboration', 'Faith-aligned micro-influencer partnerships.', 199, 'abundant', '🤝', 6);

-- Facebook (6)
INSERT INTO dm_services (platform, name, description, price, tier, icon, sort_order) VALUES
('facebook', 'Business Page Setup', 'Complete page with faith-aligned branding.', 0, 'grace', '🏢', 1),
('facebook', 'Content & Scheduling', 'Weekly content mix: videos, posts, events.', 49, 'faithful', '📅', 2),
('facebook', 'Groups Management', 'Build faith-driven communities.', 69, 'faithful', '👥', 3),
('facebook', 'Facebook Ads', 'Targeted campaigns for lead generation.', 149, 'abundant', '🎯', 4),
('facebook', 'Messenger & Chatbot', 'Automated responses and lead capture.', 99, 'abundant', '💬', 5),
('facebook', 'Facebook Shop', 'Product catalog and marketplace listings.', 79, 'faithful', '🛒', 6);

-- X/Twitter (6)
INSERT INTO dm_services (platform, name, description, price, tier, icon, sort_order) VALUES
('x_twitter', 'Profile & Brand Voice', 'X persona, bio, pinned posts, brand voice.', 0, 'grace', '🎤', 1),
('x_twitter', 'Thread Strategy', 'Viral templates, daily posting, thought leadership.', 59, 'faithful', '🧵', 2),
('x_twitter', 'Engagement & Growth', 'Reply strategy, community building.', 49, 'faithful', '🚀', 3),
('x_twitter', 'X Spaces & Audio', 'Weekly Spaces and panel discussions.', 89, 'faithful', '🎙️', 4),
('x_twitter', 'X Ads & Promoted', 'Targeted campaigns and follower acquisition.', 129, 'abundant', '📢', 5),
('x_twitter', 'X Premium Strategy', 'Monetization and subscriber growth.', 149, 'abundant', '✓', 6);

-- Google Maps (6)
INSERT INTO dm_services (platform, name, description, price, tier, icon, sort_order) VALUES
('google_maps', 'Google Business Profile', 'Complete GBP creation and verification.', 0, 'grace', '📍', 1),
('google_maps', 'Local SEO & Map Pack', 'Rank in top 3 Google Maps results.', 79, 'faithful', '🗺️', 2),
('google_maps', 'Review Generation', 'Automated review requests and monitoring.', 49, 'faithful', '⭐', 3),
('google_maps', 'Google Posts', 'Weekly offers, events, and updates.', 39, 'faithful', '📝', 4),
('google_maps', 'Multi-Location', 'Manage multiple business locations.', 149, 'abundant', '🏪', 5),
('google_maps', 'Local Ads', 'Local search ads and call ads.', 129, 'abundant', '📢', 6);

-- ============================================================
-- Seed: Bible Verses (10 marketing-relevant)
-- ============================================================
INSERT INTO dm_bible_verses (text, reference, category, platform_relevance) VALUES
('Commit to the LORD whatever you do, and he will establish your plans.', 'Proverbs 16:3', 'business', ARRAY['linkedin', 'instagram']),
('The plans of the diligent lead to profit as surely as haste leads to poverty.', 'Proverbs 21:5', 'diligence', ARRAY['linkedin', 'facebook']),
('Whatever you do, work at it with all your heart, as working for the Lord.', 'Colossians 3:23', 'service', ARRAY['linkedin', 'x_twitter']),
('Let your light shine before others, that they may see your good deeds.', 'Matthew 5:16', 'marketing', ARRAY['instagram', 'facebook']),
('A good name is more desirable than great riches.', 'Proverbs 22:1', 'trust', ARRAY['google_maps', 'linkedin']),
('For where two or three gather in my name, there am I with them.', 'Matthew 18:20', 'networking', ARRAY['facebook', 'x_twitter']),
('The generous will themselves be blessed, for they share their food with the poor.', 'Proverbs 22:9', 'growth', ARRAY['instagram', 'facebook']),
('Iron sharpens iron, and one person sharpens another.', 'Proverbs 27:17', 'leadership', ARRAY['linkedin', 'x_twitter']),
('Wealth gained hastily will dwindle, but whoever gathers little by little will increase it.', 'Proverbs 13:11', 'finance', ARRAY['linkedin', 'google_maps']),
('Do not withhold good from those to whom it is due, when it is in your power to act.', 'Proverbs 3:27', 'wisdom', ARRAY['google_maps', 'facebook']);
