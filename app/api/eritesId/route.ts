import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Process the file here
    // This is a mock response - replace with actual processing logic
    return NextResponse.json({
      message: 'Erites ID document processed successfully',
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}