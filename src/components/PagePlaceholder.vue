<template>
  <div class="placeholder-wrapper animate-fade-in">
    <div class="placeholder-card card-box">
      <!-- Decorative background glow -->
      <div class="glow-orb"></div>
      
      <div class="placeholder-icon">📥</div>
      
      <h2 class="placeholder-title">Giao Diện Trang {{ pageNumber }}</h2>
      <p class="placeholder-subtitle">Đang chờ thiết lập giao diện chính thức</p>
      
      <div class="divider"></div>
      
      <div class="placeholder-instructions">
        <h3>💡 Tiếp Theo:</h3>
        <p>Tôi đã lập trình thành công **Trang 1** theo thiết kế mẫu. Hãy gửi tiếp hình ảnh hoặc mô tả của giao diện **Trang {{ pageNumber }}** tại khung chat, tôi sẽ phân tích và code ngay trang này cho bạn một cách chính xác nhất!</p>
      </div>

      <div class="interactive-upload-mock">
        <div class="dashed-border">
          <span class="upload-icon">📷</span>
          <p>Kéo thả ảnh thiết kế trang {{ pageNumber }} hoặc gửi qua đoạn chat</p>
          <span class="upload-sub">Định dạng khuyên dùng: JPG, PNG, PDF</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PagePlaceholder',
  props: {
    pageNumber: {
      type: Number,
      required: true
    }
  }
};
</script>

<style scoped>
.placeholder-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 70vh;
}

.placeholder-card {
  max-width: 600px;
  width: 100%;
  text-align: center;
  position: relative;
  overflow: hidden;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 48px 32px;
  box-shadow: 0 20px 25px -5px var(--shadow-color), 0 10px 10px -5px var(--shadow-color);
  z-index: 1;
}

.glow-orb {
  position: absolute;
  top: -80px;
  right: -80px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0) 70%);
  filter: blur(20px);
  z-index: -1;
}

.placeholder-icon {
  font-size: 54px;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.placeholder-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.placeholder-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.divider {
  height: 1px;
  background-color: var(--border-color);
  margin: 28px 0;
  width: 100%;
}

.placeholder-instructions {
  text-align: left;
  background-color: var(--bg-primary);
  border: 1px dashed var(--border-color);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 28px;
}

.placeholder-instructions h3 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.placeholder-instructions p {
  font-size: 13.5px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.interactive-upload-mock {
  cursor: pointer;
}

.dashed-border {
  border: 2px dashed var(--border-color);
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 30px 20px;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.placeholder-wrapper:hover .dashed-border {
  border-color: var(--accent-color);
  background-color: rgba(79, 70, 229, 0.04);
}

.upload-icon {
  font-size: 24px;
}

.dashed-border p {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.upload-sub {
  font-size: 11px;
  color: var(--text-secondary);
}

/* Animation */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
