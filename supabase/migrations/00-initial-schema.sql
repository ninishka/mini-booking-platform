-- 1. Create enum for user roles only if it doesn't exist
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- 3. Create bookable_objects table if not exists
CREATE TABLE IF NOT EXISTS bookable_objects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  image_url TEXT,
  price DECIMAL(10,2),
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Remove duplicate entries before constraint
DELETE FROM bookable_objects a
USING bookable_objects b
WHERE a.ctid < b.ctid
  AND a.name = b.name
  AND a.created_by = b.created_by;

-- 5. Add unique constraint only if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_object_name_per_creator'
  ) THEN
    ALTER TABLE bookable_objects
    ADD CONSTRAINT unique_object_name_per_creator UNIQUE (name, created_by);
  END IF;
END
$$;

-- 6. Create bookings table if not exists
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  object_id UUID REFERENCES bookable_objects NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookable_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 8. Policies for profiles
DO $$
BEGIN
  CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN null; END
$$;

DO $$
BEGIN
  CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END
$$;

-- 9. Policies for bookable_objects
DO $$
BEGIN
  CREATE POLICY "Bookable objects are viewable by everyone"
    ON bookable_objects FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN null; END
$$;

DO $$
BEGIN
  CREATE POLICY "Admins can insert bookable objects"
    ON bookable_objects FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN null; END
$$;

DO $$
BEGIN
  CREATE POLICY "Admins can update own bookable objects"
    ON bookable_objects FOR UPDATE
    USING (
      auth.uid() = created_by
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN null; END
$$;

DO $$
BEGIN
  CREATE POLICY "Admins can delete own bookable objects"
    ON bookable_objects FOR DELETE
    USING (
      auth.uid() = created_by
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN null; END
$$;

-- 10. Policies for bookings
DO $$
BEGIN
  CREATE POLICY "Users can view own bookings"
    ON bookings FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END
$$;

DO $$
BEGIN
  CREATE POLICY "Admins can view bookings for their objects"
    ON bookings FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM bookable_objects
        WHERE bookable_objects.id = object_id
        AND bookable_objects.created_by = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN null; END
$$;

DO $$
BEGIN
  CREATE POLICY "Users can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END
$$;

DO $$
BEGIN
  CREATE POLICY "Users can update own bookings"
    ON bookings FOR UPDATE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END
$$;

-- 11. Function for new user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Trigger for new user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END;
$$;

-- 13. Insert demo listings with check for duplicates
WITH creator AS (
  SELECT 'f429f6b6-324d-4e6b-96a4-053717a85511'::UUID AS id
),
listings(name, address, capacity, image_url, price) AS (
  VALUES 
    ('Sunny Apartment', '101 Sunshine Ave', 2, 'https://images.unsplash.com/photo-1650137938625-11576502aecd?q=80&w=1953&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 75.00),
    ('Downtown Loft', '202 Urban Blvd', 2, 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80', 120.00),
    ('Beach House', '303 Ocean Drive', 6, 'https://images.unsplash.com/photo-1605549339992-83721992836e?q=80&w=2087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 150.00),
    ('Mountain Cabin', '404 Pine Hill Rd', 5, 'https://images.unsplash.com/photo-1551648746-d158bcd704e7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 95.00),
    ('Modern Studio', '505 Tech Park', 2, 'https://images.unsplash.com/photo-1675279200694-8529c73b1fd0?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 65.00),
    ('Historic Villa', '606 Heritage Lane', 8, 'https://plus.unsplash.com/premium_photo-1680106198604-fd9491c32506?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 200.00),
    ('Countryside BnB', '707 Farm Road', 3, 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?auto=format&fit=crop&w=800&q=80', 55.00),
    ('Rooftop Flat', '808 Skyline Terrace', 2, 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80', 110.00),
    ('Tiny House', '909 Compact Lane', 2, 'https://images.unsplash.com/photo-1628394029761-acc83a2a08a6?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 45.00),
    ('Eco Lodge', '1010 Green Retreat', 5, 'https://images.unsplash.com/photo-1593663128403-9db609542c2e?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 85.00)
)
INSERT INTO bookable_objects (name, address, capacity, image_url, price, created_by)
SELECT l.name, l.address, l.capacity, l.image_url, l.price, c.id
FROM listings l, creator c
WHERE NOT EXISTS (
  SELECT 1 FROM bookable_objects
  WHERE name = l.name AND created_by = c.id
);
