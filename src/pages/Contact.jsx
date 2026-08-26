const handleSubmit = async (e) => {
  e.preventDefault();
  setSending(true);
  setError('');
  setSent(false);

  try {
    // 1️⃣ Lưu database
    const { error: dbError } = await supabase
      .from('support_tickets')
      .insert({
        user_name: formData.name,
        user_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: 'pending'
      });

    if (dbError) throw dbError;

    // 2️⃣ Gọi Edge Function
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      }
    });

    if (error) {
      console.error('Edge Function error:', error);
      throw new Error(error.message || 'Gửi email thất bại');
    }

    if (data?.success) {
      setSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    } else {
      throw new Error(data?.error || 'Gửi thất bại');
    }

  } catch (err) {
    setError(err.message || 'Lỗi kết nối, vui lòng thử lại sau');
    console.error('Error:', err);
  } finally {
    setSending(false);
  }
};
