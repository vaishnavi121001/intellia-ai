import { supabase } from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const chatId = searchParams.get('chatId');

    if (!userId) {
      return Response.json({ error: 'Missing userId' }, { status: 400 });
    }

    if (chatId) {
      // Get specific chat
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return Response.json({ chat: data });
    }

    // Get all chats for user
    const { data, error } = await supabase
      .from('chats')
      .select('id, title, subject, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return Response.json({ chats: data || [] });
  } catch (error) {
    console.error('Chat history error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const userId = searchParams.get('userId');

    if (!chatId || !userId) {
      return Response.json(
        { error: 'Missing chatId or userId' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)
      .eq('user_id', userId);

    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete chat error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}