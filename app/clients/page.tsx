'use client';

import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export default function ClientsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto py-8 px-6">
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>Client insights and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Coming Soon</AlertTitle>
              <AlertDescription>
                This page is under construction. Client analytics and visualizations will be available here.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}