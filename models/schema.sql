-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Admin Users Table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Vehicles Table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    mileage INT NOT NULL,
    engine VARCHAR(50) NOT NULL,
    transmission VARCHAR(20) NOT NULL,
    fuel VARCHAR(20) NOT NULL,
    body_style VARCHAR(30) NOT NULL,
    colour VARCHAR(30) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    finance_price DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    warranty VARCHAR(100) DEFAULT '6 Months Included',
    features JSONB DEFAULT '[]'::jsonb,
    location VARCHAR(100) DEFAULT 'London Showroom',
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Sold')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Vehicle Images Table
CREATE TABLE vehicle_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    cloudinary_public_id VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Saved Cars (Wishlist) Table
CREATE TABLE saved_cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, vehicle_id)
);

-- 6. Reservations Table
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE RESTRICT,
    stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL DEFAULT 99.00,
    payment_status VARCHAR(50) DEFAULT 'Pending',
    reservation_status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Finance Applications Table
CREATE TABLE finance_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE RESTRICT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    employment_status VARCHAR(50) NOT NULL,
    annual_income DECIMAL(10,2) NOT NULL,
    residential_address TEXT NOT NULL,
    residential_status VARCHAR(50) NOT NULL,
    requested_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Under Review' CHECK (status IN ('Under Review', 'Approved', 'Rejected', 'Info Required')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Activity Logs Table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    user_type VARCHAR(20),
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX idx_vehicles_price ON vehicles(price);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_saved_cars_customer ON saved_cars(customer_id);
CREATE INDEX idx_reservations_customer ON reservations(customer_id);
CREATE INDEX idx_finance_customer ON finance_applications(customer_id);
