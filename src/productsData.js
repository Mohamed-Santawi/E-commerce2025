import slidePhone from "./assets/phone.jpeg";
import watch from "./assets/camera.jpg";
import appleLogo from "./assets/appleLogo.png";
import canon from "./assets/canon.png";
import ps from "./assets/ps.jpg";
import psLogo from "./assets/psLogo1.png";
import dell from "./assets/dell.jpg";
import dellLogo from "./assets/dellLogo.png";

const toArabicNumbers = (str) => {
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return str.replace(/\d/g, (digit) => arabicNumbers[parseInt(digit)]);
};

const slides = [
  {
    id: 1,
    name: "iPhone 14 Series",
    nameAr: toArabicNumbers("سلسلة آيفون 14"),
    deal: "Up to 10% off Voucher",
    dealAr: toArabicNumbers("قسيمة خصم تصل إلى 10%"),
    logo: appleLogo,
    image: slidePhone,
  },
  {
    id: 2,
    name: "Canon EOS R5",
    nameAr: "كانون EOS R5",
    deal: "Up to 15% off Voucher",
    dealAr: toArabicNumbers("قسيمة خصم تصل إلى 15%"),
    logo: canon,
    image: watch,
  },
  {
    id: 3,
    name: "Playstation 5",
    nameAr: toArabicNumbers("بلاي ستيشن 5"),
    deal: "Up to 15% off Voucher",
    dealAr: toArabicNumbers("قسيمة خصم تصل إلى 15%"),
    logo: psLogo,
    image: ps,
  },
  {
    id: 4,
    name: "Dell Inspiron 15",
    nameAr: toArabicNumbers("ديل إنسبايرون 15"),
    deal: "Up to 10% off Voucher",
    dealAr: toArabicNumbers("قسيمة خصم تصل إلى 10%"),
    logo: dellLogo,
    image: dell,
  },
];

export default slides;
