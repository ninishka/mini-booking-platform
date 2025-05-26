import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import type { BookableObject, Booking } from '@/types';

export const dynamic = 'force-dynamic';

export default async function MyObjectsPage() {
  const supabase = createServerComponentClient({ cookies });

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .single();

  console.log('User profile:', profile);
  console.log('Profile error:', profileError);

  if (!profile || profile.role !== 'admin') {
    console.log('Access denied: User is not an admin');
    redirect('/');
  }

  const { data: objects, error } = await supabase
    .from('bookable_objects')
    .select(`
      *,
      bookings (
        id,
        status
      )
    `)
    .order('created_at', { ascending: false });

  console.log('My objects:', objects);
  console.log('Objects error:', error);

  if (error) {
    console.error('Error fetching objects:', error);
    return <div>Error loading objects. Please try again later.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Objects</h1>
        <Link href="/my-objects/new">
          <Button>Create New Object</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {objects?.map((object: BookableObject & { bookings: Booking[] }) => (
          <div
            key={object.id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">{object.name}</h2>
                <p className="text-gray-600 mb-2">{object.address}</p>
                <p className="text-gray-600">Capacity: {object.capacity} people</p>
                {object.price && (
                  <p className="text-gray-600">
                    Price: ${object.price.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="flex space-x-4">
                <Link href={`/entity/${object.id}`}>
                  <Button variant="outline">View</Button>
                </Link>
                <Link href={`/my-objects/edit/${object.id}`}>
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Bookings</h3>
              {object.bookings && object.bookings.length > 0 ? (
                <div className="text-sm text-gray-600">
                  Total bookings: {object.bookings.length}
                  <br />
                  Active bookings:{' '}
                  {object.bookings.filter((b) => b.status === 'confirmed').length}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No bookings yet</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {(!objects || objects.length === 0) && (
        <p className="text-center text-gray-600">
          You haven't created any objects yet.
        </p>
      )}
    </div>
  );
} 