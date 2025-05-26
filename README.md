# Mini Booking Platform

A demo project showcasing a booking platform built with Next.js, TypeScript, and Supabase. This platform allows users to browse and book various objects (venues, tickets, etc.) while demonstrating modern web development practices.

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript
- **Backend/Database/Auth**: Supabase
- **Styling**: TailwindCSS
- **Form Handling**: React Hook Form + Zod
- **PDF Generation**: pdf-lib
- **Email**: Simulated email service
- **Payments**: Stripe (optional)

## Features

### Authentication
- Email + password sign-up/login
- Role-based access (Admin/User)
- Protected routes

### Admin Features
- Create and manage bookable objects
- View personal dashboard
- Download object information as PDF
- View bookings for owned objects

### User Features
- Browse all available objects
- View object details
- Download object information
- Book objects (optional Stripe integration)

### Additional Features
- PDF generation for object details
- Email notifications
- Form validation
- Responsive design
- Row Level Security (RLS)

## Getting Started

1. Clone the repository
```bash
git clone <repository-url>
cd mini-booking-platform
```

2. Install dependencies
```bash
npm install
```

3. Set up Supabase
- Create a new project at [Supabase](https://supabase.com)
- Copy the SQL from `supabase/migrations/00-initial-schema.sql` and run it in the Supabase SQL editor
- Enable Email Auth in Authentication settings
- Create the following storage buckets (optional):
  - `object-images` for storing object images

4. Set up environment variables
Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional - for Stripe integration
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Optional - for email service
EMAIL_FROM=noreply@yourdomain.com
EMAIL_SERVER=smtp://username:password@smtp.yourdomain.com:587
```

5. Run the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/         # React components
│   ├── auth/          # Authentication components
│   ├── layout/        # Layout components
│   └── ui/            # Reusable UI components
├── lib/               # Utility functions and configurations
├── types/             # TypeScript type definitions
└── middleware.ts      # Authentication middleware

supabase/
└── migrations/        # Database migrations
```

## Database Schema

The project uses Supabase with the following main tables:

### profiles
- `id`: UUID (references auth.users)
- `email`: TEXT
- `role`: user_role ENUM ('admin', 'user')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### bookable_objects
- `id`: UUID
- `name`: TEXT
- `address`: TEXT
- `capacity`: INTEGER
- `image_url`: TEXT (optional)
- `price`: DECIMAL (optional)
- `created_by`: UUID (references auth.users)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### bookings
- `id`: UUID
- `object_id`: UUID (references bookable_objects)
- `user_id`: UUID (references auth.users)
- `booking_date`: TIMESTAMP
- `status`: TEXT ('pending', 'confirmed', 'cancelled')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

Row Level Security (RLS) policies are implemented to ensure:
- Admins can only manage their own objects
- Users can only view their own bookings
- Public access is limited to viewing objects

## Development Workflow

1. **Authentication Flow**
   - Users can sign up/in via email
   - New users are automatically assigned the 'user' role
   - Admins must be manually upgraded in the database

2. **Object Management**
   - Admins can create/edit/delete their objects
   - Objects require name, address, and capacity
   - Optional fields: price, image URL

3. **Booking Process**
   - Users browse the catalog
   - View object details
   - Download PDF information
   - Book objects (if Stripe is integrated)

4. **Security**
   - All database access is controlled via RLS
   - Environment variables for sensitive data
   - Server-side validation for all operations

## Contributing

This is a demo project, but contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT
