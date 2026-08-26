import emailjs from '@emailjs/browser';

// 👉 Cấu hình EmailJS
const SERVICE_ID = 'service_i4ww7md';
const TEMPLATE_ID_USER = 'template_eoitihx';
const PUBLIC_KEY = 'RCMv-hwVtokArn48n';

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

    // 2️⃣ Gửi email qua EmailJS
    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID_USER,
      {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
      },
      PUBLIC_KEY
    );

    if (result.status === 200) {
      setSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    } else {
      throw new Error('Gửi email thất bại');
    }

  } catch (err) {
    setError(err.message || 'Lỗi kết nối, vui lòng thử lại sau');
    console.error('Error:', err);
  } finally {
    setSending(false);
  }
};
