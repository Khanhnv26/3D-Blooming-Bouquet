// =========================================================================
// CẤU HÌNH THÔNG TIN DÀNH CHO BẠN GÁI (CHỈNH SỬA TẠI ĐÂY)
// Bạn có thể thoải mái thay đổi tên, lời chúc, ảnh và nhạc theo ý thích!
// =========================================================================

export const CONFIG = {
  // 1. THÔNG TIN CƠ BẢN
  recipientName: "Em Yêu", // Tên hoặc biệt danh bạn gái (VD: Phương Linh, Bé Heo, Mèo Con...)
  senderName: "Người thương của em", // Tên hoặc biệt danh của bạn
  occasion: "Ngày Phụ Nữ Việt Nam 20.10",
  anniversaryDate: "2024-10-20", // Ngày bắt đầu yêu nhau (định dạng YYYY-MM-DD để tính ngày yêu)

  // 2. NHẠC NỀN
  // Bạn có thể thay đổi bằng đường link mp3 trực tiếp bất kỳ
  audioUrl: "https://assets.mixkit.co/music/preview/mixkit-romantic-moment-1033.mp3",
  songTitle: "Romantic Piano - Dành riêng cho em",

  // 3. NỘI DUNG TÂM THƯ 20/10
  letter: {
    salutation: "Gửi công chúa nhỏ của anh,",
    paragraphs: [
      "Hôm nay là ngày 20/10 - một ngày thật đặc biệt, ngày để cả thế giới tôn vinh những người phụ nữ tuyệt vời. Nhưng đối với anh, người phụ nữ rạng rỡ và dịu dàng nhất trên đời này chỉ có một, chính là em.",
      "Cảm ơn em đã xuất hiện trong cuộc đời anh, mang theo nụ cười trong veo làm bừng sáng cả những ngày u tối nhất. Mỗi khoảnh khắc được bên em, nghe em kể những câu chuyện thường ngày, cùng em ăn những món em thích, anh đều cảm thấy mình là người may mắn nhất thế gian.",
      "Nhân ngày Phụ nữ Việt Nam 20/10, anh chúc cô gái của anh luôn luôn xinh đẹp, hạnh phúc, bình yên và rạng rỡ như đóa hoa vừa nở. Dù ngoài kia thế giới có ồn ào hay mệt mỏi thế nào, hãy nhớ rằng anh sẽ luôn ở đây, ôm em vào lòng và là điểm tựa vững vàng nhất cho em.",
      "Yêu em nhiều hơn những gì một trang web hay ngàn đóa hoa có thể nói hết! ❤️"
    ],
    closing: "Mãi yêu em,",
    signature: "Chàng trai của em"
  },

  // 4. ALBUM ẢNH POLAROID KỶ NIỆM
  // Thay thế các link ảnh bằng ảnh thật của hai bạn (hoặc đặt ảnh vào thư mục public/ và điền tên file, ví dụ "/anh1.jpg")
  photos: [
    {
      url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
      caption: "Nụ cười của em là điều đẹp nhất thế giới ✨",
      date: "Kỷ niệm ngày hẹn hò đầu tiên"
    },
    {
      url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80",
      caption: "Cùng nhau đi qua bốn mùa thương nhớ 🌿",
      date: "Chuyến du lịch đáng nhớ"
    },
    {
      url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      caption: "Chỉ cần là em, nơi đâu cũng bình yên 💖",
      date: "Khoảnh khắc hoàng hôn đôi ta"
    }
  ],

  // 5. CÁC ĐẶC QUYỀN VOUCHER 20/10 DỄ THƯƠNG
  vouchers: [
    {
      id: "v1",
      icon: "👑",
      title: "Voucher: Hôm Nay Em Là Sếp",
      desc: "Toàn quyền quyết định mọi việc, anh chỉ có 'Dạ' và 'Vâng'!",
      status: "Khả dụng vĩnh viễn"
    },
    {
      id: "v2",
      icon: "🧋",
      title: "Voucher: Trà Sữa & Đồ Ăn Ngon",
      desc: "Bất cứ lúc nào em thèm ăn, anh lập tức mua và giao tận tay.",
      status: "Không giới hạn số lần"
    },
    {
      id: "v3",
      icon: "🫂",
      title: "Voucher: 1000 Cái Ôm & Nụ Hôn",
      desc: "Nạp năng lượng tức thì bất cứ khi nào em thấy mệt mỏi hay tủi thân.",
      status: "Sử dụng ngay lập tức"
    },
    {
      id: "v4",
      icon: "✨",
      title: "Voucher: Xóa Hết Mọi Giận Hờn",
      desc: "Khiến anh phải làm mọi cách để dỗ dành cho đến khi em mỉm cười.",
      status: "Đặc quyền tối cao"
    }
  ],

  // 6. LỜI NHẮN KHI CHẠM VÀO TỪNG BÔNG HOA 3D (theo loại hoa)
  flowerMessages: {
    rose: [
      "Hoa hồng: anh yêu em nhiều hơn hôm qua và ít hơn ngày mai 🌹",
      "Mỗi cánh hồng là một lý do anh thương em ❤️",
      "Em là đóa hồng đẹp nhất trong vườn đời anh 💖"
    ],
    peony: [
      "Mẫu đơn: chúc em luôn giàu niềm vui và hạnh phúc 🌸",
      "Em dịu dàng và rực rỡ như đóa mẫu đơn này ✨"
    ],
    tulip: [
      "Tulip: tình yêu chân thành anh dành cho em 🌷",
      "Cảm ơn em đã luôn ở bên anh 🥰"
    ],
    tana: [
      "Cúc tana: nụ cười của em trong veo như thế này 🌼",
      "Cứ cười thật nhiều nhé, vì nụ cười em làm anh bình yên ☀️"
    ],
    spray: [
      "Hồng trà bé xíu: bé xíu thôi nhưng thương em thật nhiều 💕",
      "Gửi em một nụ hôn thơm mùi hoa 😘"
    ]
  }
};
