import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Calendar, Gift, CheckCircle2, RotateCcw, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioManager } from '../utils/audio';

export default function SceneLetter({ config, onReplay }) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayedParagraphs, setDisplayedParagraphs] = useState([]);
  const [currentParaIndex, setCurrentParaIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [claimedVouchers, setClaimedVouchers] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [proposalAnswered, setProposalAnswered] = useState(false);
  const [runawayOffset, setRunawayOffset] = useState({ x: 0, y: 0 });

  const paragraphs = config.letter.paragraphs;

  // Calculate love days
  const calculateDays = () => {
    if (!config.anniversaryDate) return null;
    const start = new Date(config.anniversaryDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const loveDays = calculateDays();

  // Open letter action
  const handleOpenLetter = () => {
    setIsOpen(true);
    audioManager.playChime();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#f43f5e', '#fb7185', '#fbbf24', '#fecdd3']
    });
  };

  // Typewriter effect
  useEffect(() => {
    if (!isOpen || isTypingComplete) return;

    if (currentParaIndex >= paragraphs.length) {
      setIsTypingComplete(true);
      return;
    }

    const currentText = paragraphs[currentParaIndex];

    if (charIndex < currentText.length) {
      const timer = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
      }, 25);
      return () => clearTimeout(timer);
    } else {
      // Finished typing this paragraph, wait slightly and move to next
      const timer = setTimeout(() => {
        setDisplayedParagraphs((prev) => [...prev, currentText]);
        setCurrentParaIndex((prev) => prev + 1);
        setCharIndex(0);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentParaIndex, charIndex, isTypingComplete, paragraphs]);

  // Fast forward typewriter
  const handleSkipTypewriter = () => {
    setDisplayedParagraphs(paragraphs);
    setIsTypingComplete(true);
  };

  // Claim voucher
  const handleClaimVoucher = (id) => {
    audioManager.playChime();
    setClaimedVouchers((prev) => ({
      ...prev,
      [id]: true
    }));
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#ec4899', '#f59e0b', '#3b82f6']
    });
  };

  // Playful runaway button for "Hơi hơi thôi"
  const handleRunaway = () => {
    const randomX = (Math.random() - 0.5) * 160;
    const randomY = (Math.random() - 0.5) * 90;
    setRunawayOffset({ x: randomX, y: randomY });
  };

  const handleAcceptProposal = () => {
    setProposalAnswered(true);
    audioManager.playChime();
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#f43f5e', '#fb7185', '#fde047', '#38bdf8']
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 w-full max-w-3xl mx-auto px-4 py-8 flex flex-col items-center"
    >
      {/* If envelope is NOT opened yet */}
      {!isOpen ? (
        <div className="flex flex-col items-center justify-center min-h-[75vh] text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold tracking-wide border border-rose-200 shadow-sm mb-3">
              💌 Bức thư sáp niêm phong
            </span>
            <h2 className="font-serif-romantic text-3xl sm:text-4xl font-bold text-rose-950">
              Gửi Cô Gái Của Anh
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              Chạm vào con dấu sáp trái tim để mở ra những lời tự đáy lòng...
            </p>
          </motion.div>

          {/* 3D Vintage Envelope */}
          <motion.div
            whileHover={{ scale: 1.04, rotate: 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleOpenLetter}
            className="relative w-80 sm:w-96 h-52 sm:h-60 bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl border-2 border-rose-200/80 shadow-2xl shadow-rose-300/40 cursor-pointer flex items-center justify-center overflow-hidden group select-none"
          >
            {/* Envelope flap lines */}
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-rose-100/60 to-transparent border-b border-rose-200/60 [clip-path:polygon(0_0,100%_0,50%_100%)]"></div>

            {/* Post stamp top right */}
            <div className="absolute top-4 right-4 w-12 h-14 border-2 border-dashed border-rose-300 rounded bg-white/80 p-1 flex flex-col items-center justify-center text-center shadow-xs">
              <span className="text-[9px] uppercase tracking-tighter text-rose-400 font-bold">20.10</span>
              <span className="text-base">🌸</span>
              <span className="text-[7px] text-stone-400">LOVE</span>
            </div>

            {/* Recipient name on envelope */}
            <div className="text-center z-10 px-4 mt-6">
              <p className="font-handwriting text-2xl sm:text-3xl text-rose-800 font-bold">
                Kính gửi: {config.recipientName}
              </p>
              <p className="text-xs text-rose-500 font-medium mt-1">
                {config.occasion}
              </p>
            </div>

            {/* Glowing Wax Seal Button in Center */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 0 0 rgba(225, 29, 72, 0.4)",
                  "0 0 0 14px rgba(225, 29, 72, 0)",
                  "0 0 0 0 rgba(225, 29, 72, 0.4)"
                ]
              }}
              transition={{ repeat: Infinity, duration: 2.2 }}
              className="absolute z-20 w-16 h-16 rounded-full bg-gradient-to-tr from-rose-700 via-red-600 to-rose-500 border-2 border-amber-300/60 flex items-center justify-center shadow-lg cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full border border-rose-300/40 flex items-center justify-center bg-rose-700/60">
                <Heart className="w-6 h-6 text-amber-200 fill-amber-200 drop-shadow-sm" />
              </div>
            </motion.div>

            {/* Gentle prompt bottom */}
            <div className="absolute bottom-3 text-[11px] text-rose-400 font-medium flex items-center gap-1 group-hover:text-rose-600">
              <Sparkles className="w-3 h-3 text-amber-500 animate-spin" /> Chạm vào con dấu để mở
            </div>
          </motion.div>
        </div>
      ) : (
        /* The Unfolded Letter & Full Experience */
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
          className="w-full flex flex-col items-center gap-8"
        >
          {/* Love Days Counter Header */}
          {loveDays && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-rose-200 shadow-md text-rose-800 text-sm font-medium"
            >
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>Đôi ta đã cùng nhau đi qua</span>
              <span className="font-bold text-rose-600 text-base px-1.5 py-0.5 bg-rose-100 rounded-md">
                {loveDays}
              </span>
              <span>ngày hạnh phúc ❤️</span>
            </motion.div>
          )}

          {/* Authentic Vintage Letter Paper */}
          <div className="relative w-full bg-[#fdfbf7] border border-amber-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-rose-200/50 text-left overflow-hidden">
            {/* Elegant corner ornaments */}
            <div className="absolute top-3 left-4 text-amber-300/60 font-serif text-xl select-none">❧</div>
            <div className="absolute top-3 right-4 text-amber-300/60 font-serif text-xl select-none">☙</div>
            <div className="absolute bottom-3 left-4 text-amber-300/60 font-serif text-xl select-none">❧</div>
            <div className="absolute bottom-3 right-4 text-amber-300/60 font-serif text-xl select-none">☙</div>

            {/* Skip typewriter button */}
            {!isTypingComplete && (
              <button
                onClick={handleSkipTypewriter}
                className="absolute top-4 right-8 text-xs font-semibold px-3 py-1 rounded-full bg-rose-100/80 hover:bg-rose-200 text-rose-700 transition-colors"
              >
                Đọc toàn bộ thư ⚡
              </button>
            )}

            {/* Salutation */}
            <div className="font-serif-romantic text-2xl sm:text-3xl font-bold text-rose-900 mb-6 border-b border-rose-100 pb-3 flex items-center justify-between">
              <span>{config.letter.salutation}</span>
              <span className="text-sm font-sans font-normal text-rose-400">20.10.2026</span>
            </div>

            {/* Body paragraphs with Typewriter effect */}
            <div className="space-y-4 text-stone-700 text-base sm:text-lg leading-relaxed font-sans">
              {displayedParagraphs.map((para, idx) => (
                <p key={idx} className="indent-4 sm:indent-6">
                  {para}
                </p>
              ))}

              {!isTypingComplete && currentParaIndex < paragraphs.length && (
                <p className="indent-4 sm:indent-6 text-rose-950 font-medium">
                  {paragraphs[currentParaIndex].slice(0, charIndex)}
                  <span className="inline-block w-1.5 h-5 bg-rose-500 ml-1 animate-pulse align-middle"></span>
                </p>
              )}
            </div>

            {/* Closing & Handwritten Signature */}
            <div className="mt-8 pt-6 border-t border-rose-100 flex flex-col items-end">
              <span className="text-stone-500 text-sm italic">{config.letter.closing}</span>
              <span className="font-handwriting text-3xl sm:text-4xl text-rose-700 font-bold mt-1 tracking-wide">
                {config.senderName}
              </span>
            </div>
          </div>

          {/* Polaroid Photo Gallery */}
          {config.photos && config.photos.length > 0 && (
            <div className="w-full mt-4">
              <div className="text-center mb-6">
                <span className="text-xs uppercase tracking-widest text-rose-500 font-bold">
                  Khoảnh khắc đôi ta
                </span>
                <h3 className="font-serif-romantic text-2xl sm:text-3xl font-bold text-rose-950">
                  Cuốn Phim Kỷ Niệm 📷
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Chạm vào từng tấm ảnh để phóng to và xem lời thì thầm
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-4 px-2">
                {config.photos.map((photo, index) => {
                  const tilts = ['-rotate-2', 'rotate-2', '-rotate-1', 'rotate-3'];
                  const tiltClass = tilts[index % tilts.length];

                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPhoto(photo)}
                      className={`relative bg-white p-3.5 pb-6 rounded-lg shadow-xl shadow-stone-300/40 border border-stone-200/60 cursor-pointer transition-transform duration-300 ${tiltClass}`}
                    >
                      {/* Realistic Washi Tape at Top */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-rose-200/70 backdrop-blur-xs rounded-xs shadow-xs rotate-1 z-10 border-t border-b border-rose-300/40"></div>

                      {/* Image container */}
                      <div className="w-full aspect-[4/3] rounded overflow-hidden bg-rose-50 mb-3 relative group">
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-rose-950/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                          Xem chi tiết ✨
                        </div>
                      </div>

                      {/* Handwritten Caption */}
                      <p className="font-casual text-base font-bold text-stone-800 line-clamp-2 text-center leading-snug">
                        {photo.caption}
                      </p>
                      {photo.date && (
                        <p className="text-[11px] text-stone-400 text-center mt-1">
                          {photo.date}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Photo Modal Lightbox */}
          <AnimatePresence>
            {selectedPhoto && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPhoto(null)}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white p-4 pb-6 rounded-2xl max-w-lg w-full shadow-2xl relative"
                >
                  <img
                    src={selectedPhoto.url}
                    alt={selectedPhoto.caption}
                    className="w-full max-h-[60vh] object-contain rounded-lg mb-4 bg-stone-100"
                  />
                  <div className="text-center px-2">
                    <p className="font-casual text-2xl font-bold text-rose-900 mb-1">
                      {selectedPhoto.caption}
                    </p>
                    <p className="text-xs text-stone-400">{selectedPhoto.date}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="mt-5 w-full py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition-colors shadow-md"
                  >
                    Đóng lại
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 20/10 Cute Vouchers */}
          {config.vouchers && config.vouchers.length > 0 && (
            <div className="w-full mt-6">
              <div className="text-center mb-6">
                <span className="text-xs uppercase tracking-widest text-rose-500 font-bold">
                  Quà tặng đặc biệt 20/10
                </span>
                <h3 className="font-serif-romantic text-2xl sm:text-3xl font-bold text-rose-950">
                  Phiếu Đặc Quyền Dành Riêng Cho Em 🎁
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Chạm vào từng phiếu quà để kích hoạt đặc quyền vĩnh viễn
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {config.vouchers.map((voucher) => {
                  const isClaimed = claimedVouchers[voucher.id];

                  return (
                    <motion.div
                      key={voucher.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleClaimVoucher(voucher.id)}
                      className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 overflow-hidden ${
                        isClaimed
                          ? 'bg-rose-50/90 border-rose-400 shadow-md shadow-rose-200'
                          : 'bg-white border-dashed border-rose-200 hover:border-rose-300 shadow-sm'
                      }`}
                    >
                      {/* Left Icon */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-100 to-amber-100 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                        {voucher.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-rose-950 text-sm sm:text-base">
                            {voucher.title}
                          </h4>
                          {isClaimed && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          {voucher.desc}
                        </p>
                        <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isClaimed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
                        }`}>
                          {isClaimed ? "✓ Đã kích hoạt đặc quyền" : voucher.status}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Cute Proposal / Love Check at the bottom */}
          <div className="w-full my-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-rose-100/90 via-pink-100/80 to-amber-100/70 border border-rose-200 shadow-xl text-center">
            {!proposalAnswered ? (
              <div>
                <h4 className="font-serif-romantic text-2xl sm:text-3xl font-bold text-rose-950 mb-2">
                  Em có yêu anh nhiều như đóa hoa này không? ❤️
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 mb-6">
                  Hãy chọn thật lòng nha cô gái đáng yêu của anh!
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 relative min-h-[55px]">
                  {/* Button YES */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAcceptProposal}
                    className="px-8 py-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-300 flex items-center gap-2"
                  >
                    Yêu nhiều lắmmm! 🥰
                  </motion.button>

                  {/* Playful Runaway Button NO */}
                  <motion.button
                    animate={{ x: runawayOffset.x, y: runawayOffset.y }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onMouseEnter={handleRunaway}
                    onTouchStart={handleRunaway}
                    onClick={handleAcceptProposal}
                    className="px-6 py-3 rounded-full bg-white/80 border border-rose-200 text-stone-600 hover:text-rose-600 text-xs sm:text-sm font-medium shadow-sm transition-colors"
                  >
                    Hơi hơi thôi 😜
                  </motion.button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-3"
              >
                <div className="text-4xl animate-bounce">💖🎉💐</div>
                <h4 className="font-serif-romantic text-2xl sm:text-3xl font-bold text-rose-900">
                  Anh cũng yêu em nhiều nhất trên đời!
                </h4>
                <p className="text-stone-700 text-sm max-w-md mx-auto">
                  Chúc công chúa một ngày 20/10 ngập tràn niềm vui, hoa và những nụ cười rạng rỡ nhất. Yêu em mãi mãi!
                </p>
              </motion.div>
            )}
          </div>

          {/* Replay experience button */}
          <button
            onClick={onReplay}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 hover:bg-white text-stone-600 hover:text-rose-600 text-xs sm:text-sm font-semibold border border-rose-200 shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Trải nghiệm lại từ đầu 🌸</span>
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
