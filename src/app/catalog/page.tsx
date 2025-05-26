import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: objects, error } = await supabase
    .from('bookable_objects')
    .select('*')
    .order('created_at', { ascending: false });

  console.log('Catalog objects:', objects);
  console.log('Catalog error:', error);

  if (error) {
    console.error('Error fetching objects:', error);
    return <div>Error loading objects. Please try again later.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Objects</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {objects?.map((object) => (
          <div
            key={object.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {object.image_url && (
              <img
                src={object.image_url}
                alt={object.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{object.name}</h2>
              <p className="text-gray-600 mb-2">{object.address}</p>
              <p className="text-gray-600 mb-4">
                Capacity: {object.capacity} people
              </p>
              {object.price && (
                <p className="text-lg font-semibold mb-4">
                  ${object.price.toFixed(2)}
                </p>
              )}
              <Link href={`/entity/${object.id}`}>
                <Button className="w-full">View Details & Download PDF</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
      {(!objects || objects.length === 0) && (
        <p className="text-center text-gray-600">
          No objects available at the moment.
        </p>
      )}
    </div>
  );
} 