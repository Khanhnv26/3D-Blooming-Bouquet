# 🌸 Website Chúc Mừng 20/10 Dành Tặng Bạn Gái

Một website quà tặng lãng mạn, ngập tràn hiệu ứng chuyển động 3D điện ảnh mượt mà (React Three Fiber, Three.js, Framer Motion, Tailwind CSS) để bạn gửi tặng người thương nhân dịp **Ngày Phụ Nữ Việt Nam 20.10**.

---

## ✨ Điểm Nổi Bật: Bó Hoa 3D Rực Rỡ Không Gian Mở Tràn Màn Hình (SceneBloom)

1. **🌌 Không Gian 3D Mở Tràn Màn Hình (Không Còn Khung Hộp):**
   - Loại bỏ hoàn toàn khung card chữ nhật bó hẹp, giải phóng không gian để **bó hoa 3D lơ lửng tự do giữa vũ trụ hoàng hôn pastel thơ mộng**.
   - Đom đóm vàng lấp lánh, đệm sương mờ dịu nhẹ và cánh hoa hồng rơi bồng bềnh 360 độ khắp màn hình.

2. **✨ Dây Đèn LED Fairy Lights 3D & Sắc Hoa Rực Rỡ:**
   - **48 bóng đèn LED vàng ấm 3D**: Uốn lượn hình xoắn ốc quấn quanh bó hoa, nhấp nháy luân phiên lung linh như một đêm hội cổ tích.
   - **Tâm hoa tỏa sáng ấm áp**: Nguồn sáng vàng dịu từ tâm bó hoa chiếu rọi và phản quang qua từng lớp cánh hoa.
   - **Màu sắc tươi tắn & tương phản cao**: Hoa hồng Ohara đỏ thắm kiêu sa, hoa mẫu đơn kem đào bồng bềnh, tulip cam san hô rạng rỡ và cúc tana trắng nhụy vàng tươi tắn.

3. **🎮 Tương Tác 360° Đỉnh Cao & Giao Diện Tự Ẩn Thông Minh:**
   - **Xoay & Zoom 360° tự do**: Dùng chuột hoặc ngón tay xoay bó hoa mọi góc độ, chụm hai ngón để phóng to ngắm từng cánh hoa.
   - **Tự động ẩn giao diện khi tương tác**: Ngay khi chạm hoặc kéo xoay bó hoa, toàn bộ tiêu đề và nút bấm sẽ biến mất để bạn gái thưởng thức 100% không gian 3D thoáng đãng; dừng thao tác 2 giây các nút bấm sẽ tự động lướt nhẹ hiện lại.
   - **Chạm vào hoa nhận lời nhắn tình yêu**: Chạm vào bất kỳ bông hoa nào, đóa hoa đó sẽ rung nảy lên và một bức thiệp lời nhắn ngọt ngào sẽ bay lên ở giữa màn hình.

4. **💌 Màn 2: Bức Thư Sáp & Album Kỷ Niệm (SceneLetter):**
   - Phong thư sáp cổ điển 3D – chạm vào con dấu trái tim để mở thư.
   - Hiệu ứng máy đánh chữ (Typewriter) gõ từng dòng tâm sự ngọt ngào.
   - Đếm ngày yêu nhau tự động (Love Days Counter).
   - Album ảnh phong cách Polaroid nghiêng nhẹ, bấm vào để phóng to xem chi tiết.
   - Phiếu quà tặng đặc quyền (Vouchers 20/10) có thể ấn để kích hoạt.
   - Câu hỏi tương tác kết màn với nút "Hơi hơi thôi" biết tự động chạy trốn tinh nghịch!

---

## 🚀 Hướng Dẫn Chạy Website

Mở terminal trong thư mục này và chạy:
```bash
npm.cmd run dev
```
Sau đó mở trình duyệt tại: `http://localhost:5173`.

---

## ✏️ Cách Thay Đổi Tên, Lời Chúc & Ảnh Của Hai Bạn

Tất cả thông tin được đặt tập trung trong file:  
👉 **`src/config.js`**

Bạn chỉ cần mở file này và chỉnh sửa:
- `recipientName`: Tên hoặc biệt danh của bạn gái (VD: `"Bé Heo"`, `"Phương Linh"`...).
- `senderName`: Tên của bạn.
- `anniversaryDate`: Ngày hai bạn bắt đầu yêu nhau (định dạng `"YYYY-MM-DD"`) để tự tính số ngày yêu.
- `letter`: Từng đoạn văn tâm thư chúc mừng 20/10.
- `flowerMessages`: Các câu chúc ngọt ngào khi chạm vào từng bông hoa 3D.
- `photos`: Link ảnh kỷ niệm của hai bạn (có thể dùng link ảnh trên mạng hoặc copy ảnh vào thư mục `public/` rồi điền `/ten-anh.jpg`).
- `vouchers`: Các phiếu đặc quyền vui nhộn.
- `audioUrl`: Đường dẫn link nhạc mp3 yêu thích.
"# 3D-Blooming-Bouquet" 
