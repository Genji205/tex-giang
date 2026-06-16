# Kế hoạch triển khai: Cửa sổ nổi (Modal) cài đặt mục tiêu từng tháng

Tài liệu này mô tả chi tiết kế hoạch thiết kế và phát triển tính năng cửa sổ nổi (Modal Popup) để tinh chỉnh mục tiêu từng tháng cho Trang 3: Theo Dõi Mục Tiêu Chất Lượng.

## Mô tả tính năng

* **Hành vi kích hoạt:** Khi người dùng click vào dòng mục tiêu hoặc bất kỳ ô tháng mục tiêu nào trên bảng số liệu của một chỉ số, một cửa sổ nổi (Center Modal Overlay) sẽ xuất hiện.
* **Thẩm mỹ:** Modal hiển thị giữa màn hình với hiệu ứng mờ nền (backdrop blur) hiện đại và tông màu tối/sáng đồng bộ với hệ thống.
* **Cấu hình chi tiết:**
  * Hiển thị bảng cài đặt mục tiêu gồm 12 tháng của chỉ số đã chọn dưới dạng các ô nhập liệu số.
  * Tích hợp chức năng "Thiết lập nhanh cả năm" ngay trong Modal.
* **Lưu & Hủy:** Người dùng chỉnh sửa thông số và chỉ áp dụng/đồng bộ lên biểu đồ/bảng chính khi nhấn nút **"Lưu thay đổi" (Save)**. Nếu nhấn **"Hủy" (Cancel)** hoặc click ra ngoài nền, các chỉnh sửa tạm thời sẽ bị loại bỏ và đóng Modal.

---

## Các thành phần thay đổi

### 1. Frontend Component: [TargetTracking.vue](file:///c:/Users/ATus/Documents/tex-giang/src/components/TargetTracking.vue)

#### [MODIFY] Giao diện template
* **Loại bỏ:** Bảng cấu hình tĩnh `.target-config-card` hiện tại ở đầu trang.
* **Thêm mới:** Cấu trúc Modal HTML ở cuối component:
  ```html
  <div v-if="isModalOpen" class="target-modal-overlay" @click.self="closeModal">
    <div class="target-modal-content animate-scale-in">
      <header class="modal-header">
        <h3>Cấu Hình Mục Tiêu: {{ activeModalMetric.name }}</h3>
        <button class="btn-close-modal" @click="closeModal">&times;</button>
      </header>
      <div class="modal-body">
        <!-- Thiết lập nhanh -->
        <div class="modal-quick-apply">
          <label>Thiết lập nhanh cả năm:</label>
          <input type="number" step="0.1" v-model.number="tempQuickTargetValue" />
          <button @click="applyTempQuickTarget">Áp dụng</button>
        </div>
        <!-- Bảng 12 tháng -->
        <table class="modal-config-table">
          <thead>
            <tr>
              <th v-for="m in 12" :key="m">Tháng {{ m }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td v-for="(val, idx) in tempTargetValues" :key="idx">
                <input type="number" step="0.1" v-model.number="tempTargetValues[idx]" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <footer class="modal-footer">
        <button class="btn-cancel" @click="closeModal">Hủy</button>
        <button class="btn-save" @click="saveModalChanges">Lưu thay đổi</button>
      </footer>
    </div>
  </div>
  ```

#### [MODIFY] Logic Script
* **Thêm state quản lý Modal:**
  * `isModalOpen: false`
  * `activeModalMetricIdx: 0`
  * `tempTargetValues: []` (lưu trữ giá trị tạm thời khi chỉnh sửa trước khi bấm Save)
  * `tempQuickTargetValue: 5.0`
* **Thêm các phương thức mới:**
  * `openSettingsModal(metricIdx, monthIdx)`: Sao chép mảng mục tiêu hiện tại sang `tempTargetValues` của chỉ số đó, mở Modal và (nếu click vào cột cụ thể) tự động focus vào ô nhập của tháng tương ứng.
  * `closeModal()`: Đóng Modal và reset lại các giá trị tạm thời.
  * `applyTempQuickTarget()`: Gán nhanh giá trị `tempQuickTargetValue` vào tất cả 12 phần tử của `tempTargetValues`.
  * `saveModalChanges()`: Phát sự kiện (`$emit('update-target-data')`) cho từng tháng dựa trên mảng `tempTargetValues` đã chỉnh sửa để lưu vào App Store, sau đó đóng Modal.

#### [MODIFY] Stylesheets (CSS scoped)
* Thiết kế lớp phủ nền `.target-modal-overlay` với `backdrop-filter: blur(8px)` và màu nền tối nhẹ.
* Định dạng hộp thoại `.target-modal-content` bo góc `16px`, đổ bóng lớn và hiệu ứng xuất hiện phóng to nhẹ.
* Tách biệt các nút bấm với màu sắc nhấn (`var(--accent-color)` cho Save, viền xám cho Cancel).

---

## Kế hoạch kiểm tra (Verification Plan)

### Kiểm tra thủ công
1. Vào Trang 3, bấm thử vào bất kỳ ô nào trên dòng mục tiêu của biểu đồ bất kỳ.
2. Kiểm tra Modal xem đã hiển thị đúng chỉ số của biểu đồ đó ở tiêu đề và bảng 12 tháng chưa.
3. Thay đổi các chỉ số tháng và bấm nút **"Hủy"** hoặc click ra nền mờ bên ngoài, xác nhận các biểu đồ và bảng chính dưới không thay đổi.
4. Mở lại Modal, chỉnh sửa giá trị và nhấn **"Lưu thay đổi"**, xác nhận biểu đồ và bảng chính cập nhật thông số mục tiêu mới ngay lập tức.
5. Thử tính năng **"Thiết lập nhanh cả năm"** trong Modal và bấm **"Lưu thay đổi"**, xác nhận toàn bộ 12 tháng trên biểu đồ đều chuyển sang mục tiêu mới.
6. Refresh lại trang web để xác nhận các thông số mục tiêu mới vẫn được lưu trữ thành công qua `localStorage`.
