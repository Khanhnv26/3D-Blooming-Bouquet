<div align="center">

# 🌸 3D Blooming Bouquet

### Ứng dụng hiển thị bó hoa 3D và nội dung tương tác

Xây dựng bằng **React · Three.js · Vite · Tailwind CSS**

![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=61DAFB&labelColor=20232A)
![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white&labelColor=20232A)
![Three.js](https://img.shields.io/badge/Three.js-3D-white?style=for-the-badge&logo=threedotjs&logoColor=white&labelColor=20232A)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8&labelColor=20232A)

![React Three Fiber](https://img.shields.io/badge/React_Three_Fiber-9-EC4899?style=flat-square)
![Drei](https://img.shields.io/badge/Drei-10-A78BFA?style=flat-square)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-14-FFCA28?style=flat-square&logo=framer&logoColor=black)
![Lucide React](https://img.shields.io/badge/Icons-Lucide-F56565?style=flat-square&logo=lucide&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

![Tiếng Việt](https://img.shields.io/badge/Ngôn_ngữ-Tiếng_Việt-F43F5E?style=flat-square)
![WebGL và SVG](https://img.shields.io/badge/Hiển_thị-WebGL_%2B_SVG-8B5CF6?style=flat-square)
![Nhạc nền](https://img.shields.io/badge/Âm_thanh-Nhạc_nền_%26_tương_tác-F59E0B?style=flat-square)

[✨ Tính năng](#-tính-năng) · [🚀 Bắt đầu](#-cài-đặt-và-chạy) · [✏️ Cấu hình](#️-cấu-hình-nội-dung) · [📦 Triển khai](#-triển-khai)

🌷 &nbsp; 🌹 &nbsp; 🌸 &nbsp; 🌼 &nbsp; 💐

</div>

---

Ứng dụng web phía trình duyệt hiển thị bó hoa 3D, xử lý tương tác chọn đối tượng và chuyển cảnh theo tiến trình thu thập. Nội dung văn bản sử dụng hiệu ứng gõ từng ký tự, hỗ trợ tiếng Việt và được cấu hình trong `src/config.js`.

## ✨ Tính năng

1. **Màn khởi đầu:** thanh tiến trình mô phỏng, mô hình hộp quà bằng SVG/CSS, hiệu ứng mở nắp, confetti và kích hoạt âm thanh sau thao tác người dùng.
2. **Cảnh 3D:** mô hình hoa hồng Ohara, mẫu đơn, tulip, cúc tana và hồng trà; hiệu ứng ánh sáng, hạt và bung nở. Hỗ trợ kéo để xoay, cuộn chuột hoặc chụm hai ngón để thu phóng; giao diện tạm ẩn khi tương tác.
3. **Tiến trình thu thập:** chọn 5 đối tượng hoa được đánh dấu để hiển thị thông điệp và cập nhật trạng thái. Hoàn thành tiến trình sẽ hiển thị đối tượng mở cảnh văn bản.
4. **Cảnh văn bản:** nền giấy, hiệu ứng gõ từng ký tự và các thành phần trang trí. Hỗ trợ phát lại hiệu ứng văn bản hoặc quay về cảnh 3D.

Website có nút bật/tắt nhạc, chế độ toàn màn hình và nút xem lại hiệu ứng hoa. Nếu trình duyệt không hỗ trợ WebGL hoặc cảnh 3D gặp lỗi khi render, ứng dụng chuyển sang bó hoa SVG với nút mở thư trực tiếp.

## 🛠 Công nghệ

- React 19 và Vite 8.
- Three.js, React Three Fiber và Drei cho cảnh 3D.
- Framer Motion và canvas-confetti cho chuyển động và hiệu ứng.
- Tailwind CSS 4 và Lucide React cho giao diện.
- Web Audio API cho âm thanh tương tác; Oxlint để kiểm tra mã nguồn.

## 🚀 Cài đặt và chạy

Yêu cầu Node.js **20.19+ trong nhánh 20**, hoặc **22.12+**, cùng npm (theo yêu cầu của Vite đang cài trong dự án).

Mở terminal tại thư mục dự án:

```bash
npm ci
npm run dev
```

Mở địa chỉ Vite in trong terminal, mặc định là `http://localhost:5173`. Nếu cổng này đang được dùng, Vite sẽ chọn cổng khác.

Trên Windows, nếu PowerShell chặn script `npm.ps1`, dùng `npm.cmd` thay cho `npm`, ví dụ `npm.cmd run dev`.

Các lệnh khác:

```bash
# Kiểm tra mã nguồn bằng Oxlint
npm run lint

# Tạo bản production trong dist/
npm run build

# Xem thử bản đã build trên máy
npm run preview
```

Để mở trên điện thoại cùng mạng nội bộ, chạy `npm run dev -- --host`, rồi truy cập địa chỉ Network do Vite hiển thị. Máy chạy dự án cần cho phép kết nối qua tường lửa.

## ✏️ Cấu hình nội dung

Chỉnh đối tượng `CONFIG` trong `src/config.js`:

- `recipientName`: tên hoặc biệt danh của người nhận.
- `senderName`: tên người gửi, dùng làm chữ ký cuối thư.
- `occasion`: tên dịp lễ trên màn mở quà.
- `audioUrl`: đường dẫn nhạc nền, mặc định `/music.mp3`.
- `songTitle`: tên bài nhạc hiển thị trên trình phát.
- `letter.salutation`: lời mở đầu bức thư.
- `letter.paragraphs`: mảng các đoạn thư, lần lượt xuất hiện bằng hiệu ứng gõ chữ.
- `letter.closing`: lời kết thư.
- `flowerMessages`: các lời nhắn ngẫu nhiên theo loại hoa (`rose`, `peony`, `tulip`, `tana`, `spray`).
- `secretWhispers`: thông điệp gắn với 5 đối tượng hoa cần thu thập; mỗi mục gồm `id`, `title` và `text`.

Giữ các ID **`0`, `1`, `7`, `9`, `11`** trong `secretWhispers` khi chỉ sửa nội dung. Đây là các ID được dùng trong `QUEST_IDS` tại `src/components/SceneBloom.jsx`; thay đổi bộ hoa nhiệm vụ cần đồng bộ với mã nguồn.

Ví dụ thay nội dung thư (giữ các thuộc tính cấu hình còn lại):

```js
recipientName: "Người nhận",
senderName: "Người gửi",
letter: {
  salutation: "Xin chào,",
  paragraphs: [
    "Đây là đoạn nội dung đầu tiên.",
    "Các đoạn được hiển thị lần lượt bằng hiệu ứng gõ ký tự."
  ],
  closing: "Kết thúc nội dung."
},
```

`anniversaryDate` và `letter.signature` vẫn có trong cấu hình nhưng chưa được giao diện hiện tại sử dụng.

### Thay nhạc và tiêu đề trang

- Thay `public/music.mp3` bằng bài nhạc của bạn, hoặc thêm file vào `public/` và sửa `audioUrl`. Ví dụ `public/bai-hat.mp3` tương ứng với `audioUrl: "/bai-hat.mp3"`.
- Nhạc bắt đầu sau thao tác của người dùng, như chạm mở hộp quà. Nếu chưa nghe thấy, dùng nút bật nhạc ở góc trên bên phải.
- Sửa thẻ `<title>` và favicon trong `index.html` để đổi tên và biểu tượng trên tab trình duyệt.

## 📁 Cấu trúc chính

```text
public/
  music.mp3               # Nhạc nền mặc định
src/
  App.jsx                 # Điều phối màn mở quà, bó hoa và thư
  config.js               # Cấu hình nội dung
  components/
    PreloaderScreen.jsx   # Màn mở hộp quà
    SceneBloom.jsx        # Tương tác hoa và tiến trình mở thư
    Bouquet3D.jsx         # Mô hình và hiệu ứng bó hoa 3D
    SceneBloomSVG.jsx     # Bó hoa dự phòng khi không dùng được 3D
    SceneLetter.jsx       # Bức thư với hiệu ứng gõ chữ
    MusicPlayer.jsx       # Điều khiển nhạc nền
    FullscreenButton.jsx  # Điều khiển toàn màn hình
  utils/audio.js          # Quản lý nhạc và âm thanh tương tác
index.html                # Tiêu đề, favicon và Google Fonts
vite.config.js            # Cấu hình Vite, React và Tailwind CSS
```

## 📦 Triển khai

Chạy `npm run build`, sau đó đưa nội dung thư mục `dist/` lên dịch vụ hosting tĩnh. Ứng dụng chạy phía trình duyệt, không cần backend hay biến môi trường cho cấu hình hiện tại.

Cấu hình mặc định dùng đường dẫn tài nguyên từ gốc tên miền, ví dụ `/music.mp3`. Nếu triển khai dưới đường dẫn con, cần cấu hình `base` trong `vite.config.js` và điều chỉnh đường dẫn nhạc tương ứng. Google Fonts được tải từ bên ngoài; khi không có mạng, trình duyệt sử dụng phông dự phòng.
