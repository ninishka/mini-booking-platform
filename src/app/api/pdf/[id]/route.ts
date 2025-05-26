import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

export const dynamic = 'force-dynamic';

async function getImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:${response.headers.get('content-type') || 'image/jpeg'};base64,${base64}`;
  } catch (error) {
    console.error('Error fetching image:', error);
    return '';
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: object, error } = await supabase
      .from('bookable_objects')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !object) {
      return new NextResponse('Object not found', { status: 404 });
    }

    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(object.name, 20, 20);

    // Add image if available
    if (object.image_url) {
      try {
        const imageData = await getImageAsBase64(object.image_url);
        if (imageData) {
          // Add image with proper scaling
          const imgWidth = 170; // Max width within margins
          const imgHeight = 100; // Fixed height for image
          doc.addImage(imageData, 'JPEG', 20, 30, imgWidth, imgHeight);
          
          // Start text content below the image
          doc.setFontSize(12);
          doc.text('Property Information', 20, 140);
          
          const content = [
            `Address: ${object.address}`,
            `Capacity: ${object.capacity} people`,
            `Price: $${object.price?.toFixed(2) || 'Not specified'}`,
            '\nDescription:',
            object.description || 'No description available.'
          ];

          let yPosition = 150;
          content.forEach((line) => {
            doc.text(line, 20, yPosition);
            yPosition += 10;
          });
        }
      } catch (imgError) {
        console.error('Error adding image to PDF:', imgError);
        // Fallback to text-only version if image fails
        doc.setFontSize(12);
        doc.text('Property Information', 20, 40);
        
        const content = [
          `Address: ${object.address}`,
          `Capacity: ${object.capacity} people`,
          `Price: $${object.price?.toFixed(2) || 'Not specified'}`,
          '\nDescription:',
          object.description || 'No description available.'
        ];

        let yPosition = 50;
        content.forEach((line) => {
          doc.text(line, 20, yPosition);
          yPosition += 10;
        });
      }
    } else {
      // No image version
      doc.setFontSize(12);
      doc.text('Property Information', 20, 40);
      
      const content = [
        `Address: ${object.address}`,
        `Capacity: ${object.capacity} people`,
        `Price: $${object.price?.toFixed(2) || 'Not specified'}`,
        '\nDescription:',
        object.description || 'No description available.'
      ];

      let yPosition = 50;
      content.forEach((line) => {
        doc.text(line, 20, yPosition);
        yPosition += 10;
      });
    }

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer');

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${object.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_info.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse('Error generating PDF', { status: 500 });
  }
} 