import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EntityPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  const { data: object, error } = await supabase
    .from('bookable_objects')
    .select(`
      *,
      profiles:created_by (
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error || !object) {
    console.error('Error fetching object:', error);
    return notFound();
  }

  const { data: { session } } = await supabase.auth.getSession();
  const isOwner = session?.user?.id === object.created_by;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
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
            <div>
              <h2 className="text-lg font-semibold">Address</h2>
              <p className="text-gray-600">{object.address}</p>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold">Capacity</h2>
              <p className="text-gray-600">{object.capacity} people</p>
            </div>
            
            {object.price && (
              <div>
                <h2 className="text-lg font-semibold">Price</h2>
                <p className="text-gray-600">${object.price.toFixed(2)}</p>
              </div>
            )}
            
            <div>
              <h2 className="text-lg font-semibold">Created By</h2>
              <p className="text-gray-600">{object.profiles.email}</p>
            </div>
          </div>

          <div className="mt-8 space-x-4">
            <Link href="/api/pdf/generate" target="_blank">
              <Button>Download PDF</Button>
            </Link>
            
            {!isOwner && (
              <Button variant="default">
                Book Now
              </Button>
            )}
            
            {isOwner && (
              <Link href={`/my-objects/edit/${id}`}>
                <Button variant="outline">Edit</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 