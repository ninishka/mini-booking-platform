import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ObjectForm } from '@/components/objects/object-form';

export const dynamic = 'force-dynamic';

export default async function NewObjectPage() {
  const supabase = createServerComponentClient({ cookies });

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Object</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <ObjectForm
            onSubmit={async (data) => {
              'use server';
              const supabase = createServerComponentClient({ cookies });
              
              const { error } = await supabase
                .from('bookable_objects')
                .insert([
                  {
                    ...data,
                    created_by: (await supabase.auth.getUser()).data.user?.id,
                  },
                ]);

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