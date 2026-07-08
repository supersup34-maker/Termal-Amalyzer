export interface HotspotCoordinates {
  x: number; // 0 to 100
  y: number; // 0 to 100
}

export interface HotspotSample {
  id: string;
  title: string;
  equipmentType: string;
  description: string;
  svgMarkup: string;
  // Pre-calculated expert analysis for zero-delay instant preview
  precalculated: {
    equipmentType: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    maxTemp: number;
    ambientTemp: number;
    tempDiff: number;
    anomalyDescription: string;
    hotspotCoordinates: HotspotCoordinates;
    causes: string[];
    actions: string[];
    urgencyWindow: string;
    standardsCompliance: string;
  };
}

export const HOTSPOT_SAMPLES: HotspotSample[] = [
  {
    id: "transformer-bushing",
    title: "ขั้วต่อแรงสูงหม้อแปลง (Transformer Bushing)",
    equipmentType: "หม้อแปลงไฟฟ้า (Power Transformer)",
    description: "จุดต่อบุชชิ่งแรงสูง เฟส B เกิดความร้อนสะสมรุนแรงเนื่องจากการสัมผัสไม่ดี",
    svgMarkup: `<svg viewBox="0 0 500 350" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <!-- Background (Dark IR Thermal Environment) -->
  <rect width="500" height="350" fill="#08031a"/>
  
  <!-- Transformer Tank Profile (Medium temperature, deep purple-blue) -->
  <path d="M 50 180 L 450 180 L 450 330 L 50 330 Z" fill="#1b124a" stroke="#2c1f7a" stroke-width="2"/>
  <rect x="70" y="210" width="80" height="100" fill="#251966" rx="5"/>
  <rect x="210" y="210" width="80" height="100" fill="#251966" rx="5"/>
  <rect x="350" y="210" width="80" height="100" fill="#251966" rx="5"/>
  
  <!-- Bushing Base Coils (Warm, pinkish) -->
  <rect x="100" y="150" width="40" height="30" fill="#3c1e7d" rx="3"/>
  <rect x="230" y="150" width="40" height="30" fill="#3c1e7d" rx="3"/>
  <rect x="360" y="150" width="40" height="30" fill="#3c1e7d" rx="3"/>

  <!-- Bushing Insulators (Cones) -->
  <!-- Bushing A (Normal/Cool) -->
  <path d="M 110 150 L 115 80 L 125 80 L 130 150 Z" fill="#2c146e"/>
  <ellipse cx="120" cy="80" rx="5" ry="2" fill="#5829bf"/>
  <!-- Bushing B (ANOMALOUS / EXTREMELY HOT) -->
  <path d="M 240 150 L 245 80 L 255 80 L 260 150 Z" fill="#751b6e"/>
  <!-- Bushing C (Normal/Cool) -->
  <path d="M 370 150 L 375 80 L 385 80 L 390 150 Z" fill="#2c146e"/>
  <ellipse cx="380" cy="80" rx="5" ry="2" fill="#5829bf"/>

  <!-- Connections / Busbars -->
  <path d="M 120 80 Q 80 50 20 50" fill="none" stroke="#2c146e" stroke-width="4"/>
  <path d="M 250 80 Q 250 40 250 30" fill="none" stroke="#d91e36" stroke-width="4"/>
  <path d="M 380 80 Q 420 50 480 50" fill="none" stroke="#2c146e" stroke-width="4"/>

  <!-- Hotspot Thermal Gradients for Bushing B (The central anomaly) -->
  <circle cx="250" cy="80" r="45" fill="url(#hotspotGrad1)" opacity="0.4"/>
  <circle cx="250" cy="80" r="28" fill="url(#hotspotGrad2)" opacity="0.75"/>
  <circle cx="250" cy="80" r="14" fill="url(#hotspotGrad3)" opacity="0.95"/>
  <circle cx="250" cy="80" r="5" fill="#ffffff"/>

  <!-- Secondary minor heating downward -->
  <ellipse cx="250" cy="110" rx="10" ry="18" fill="url(#hotspotGrad1)" opacity="0.35"/>

  <!-- Temperature Crosshair Marker & Label -->
  <line x1="235" y1="80" x2="265" y2="80" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
  <line x1="250" y1="65" x2="250" y2="95" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
  <rect x="262" y="62" width="54" height="18" fill="rgba(0,0,0,0.7)" rx="3"/>
  <text x="267" y="75" font-family="monospace" font-size="11" fill="#ffffff" font-weight="bold">85.4°C</text>

  <!-- Reference Spot (Cool Area) -->
  <line x1="110" y1="260" x2="130" y2="260" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
  <line x1="120" y1="250" x2="120" y2="270" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
  <rect x="132" y="252" width="54" height="18" fill="rgba(0,0,0,0.7)" rx="3"/>
  <text x="137" y="265" font-family="monospace" font-size="11" fill="#8bf" font-weight="bold">30.2°C</text>

  <!-- Color Palette Scale Bar on the Right -->
  <rect x="470" y="50" width="12" height="250" fill="url(#irScaleGrad)" rx="2"/>
  <text x="452" y="62" font-family="monospace" font-size="9" fill="#ffffff">90°C</text>
  <text x="452" y="175" font-family="monospace" font-size="9" fill="#d0c">50°C</text>
  <text x="452" y="295" font-family="monospace" font-size="9" fill="#8bf">20°C</text>

  <!-- Definitions of gradients -->
  <defs>
    <radialGradient id="hotspotGrad1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff0055" stop-opacity="1"/>
      <stop offset="50%" stop-color="#ff7b00" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#2c146e" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hotspotGrad2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffeb3b" stop-opacity="1"/>
      <stop offset="40%" stop-color="#ff9800" stop-opacity="1"/>
      <stop offset="100%" stop-color="#ff0055" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hotspotGrad3" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="30%" stop-color="#fff59d" stop-opacity="1"/>
      <stop offset="100%" stop-color="#ffeb3b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="irScaleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="15%" stop-color="#ffeb3b"/>
      <stop offset="40%" stop-color="#ff9800"/>
      <stop offset="65%" stop-color="#ff0055"/>
      <stop offset="85%" stop-color="#751b6e"/>
      <stop offset="100%" stop-color="#08031a"/>
    </linearGradient>
  </defs>
</svg>`,
    precalculated: {
      equipmentType: "หม้อแปลงไฟฟ้าแรงสูง (High Voltage Transformer)",
      severity: "CRITICAL",
      maxTemp: 85.4,
      ambientTemp: 30.2,
      tempDiff: 55.2,
      anomalyDescription: "พบความร้อนสูงวิกฤต (Critical Hotspot) ที่ขั้วต่อบุชชิ่งแรงสูง (Bushing High-Voltage Terminal) เฟส B โดยอุณหภูมิขั้วต่อสูงถึง 85.4°C ขณะที่เฟสข้างเคียงและอุณหภูมิแวดล้อมอยู่ที่ประมาณ 30°C ซึ่งมีค่าผลต่างอุณหภูมิ (Delta T) สูงถึง 55.2°C บ่งชี้ว่าเกิดความต้านทานสัมผัส (Contact Resistance) สูงอย่างรุนแรง เสี่ยงต่อการเกิดอาร์ก (Arcing) และเกิดการระเบิดเสียหายรุนแรง",
      hotspotCoordinates: { x: 50, y: 22.8 },
      causes: [
        "น็อตขั้วต่อสาย (Terminal Connector) หลวมคลอนเนื่องจากการสั่นสะเทือนขณะใช้งาน",
        "เกิดออกไซด์รุนแรง (Severe Oxidation) บริเวณผิวหน้าสัมผัสของโลหะ ทำให้กระแสไหลผ่านได้ยาก",
        "การติดตั้งไม่ได้ใช้ประแจปอนด์ (Torque Wrench) ขันตามพิกัดแรงบิดมาตรฐานของผู้ผลิต",
        "หน้าสัมผัสชำรุดเสียหายจากการเกิดอาร์กขนาดเล็กก่อนหน้านี้"
      ],
      actions: [
        "ประสานงานตัดกระแสไฟทันที (Emergency Shutdown) เพื่อความปลอดภัยและหลีกเลี่ยงความเสียหายแบบลุกลาม",
        "ตรวจสอบรอยกัดกร่อน คราบสนิม และรอยไหม้บนแกนเกลียวบุชชิ่งและแคลมป์สายต่อ",
        "ขัดทำความสะอาดพื้นผิวสัมผัสด้วยแปรงลวดทองเหลืองและน้ำยาทำความสะอาดหน้าสัมผัสไฟฟ้า (Contact Cleaner)",
        "เปลี่ยนชิ้นส่วนเทอร์มินอลแคลมป์และสลักเกลียวใหม่ที่มีพิกัดนำไฟฟ้าเหมาะสม",
        "ทาหน้าสัมผัสด้วยสารป้องกันอาร์กและออกไซด์ (Conductive/Anti-oxidation Grease)",
        "ขันแน่นจุดต่อทั้งหมดด้วยประแจปอนด์ (Torque Wrench) ตามค่าแรงบิดมาตรฐานที่ระบุ",
        "ตรวจสอบซ้ำด้วยกล้องถ่ายภาพความร้อนทันทีหลังจากจ่ายกระแสไฟฟ้ากลับคืนระบบ"
      ],
      urgencyWindow: "ดำเนินการแก้ไขทันทีภายใน 24 ชั่วโมง เพื่อป้องกันความเสียหายร้ายแรงต่อหม้อแปลง",
      standardsCompliance: "ตามมาตรฐานอ้างอิง NETA MTS-2023 และ NFPA 70B (ผลต่างอุณหภูมิเกิน 40°C ถือเป็นความบกพร่องขั้นวิกฤตที่ต้องตัดกระแสไฟฟ้าแก้ไขทันที)"
    }
  },
  {
    id: "cable-joint",
    title: "จุดต่อสายเคเบิลใต้ดิน (Medium Voltage Cable Joint)",
    equipmentType: "สายเคเบิลแรงดันกลาง (MV Cable Splice)",
    description: "จุดเชื่อมต่อสายไฟใต้ดินขนาดใหญ่ เกิดความร้อนสูงจากความต้านทานสัมผัส",
    svgMarkup: `<svg viewBox="0 0 500 350" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <!-- Background (Dark IR Thermal Environment) -->
  <rect width="500" height="350" fill="#0c071d"/>
  
  <!-- MV Cable Splice Profile (Indigo and deep purple) -->
  <rect x="20" y="155" width="460" height="40" fill="#1e1345" rx="5" stroke="#35266e" stroke-width="1.5"/>
  <rect x="180" y="145" width="140" height="60" fill="#2d1d61" rx="8" stroke="#4a3596" stroke-width="2"/>
  
  <!-- Cable Support Clamps -->
  <rect x="80" y="150" width="15" height="50" fill="#120c2e" stroke="#251b52"/>
  <rect x="400" y="150" width="15" height="50" fill="#120c2e" stroke="#251b52"/>

  <!-- Hotspot Gradient along the splice joint -->
  <ellipse cx="250" cy="175" rx="65" ry="35" fill="url(#hotspotGrad1)" opacity="0.35"/>
  <ellipse cx="250" cy="175" rx="40" ry="22" fill="url(#hotspotGrad2)" opacity="0.8"/>
  <ellipse cx="250" cy="175" rx="18" ry="11" fill="url(#hotspotGrad3)" opacity="0.95"/>
  <circle cx="250" cy="175" r="4" fill="#ffffff"/>

  <!-- Heat conduction along the wire -->
  <path d="M 120 175 L 180 175" stroke="#ff3d00" stroke-width="6" opacity="0.4"/>
  <path d="M 320 175 L 380 175" stroke="#ff3d00" stroke-width="4" opacity="0.3"/>

  <!-- Temperature Crosshair Marker & Label -->
  <line x1="235" y1="175" x2="265" y2="175" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
  <line x1="250" y1="160" x2="250" y2="190" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
  <rect x="262" y="157" width="54" height="18" fill="rgba(0,0,0,0.7)" rx="3"/>
  <text x="267" y="170" font-family="monospace" font-size="11" fill="#ffffff" font-weight="bold">58.2°C</text>

  <!-- Reference Spot (Cool Area of Outer Cable Jacket) -->
  <line x1="60" y1="175" x2="80" y2="175" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
  <line x1="70" y1="165" x2="70" y2="185" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
  <rect x="82" y="167" width="54" height="18" fill="rgba(0,0,0,0.7)" rx="3"/>
  <text x="87" y="180" font-family="monospace" font-size="11" fill="#8bf" font-weight="bold">28.1°C</text>

  <!-- Color Palette Scale Bar on the Right -->
  <rect x="470" y="50" width="12" height="250" fill="url(#irScaleGrad)" rx="2"/>
  <text x="452" y="62" font-family="monospace" font-size="9" fill="#ffffff">65°C</text>
  <text x="452" y="175" font-family="monospace" font-size="9" fill="#d0c">40°C</text>
  <text x="452" y="295" font-family="monospace" font-size="9" fill="#8bf">20°C</text>

  <!-- Definitions of gradients -->
  <defs>
    <radialGradient id="hotspotGrad1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff0055" stop-opacity="1"/>
      <stop offset="60%" stop-color="#ff7b00" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#1e1345" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hotspotGrad2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffeb3b" stop-opacity="1"/>
      <stop offset="40%" stop-color="#ff9800" stop-opacity="1"/>
      <stop offset="100%" stop-color="#ff0055" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hotspotGrad3" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="40%" stop-color="#fff59d" stop-opacity="1"/>
      <stop offset="100%" stop-color="#ffeb3b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="irScaleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="15%" stop-color="#ffeb3b"/>
      <stop offset="40%" stop-color="#ff9800"/>
      <stop offset="65%" stop-color="#ff0055"/>
      <stop offset="85%" stop-color="#751b6e"/>
      <stop offset="100%" stop-color="#0c071d"/>
    </linearGradient>
  </defs>
</svg>`,
    precalculated: {
      equipmentType: "สายเคเบิลแรงดันไฟฟ้าปานกลาง (Medium Voltage Cable Splice)",
      severity: "HIGH",
      maxTemp: 58.2,
      ambientTemp: 28.1,
      tempDiff: 30.1,
      anomalyDescription: "ตรวจพบความร้อนสะสมระดับสูง (High Severity Anomaly) บริเวณแกนกลางจุดต่อเชื่อมสายไฟเคเบิล (Inline Splice Splice Joint) อุณหภูมิพุ่งสูงถึง 58.2°C โดยมีความต่างของอุณหภูมิจากผิวสายปกติถึง 30.1°C ความร้อนดังกล่าวเริ่มลุกลามและเหนี่ยวนำความร้อนไปตามตัวนำสายไฟข้างเคียง บ่งบอกถึงภาวะสูญเสียความเป็นฉนวนตัวนำไฟฟ้า และความต้านทานหน้าสัมผัสภายในปลอกเชื่อมสูงเกินมาตรฐาน",
      hotspotCoordinates: { x: 50, y: 50 },
      causes: [
        "การย้ำปลอกต่อสาย (Sleeve Crimping) ด้วยคีมย้ำไม่แน่นหนาพอ หรือเลือกขนาดปลอกไม่พอดีกับขนาดสายไฟ",
        "มีความชื้นหรือสิ่งสกปรกหลงเหลือภายในโครงสร้างรอยต่อขณะเริ่มติดตั้ง ทำให้เกิดการกัดกร่อน",
        "ตัวบดอัดรอยต่อเกิดสนิมหรือคราบนิเกิล/ทองแดงซัลไฟด์ ส่งผลให้ความต้านทานกระแสสูงขึ้น",
        "สายเคเบิลรับภาระโหลดกระแสไฟฟ้ากระชากบ่อยครั้งเกินข้อกำหนดสายไฟ"
      ],
      actions: [
        "จัดตารางเวลาหยุดจ่ายไฟ (Scheduled Outage) เพื่อรื้อถอนและเปลี่ยนปลอกต่อสายและรอยต่อใหม่",
        "ตัดส่วนรอยต่อเคเบิลที่ชำรุดออกและเชื่อมรอยต่อใหม่ (Re-splicing) โดยใช้ชุดอุปกรณ์สายเชื่อมที่มีคุณภาพสูง",
        "ตรวจสอบแรงอัดของการย้ำปลอกต่อสายโดยใช้เครื่องมือไฮดรอลิกที่มีการควบคุมแรงดันอย่างแม่นยำ",
        "ทำความสะอาดบริเวณรอยต่อให้แห้งสนิทและไร้ฝุ่น 100% ก่อนใส่ปลอกหุ้มหดเย็น/หดร้อน (Heat/Cold Shrink Sleeve)",
        "ทำการทดสอบการรั่วไหลของกระแส (Partial Discharge Test) และตรวจหาค่าความเป็นฉนวนไฟฟ้า (Megger Test)"
      ],
      urgencyWindow: "ควรดำเนินการแก้ไขและซ่อมบำรุงในรอบหยุดการทำงานเพื่อบำรุงรักษาโดยเร็วที่สุด หรือภายใน 7 วันข้างหน้า",
      standardsCompliance: "มาตรฐาน IEEE 400 (ความผิดพลาดในจุดต่อสายดินและสายส่งความดันสูงปานกลาง หากผลต่างอุณหภูมิเกิน 20°C - 40°C จัดเป็นความเสี่ยงระดับสูงมาก ควรรับการดับไฟซ่อมบำรุงอย่างมีแผน)"
    }
  },
  {
    id: "circuit-breaker",
    title: "หน้าสัมผัสเซอร์กิตเบรกเกอร์ (Circuit Breaker Pole Contacts)",
    equipmentType: "เซอร์กิตเบรกเกอร์แรงดันต่ำ (LV Circuit Breaker)",
    description: "ขั้วต่อสายไฟขาเข้าด้านล่าง (Phase L3) ของเซอร์กิตเบรกเกอร์ มีความร้อนสะสมปานกลาง",
    svgMarkup: `<svg viewBox="0 0 500 350" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <!-- Background (Dark IR Thermal Environment) -->
  <rect width="500" height="350" fill="#07041a"/>
  
  <!-- Breaker body (Dark Blue) -->
  <rect x="100" y="50" width="300" height="250" fill="#1b1244" rx="4" stroke="#312270" stroke-width="2"/>
  
  <!-- Breaker Switch Toggle Handle -->
  <rect x="235" y="150" width="30" height="50" fill="#2c1a6b" rx="2" stroke="#482fa8" stroke-width="1.5"/>
  <rect x="235" y="150" width="30" height="20" fill="#110930" rx="1"/>

  <!-- Three Phase Terminals Top -->
  <rect x="140" y="30" width="30" height="20" fill="#221557" rx="2"/>
  <rect x="235" y="30" width="30" height="20" fill="#221557" rx="2"/>
  <rect x="330" y="30" width="30" height="20" fill="#221557" rx="2"/>

  <!-- Three Phase Terminals Bottom (Input) -->
  <!-- Pole 1 (Cool) -->
  <rect x="140" y="300" width="30" height="20" fill="#221557" rx="2"/>
  <path d="M 155 320 L 155 345" stroke="#221557" stroke-width="6"/>
  <!-- Pole 2 (Cool) -->
  <rect x="235" y="300" width="30" height="20" fill="#221557" rx="2"/>
  <path d="M 250 320 L 250 345" stroke="#221557" stroke-width="6"/>
  <!-- Pole 3 (HOT SPOT - Anomaly on L3 terminal) -->
  <rect x="330" y="300" width="30" height="20" fill="#5c1954" rx="2"/>
  <path d="M 345 320 L 345 345" stroke="#ad2153" stroke-width="6"/>

  <!-- Hotspot Gradient on Phase L3 Terminal -->
  <circle cx="345" cy="305" r="35" fill="url(#hotspotGrad1)" opacity="0.3"/>
  <circle cx="345" cy="305" r="20" fill="url(#hotspotGrad2)" opacity="0.75"/>
  <circle cx="345" cy="305" r="10" fill="url(#hotspotGrad3)" opacity="0.9"/>
  <circle cx="345" cy="305" r="3" fill="#ffffff"/>

  <!-- Temperature Crosshair Marker & Label -->
  <line x1="330" y1="305" x2="360" y2="305" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
  <line x1="345" y1="290" x2="345" y2="320" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
  <rect x="272" y="287" width="54" height="18" fill="rgba(0,0,0,0.7)" rx="3"/>
  <text x="277" y="300" font-family="monospace" font-size="11" fill="#ffffff" font-weight="bold">45.2°C</text>

  <!-- Reference Spot (Cool Area on Phase L1 Terminal) -->
  <line x1="140" y1="305" x2="160" y2="305" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
  <line x1="150" y1="295" x2="150" y2="315" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
  <rect x="162" y="292" width="54" height="18" fill="rgba(0,0,0,0.7)" rx="3"/>
  <text x="167" y="305" font-family="monospace" font-size="11" fill="#8bf" font-weight="bold">31.4°C</text>

  <!-- Color Palette Scale Bar on the Right -->
  <rect x="470" y="50" width="12" height="250" fill="url(#irScaleGrad)" rx="2"/>
  <text x="452" y="62" font-family="monospace" font-size="9" fill="#ffffff">50°C</text>
  <text x="452" y="175" font-family="monospace" font-size="9" fill="#d0c">35°C</text>
  <text x="452" y="295" font-family="monospace" font-size="9" fill="#8bf">20°C</text>

  <!-- Definitions of gradients -->
  <defs>
    <radialGradient id="hotspotGrad1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff0055" stop-opacity="1"/>
      <stop offset="60%" stop-color="#ff7b00" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#221557" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hotspotGrad2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffeb3b" stop-opacity="1"/>
      <stop offset="45%" stop-color="#ff9800" stop-opacity="1"/>
      <stop offset="100%" stop-color="#ff0055" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hotspotGrad3" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="40%" stop-color="#fff59d" stop-opacity="1"/>
      <stop offset="100%" stop-color="#ffeb3b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="irScaleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="15%" stop-color="#ffeb3b"/>
      <stop offset="40%" stop-color="#ff9800"/>
      <stop offset="65%" stop-color="#ff0055"/>
      <stop offset="85%" stop-color="#751b6e"/>
      <stop offset="100%" stop-color="#07041a"/>
    </linearGradient>
  </defs>
</svg>`,
    precalculated: {
      equipmentType: "เซอร์กิตเบรกเกอร์แรงดันต่ำ (Low Voltage Circuit Breaker)",
      severity: "MEDIUM",
      maxTemp: 45.2,
      ambientTemp: 31.4,
      tempDiff: 13.8,
      anomalyDescription: "ตรวจพบความร้อนระดับปานกลาง (Medium Severity Anomaly) บริเวณขั้วต่อสายฝั่งเข้าของขั้วสาย L3 (Phase C Terminal) ของเซอร์กิตเบรกเกอร์ มีค่าอุณหภูมิ 45.2°C ต่างจากขั้ว L1 ที่อุณหภูมิปกติ 31.4°C อยู่ประมาณ 13.8°C ความร้อนดังกล่าวอาจเกิดจากการเชื่อมต่อหลวมเล็กน้อยหรือกระแสโหลดในเฟส L3 สูงกว่าเฟสอื่น (Load Unbalance)",
      hotspotCoordinates: { x: 69, y: 87.1 },
      causes: [
        "สลักเกลียวจุดเชื่อมสายไฟเริ่มคลายตัวจากการขยายตัวและหดตัวจากความร้อนซ้ำๆ",
        "มีการต่อโหลดไฟฟ้าไม่สมดุลทางไฟฟ้า (Unbalanced Load) ทำให้มีกระแสไหลสูงเป็นพิเศษที่เฟส L3",
        "ความขรุขระของหน้าสัมผัสของขั้วต่อสายสะสมฝุ่นแป้งหรือสิ่งสกปรกเล็กน้อย"
      ],
      actions: [
        "ตรวจสอบการกระจายตัวของกระแสไฟฟ้าแต่ละเฟสด้วยเครื่องมือวัด Clamp Meter และบันทึกข้อมูล",
        "กำหนดนัดหมายเพื่อทำการขันอัดกวดแน่นสลักเกลียวของเทอร์มินอลทุกจุด (Torque Retightening) ในรอบซ่อมบำรุงทั่วไปครั้งถัดไป",
        "ทำความสะอาดหน้าสัมผัสหากเริ่มพบคราบออกไซด์หรือคราบสกปรกเกาะแน่น",
        "ตรวจเช็กค่าความต่างของอุณหภูมิและกระแสไฟฟ้าซ้ำอีกครั้งในระยะเวลา 1-2 สัปดาห์"
      ],
      urgencyWindow: "ตรวจเช็กเพิ่มเติมและดำเนินการแก้ไขภายในระยะเวลา 30 วัน หรือวางแผนซ่อมแซมในรอบบำรุงรักษาประจำเดือน",
      standardsCompliance: "ตามเกณฑ์มาตรฐานสากล NETA MTS (ค่าผลต่างอุณหภูมิอยู่ระหว่าง 10°C - 20°C จัดเป็นความผิดปกติระดับปานกลาง ให้วางแผนแก้ไขและติดตามผลในการซ่อมบำรุงตามรอบปกติ)"
    }
  },
  {
    id: "disconnect-switch",
    title: "สวิตช์ใบมีดแรงสูง (High Voltage Disconnect Switch)",
    equipmentType: "สวิตช์ตัดตอนแบบใบมีด (Air Disconnect Switch)",
    description: "หน้าสัมผัสปลายใบมีดมีความร้อนเพิ่มขึ้นเล็กน้อยเกือบปกติ",
    svgMarkup: `<svg viewBox="0 0 500 350" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <!-- Background (Dark IR Thermal Environment) -->
  <rect width="500" height="350" fill="#050314"/>
  
  <!-- Disconnect Switch Ceramic Insulator Posts (Cool Deep Blue/Indigo) -->
  <rect x="120" y="200" width="50" height="110" fill="#1b1240" rx="3" stroke="#2d1f69" stroke-width="2"/>
  <rect x="330" y="200" width="50" height="110" fill="#1b1240" rx="3" stroke="#2d1f69" stroke-width="2"/>
  <rect x="110" y="310" width="280" height="15" fill="#140d30" rx="2"/>

  <!-- Metal Base Terminal Plates -->
  <rect x="110" y="185" width="70" height="15" fill="#27185c" rx="1"/>
  <rect x="320" y="185" width="70" height="15" fill="#27185c" rx="1"/>

  <!-- High-voltage blades (Slightly warm on one joint, yellowish-purple) -->
  <!-- Blade Hinge (Cool Left) -->
  <rect x="160" y="160" width="20" height="25" fill="#20104a"/>
  <!-- Switch blade in closed position -->
  <path d="M 170 170 L 320 170 L 320 180 L 170 180 Z" fill="#2e1a63" stroke="#4c3396" stroke-width="1.5"/>
  
  <!-- Contact Jaw Terminal (Slightly warm spot on right) -->
  <rect x="315" y="160" width="25" height="25" fill="#4d1b54"/>

  <!-- Faint Hotspot Gradient on Disconnect Jaw (Right Joint) -->
  <circle cx="327" cy="172" r="22" fill="url(#hotspotGrad1)" opacity="0.25"/>
  <circle cx="327" cy="172" r="10" fill="url(#hotspotGrad2)" opacity="0.55"/>
  <circle cx="327" cy="172" r="4" fill="#ffffff" opacity="0.8"/>

  <!-- Temperature Crosshair Marker & Label -->
  <line x1="312" y1="172" x2="342" y2="172" stroke="#ffffff" stroke-width="1" opacity="0.7"/>
  <line x1="327" y1="157" x2="327" y2="187" stroke="#ffffff" stroke-width="1" opacity="0.7"/>
  <rect x="254" y="154" width="54" height="18" fill="rgba(0,0,0,0.7)" rx="3"/>
  <text x="259" y="167" font-family="monospace" font-size="11" fill="#ffffff" font-weight="bold">37.1°C</text>

  <!-- Reference Spot (Left Hinge Joint) -->
  <line x1="160" y1="172" x2="180" y2="172" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
  <line x1="170" y1="162" x2="170" y2="182" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
  <rect x="182" y="164" width="54" height="18" fill="rgba(0,0,0,0.7)" rx="3"/>
  <text x="187" y="177" font-family="monospace" font-size="11" fill="#8bf" font-weight="bold">34.3°C</text>

  <!-- Color Palette Scale Bar on the Right -->
  <rect x="470" y="50" width="12" height="250" fill="url(#irScaleGrad)" rx="2"/>
  <text x="452" y="62" font-family="monospace" font-size="9" fill="#ffffff">40°C</text>
  <text x="452" y="175" font-family="monospace" font-size="9" fill="#d0c">30°C</text>
  <text x="452" y="295" font-family="monospace" font-size="9" fill="#8bf">20°C</text>

  <!-- Definitions of gradients -->
  <defs>
    <radialGradient id="hotspotGrad1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e91e63" stop-opacity="1"/>
      <stop offset="60%" stop-color="#ff7b00" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#1b1240" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="hotspotGrad2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffeb3b" stop-opacity="1"/>
      <stop offset="50%" stop-color="#ff9800" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#e91e63" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="irScaleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#ffeb3b"/>
      <stop offset="50%" stop-color="#ff9800"/>
      <stop offset="75%" stop-color="#ff0055"/>
      <stop offset="90%" stop-color="#751b6e"/>
      <stop offset="100%" stop-color="#050314"/>
    </linearGradient>
  </defs>
</svg>`,
    precalculated: {
      equipmentType: "สวิตช์ใบมีดตัดตอน (Air Disconnect Switch)",
      severity: "LOW",
      maxTemp: 37.1,
      ambientTemp: 34.3,
      tempDiff: 2.8,
      anomalyDescription: "ตรวจพบความร้อนระดับเกือบปกติ (Low Severity / Minor Anomaly) บริเวณหน้าสัมผัสปลายใบมีด (Switch Jaw Contact) ฝั่งขวา อุณหภูมิสูงสุดอยู่ที่ 37.1°C ต่างจากขั้วอ้างอิงของจุดบานพับฝั่งซ้าย (34.3°C) เพียง 2.8°C สภาพอุปกรณ์โดยทั่วไปยังมีความปลอดภัยสูงมาก ไม่ถือเป็นความผิดปกติรุนแรง",
      hotspotCoordinates: { x: 65.4, y: 49.1 },
      causes: [
        "หน้าสัมผัสปากคีบใบมีดเกิดฝุ่นหรือคราบน้ำค้างสะสมบางๆ",
        "มีแรงกดสัมผัส (Contact Pressure) ลดลงเล็กน้อยตามอายุการใช้งานแต่ยังอยู่ในพิกัดปลอดภัย"
      ],
      actions: [
        "ทำการตรวจเช็กซ้ำและสแกนความร้อนในการตรวจสอบวงรอบประจำปี (Annual Thermographic Survey) ตามปกติ",
        "หากมีการทำงานบำรุงรักษาระบบส่งจ่ายไฟ ให้ทำความสะอาดหน้าสัมผัสใบมีดและชโลมจาระบีป้องกันอาร์กตามความเหมาะสม"
      ],
      urgencyWindow: "ซ่อมบำรุงตามรอบกำหนดเวลาบำรุงรักษาประจำปี หรือติดตามอุณหภูมิในรอบตรวจครั้งถัดไป",
      standardsCompliance: "ตามมาตรฐานอ้างอิง NETA MTS และ NFPA 70B (ผลต่างอุณหภูมิน้อยกว่า 10°C บ่งบอกถึงภาวะปกติหรือมีความผิดปกติเพียงเล็กน้อย สามารถใช้งานต่อไปได้ภายใต้รอบการเฝ้าระวัง)"
    }
  }
];
