'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { AuthForm } from '@/components/auth/auth-form';

export default function HomePage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative isolate">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Book Your Perfect Venue
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Discover and book amazing venues for your next event. From conference rooms to party venues,
            we've got you covered.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/catalog">
              <Button size="lg">Browse Catalog</Button>
            </Link>
            <Button variant="outline" size="lg" onClick={() => setOpen(true)}>
              Sign In
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <AuthForm />
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
