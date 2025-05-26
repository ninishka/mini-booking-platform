import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EntityPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  const { data: object, error } = await supabase
    .from('bookable_objects')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !object) {
    console.error('Error fetching object:', error);
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {object.image_url && (
          <img
            src={object.image_url}
            alt={object.name}
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{object.name}</h1>
          <div className="space-y-4">
            <p className="text-gray-600">
              <span className="font-semibold">Address:</span> {object.address}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Capacity:</span> {object.capacity} people
            </p>
            {object.price && (
              <p className="text-gray-600">
                <span className="font-semibold">Price:</span> ${object.price.toFixed(2)}
              </p>
            )}
            <p className="text-gray-600">
              <span className="font-semibold">Description:</span>
              <br />
              {object.description || 'No description available.'}
            </p>
          </div>
          
          <div className="mt-8">
            <a href={`/api/pdf/${object.id}`} target="_blank" rel="noopener noreferrer">
              <Button className="w-full">Download PDF Information</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 