const featureMeta = {
    Shape: {
      label: "รูปร่างของก้อน",
      image: "/examples/shapes.jpg",
      examples: {
        Round: {
          title: "รูปร่างกลม",
          description: "ก้อนมีลักษณะกลม มักพบในก้อนที่ไม่อันตราย",
        },
        Oval: {
          title: "รูปร่างรี",
          description: "ก้อนมีลักษณะรี โอกาสเป็นก้อนธรรมดาค่อนข้างสูง",
        },
        Irregular: {
          title: "รูปร่างไม่สม่ำเสมอ",
          description: "ก้อนมีรูปร่างไม่แน่นอน อาจต้องตรวจเพิ่มเติม",
        },
      },
    },

    Margin: {
      label: "ขอบเขตของก้อน",
      image: "/examples/margin.jpg",
      examples: {
        Circumscribed: {
          title: "ขอบชัด",
          description: "ขอบก้อนชัดเจน มักพบในก้อนที่ไม่ร้ายแรง",
        },
        Indistinct: {
          title: "ขอบไม่ชัด",
          description: "ขอบก้อนไม่ชัด อาจต้องเฝ้าระวัง",
        },
        Spiculated: {
          title: "ขอบมีแฉก",
          description: "ขอบก้อนมีแฉก อาจสัมพันธ์กับความเสี่ยงสูง",
        },
      },
    },

    Composition: {
      label: "ลักษณะเนื้อก้อน",
      image: "/examples/composition.jpg",
      examples: {
        Cystic: {
          title: "มีน้ำ",
          description: "ก้อนมีลักษณะเป็นถุงน้ำ",
        },
        Solid: {
          title: "เป็นเนื้อ",
          description: "ก้อนเป็นเนื้อ อาจต้องประเมินเพิ่มเติม",
        },
        Complex: {
          title: "โครงสร้างซับซ้อน",
          description: "มีทั้งของเหลวและเนื้อ",
        },
      },
    },

    Echogenicity: {
      label: "การติดสี",
      image: "/examples/echogenicity.jpg",
      examples: {
        Hypoechoic: {
          title: "สีดำ",
          description: "ก้อนดูมืดกว่าบริเวณรอบข้าง",
        },
        Isoechoic: {
          title: "สีเทา",
          description: "ก้อนมีความสว่างใกล้เคียงเนื้อเยื่อรอบข้าง",
        },
        Hyperechoic: {
          title: "สีขาว",
          description: "ก้อนสว่างกว่าบริเวณรอบข้าง",
        },
      },
    },

    Shadowing: {
      label: "เงาด้านหลัง",
      image: "/examples/shadowing.jpg",
      examples: {
        Present: {
          title: "มีเงา",
          description: "เกิดเงาด้านหลังของก้อน",
        },
        Enhancement: {
          title: "สว่างขึ้น",
          description: "สัญญาณด้านหลังสว่างขึ้น",
        },
        None: {
          title: "ไม่พบเงา",
          description: "ไม่พบการเปลี่ยนแปลงด้านหลัง",
        },
      },

    },
  };
  export default featureMeta;