-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    username TEXT UNIQUE,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    location TEXT,
    website TEXT,
    twitter TEXT,
    github TEXT,
    linkedin TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create sellers table
CREATE TABLE public.sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    stripe_connect_id TEXT,
    kyc_status TEXT DEFAULT 'required' CHECK (kyc_status IN ('required', 'pending', 'verified', 'rejected')),
    payout_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('tool', 'product', 'toolkit')),
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    type TEXT NOT NULL CHECK (type IN ('digital', 'saas')),
    description TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    category_id UUID REFERENCES public.categories(id),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    price INTEGER NOT NULL CHECK (price >= 0),
    currency TEXT DEFAULT 'USD',
    files JSONB DEFAULT '[]'::jsonb,
    license TEXT,
    faq JSONB DEFAULT '[]'::jsonb,
    support_contact TEXT,
    demo_url TEXT,
    tech_stack TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'paused')),
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create tools table
CREATE TABLE public.tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    category_id UUID REFERENCES public.categories(id),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    website_url TEXT,
    repo_url TEXT,
    pricing TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    view_count INTEGER DEFAULT 0,
    upvote_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Create toolkits table
CREATE TABLE public.toolkits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    category_id UUID REFERENCES public.categories(id),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    tools JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.toolkits ENABLE ROW LEVEL SECURITY;

-- Create referrals table
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create purchases table
CREATE TABLE public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    stripe_payment_intent_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('tool', 'product', 'toolkit')),
    resource_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    body TEXT,
    pros TEXT[] DEFAULT ARRAY[]::TEXT[],
    cons TEXT[] DEFAULT ARRAY[]::TEXT[],
    recommend BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'flagged')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create saves table (for bookmarking)
CREATE TABLE public.saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('tool', 'product', 'toolkit')),
    resource_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, resource_type, resource_id)
);

ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

-- Profiles trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    LOWER(REPLACE(NEW.raw_user_meta_data->>'full_name', ' ', '_')) || '_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8)
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON public.sellers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON public.tools FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_toolkits_updated_at BEFORE UPDATE ON public.toolkits FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for sellers
CREATE POLICY "Sellers viewable by everyone" ON public.sellers FOR SELECT USING (true);
CREATE POLICY "Users can create seller profile" ON public.sellers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own seller profile" ON public.sellers FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for categories
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Only admins can manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for products
CREATE POLICY "Published products viewable by everyone" ON public.products FOR SELECT USING (status = 'published' OR seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));
CREATE POLICY "Sellers can create products" ON public.products FOR INSERT WITH CHECK (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));
CREATE POLICY "Sellers can update own products" ON public.products FOR UPDATE USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));
CREATE POLICY "Sellers can delete own products" ON public.products FOR DELETE USING (seller_id IN (SELECT id FROM public.sellers WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all products" ON public.products FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tools
CREATE POLICY "Approved tools viewable by everyone" ON public.tools FOR SELECT USING (status = 'approved' OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can create tools" ON public.tools FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tools" ON public.tools FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can delete own tools" ON public.tools FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for toolkits
CREATE POLICY "Published toolkits viewable by everyone" ON public.toolkits FOR SELECT USING (status = 'published' OR user_id = auth.uid());
CREATE POLICY "Authenticated users can create toolkits" ON public.toolkits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own toolkits" ON public.toolkits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own toolkits" ON public.toolkits FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for referrals
CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Users can create referrals" ON public.referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- RLS Policies for purchases
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "System can create purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Admins can view all purchases" ON public.purchases FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for reviews
CREATE POLICY "Published reviews viewable by everyone" ON public.reviews FOR SELECT USING (status = 'published' OR author_id = auth.uid());
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = author_id);
CREATE POLICY "Admins can moderate reviews" ON public.reviews FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for saves
CREATE POLICY "Users can view own saves" ON public.saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create saves" ON public.saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saves" ON public.saves FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insert default categories
INSERT INTO public.categories (name, slug, type, description) VALUES
('AI & Machine Learning', 'ai-ml', 'tool', 'AI-powered tools and machine learning platforms'),
('Design & UI/UX', 'design', 'tool', 'Design tools, UI kits, and UX resources'),
('Development Tools', 'development', 'tool', 'Code editors, frameworks, and developer utilities'),
('Productivity', 'productivity', 'tool', 'Task management, note-taking, and productivity apps'),
('Marketing', 'marketing', 'tool', 'Marketing automation, analytics, and growth tools'),
('SaaS Boilerplates', 'saas-boilerplates', 'product', 'Ready-to-use SaaS starter kits'),
('Templates', 'templates', 'product', 'Website and app templates'),
('Scripts & Automation', 'scripts', 'product', 'Automation scripts and workflows'),
('Startup Toolkits', 'startup', 'toolkit', 'Complete toolkits for launching startups'),
('Developer Toolkits', 'developer', 'toolkit', 'Curated tools for developers');