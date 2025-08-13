import { NextRequest, NextResponse } from 'next/server';
import { simulationService } from '@/lib/simulation-service';

export async function POST(request: NextRequest) {
  try {
    // Debug: Check if API key is available
    console.log('API Key available:', !!process.env.OPENROUTER_API_KEY);
    console.log('API Key length:', process.env.OPENROUTER_API_KEY?.length || 0);
    
    const { postContent, scale } = await request.json();

    if (!postContent || !scale) {
      return NextResponse.json(
        { error: 'Missing required fields: postContent and scale' },
        { status: 400 }
      );
    }

    // Create a readable stream for real-time responses
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Start simulation
          const results = await simulationService.simulatePost(
            postContent,
            scale,
            (result) => {
              // Send each result as it comes in
              const chunk = `data: ${JSON.stringify(result)}\n\n`;
              controller.enqueue(new TextEncoder().encode(chunk));
            }
          );

          // Send completion signal
          const completionChunk = `data: ${JSON.stringify({ type: 'complete', totalResults: results.length })}\n\n`;
          controller.enqueue(new TextEncoder().encode(completionChunk));
          
          controller.close();
        } catch (error) {
          console.error('Simulation error:', error);
          const errorChunk = `data: ${JSON.stringify({ type: 'error', message: 'Simulation failed' })}\n\n`;
          controller.enqueue(new TextEncoder().encode(errorChunk));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return available agents for the frontend
  const agents = simulationService.getAgents();
  return NextResponse.json({ agents });
}
