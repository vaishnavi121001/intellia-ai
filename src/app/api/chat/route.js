import { chat } from '@/lib/groq';

export async function POST(request) {
  try {
    const body = await request.json();
    const { systemPrompt, messages, maxTokens } = body;

    console.log('📥 Chat API Request:', {
      hasSystemPrompt: !!systemPrompt,
      messagesCount: messages?.length,
      maxTokens,
    });

    // Validation
    if (!systemPrompt) {
      return Response.json(
        { error: 'systemPrompt is required' },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: 'messages array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate message format
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return Response.json(
          { error: 'Each message must have role and content' },
          { status: 400 }
        );
      }
    }

    // Call Groq
    console.log('🚀 Calling Groq API...');
    const responseText = await chat(
      messages,
      systemPrompt,
      maxTokens || 4000
    );

    if (!responseText) {
      throw new Error('Empty response from Groq');
    }

    console.log('✅ Groq API Success');

    return Response.json({
      success: true,
      text: responseText,
    });
  } catch (error) {
    console.error('❌ Chat API Error:', error);

    return Response.json(
      {
        error: error.message || 'Failed to process chat request',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
      },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS(request) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}