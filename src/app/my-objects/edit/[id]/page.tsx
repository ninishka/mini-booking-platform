import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { ObjectForm } from '@/components/objects/object-form';

export const dynamic = 'force-dynamic';

export default async function EditObjectPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  // Fetch the object
  const { data: object, error } = await supabase
    .from('bookable_objects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !object) {
    return notFound();
  }

  // Check if the user owns this object
  const { data: { user } } = await supabase.auth.getUser();
  if (object.created_by !== user?.id) {
    redirect('/my-objects');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Object</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <ObjectForm
            initialData={object}
            onSubmit={async (data) => {
              'use server';
              const supabase = createServerComponentClient({ cookies });
              
              const { error } = await supabase
                .from('bookable_objects')
                .update(data)
                .eq('id', id);

              if (error) throw error;
              redirect('/my-objects');
            }}
            isLoading={false}
          />
        </div>
      </div>
    </div>
  );
} 