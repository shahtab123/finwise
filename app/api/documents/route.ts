import { NextResponse } from 'next/server';
import { saveDocument, getDocuments, deleteDocument } from '@/lib/services/db';
import { DocumentSchema } from '@/lib/db/schema';

// GET all documents
export async function GET() {
  try {
    const documents = await getDocuments();
    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error in GET /api/documents:', error);
    return NextResponse.json({ error: 'Failed to get documents' }, { status: 500 });
  }
}

// POST new document
export async function POST(request: Request) {
  try {
    const document = DocumentSchema.parse(await request.json());
    await saveDocument(document);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/documents:', error);
    return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
  }
}

// DELETE document
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/documents:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
} 