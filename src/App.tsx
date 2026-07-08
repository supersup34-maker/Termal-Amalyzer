import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Clock,
  Thermometer,
  Activity,
  FileText,
  RefreshCw,
  HelpCircle,
  ChevronRight,
  Shield,
  Gauge,
  Info,
  Check,
  Flame,
  AlertCircle
} from "lucide-react";
import { HOTSPOT_SAMPLES, HotspotSample } from "./data/samples";

export default function App() {
  // Application states
  const [selectedSampleId, setSelectedSampleId] = useState<string>("transformer-bushing");
  const [customImage, setCustomImage] = useState<{ base64: string; name: string; mimeType: string } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(HOTSPOT_SAMPLES[0].precalculated);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});
  const [loadingStep, setLoadingStep] = useState<string>("");

  // Refs for upload input and workspace element
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Auto-run loading message sequence when isAnalyzing is true
  useEffect(() => {
    if (!isAnalyzing) return;
    const steps = [
      "กำลังเชื่อมต่อระบบวิเคราะห์ภาพความร้อน...",
      "กำลังแยกวิเคราะห์ช่วงคลื่นรังสีความร้อน (Thermal Radiance Spectrum)...",
      "ส่งสัญญาณภาพไปยังโมเดล AI (Gemini 3.5 Flash)...",
      "กำลังตรวจจับตำแหน่งจุดอุณหภูมิวิกฤต (Target Hotspot Detection)...",
      "วิเคราะห์เปรียบเทียบค่า Delta T ตามเกณฑ์ NETA/IEEE...",
      "กำลังประมวลผลข้อเสนอแนะในการซ่อมบำรุงเชิงรุก..."
    ];
    let index = 0;
    setLoadingStep(steps[0]);
    const interval = setInterval(() => {
      index = (index + 1) % steps.length;
      setLoadingStep(steps[index]);
    }, 1800);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Handle preset sample selection
  const handleSelectSample = (sample: HotspotSample) => {
    setCustomImage(null);
    setSelectedSampleId(sample.id);
    setAnalysisResult(sample.precalculated);
    setApiError(null);
    setCheckedActions({});
  };

  // Convert SVG string to Base64 to send to Gemini API
  const getSvgBase64 = (svgString: string): string => {
    const cleanSvg = svgString.replace(/<svg[^>]*>/, (match) => {
      if (!match.includes("xmlns")) {
        return match.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      return match;
    });
    return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(cleanSvg)));
  };

  // Call Express Backend API to Analyze image
  const analyzeImageWithAI = async (base64Data: string, filename: string, mimeType: string) => {
    setIsAnalyzing(true);
    setApiError(null);
    setCheckedActions({});

    try {
      const response = await fetch("/api/analyze-hotspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "เกิดข้อผิดพลาดในการเรียกใช้ API");
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (error: any) {
      console.error("Analysis failed:", error);
      setApiError(error.message || "ไม่สามารถวิเคราะห์รูปภาพได้ในขณะนี้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือการติดตั้ง API Key");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle uploaded image file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("กรุณาอัปโหลดรูปภาพเท่านั้น (JPG, PNG, WEBP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCustomImage({
        base64: base64,
        name: file.name,
        mimeType: file.type,
      });
      setSelectedSampleId("custom");
      // Trigger live AI analysis
      analyzeImageWithAI(base64, file.name, file.type);
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Trigger manual Live AI Re-Analysis on preset samples (to showcase real integration!)
  const handleTriggerLiveAIOnSample = () => {
    const currentSample = HOTSPOT_SAMPLES.find((s) => s.id === selectedSampleId);
    if (!currentSample) return;
    
    const svgBase64 = getSvgBase64(currentSample.svgMarkup);
    analyzeImageWithAI(svgBase64, `${currentSample.id}.svg`, "image/svg+xml");
  };

  // Toggle checklist item
  const toggleAction = (index: number) => {
    setCheckedActions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Handle printing/generating job sheet
  const handlePrintReport = () => {
    window.print();
  };

  // Helper function to color code severity
  const getSeverityStyle = (sev: string) => {
    const s = (sev || "").toUpperCase();
    switch (s) {
      case "CRITICAL":
        return {
          bg: "bg-red-950/50 border-red-500/40 text-red-400",
          badge: "bg-red-500 text-black font-bold animate-pulse",
          text: "text-red-400",
          border: "border-red-500",
          glow: "shadow-[0_0_15px_rgba(239,68,68,0.15)]",
          hex: "#ef4444"
        };
      case "HIGH":
        return {
          bg: "bg-orange-950/50 border-orange-500/40 text-orange-400",
          badge: "bg-orange-500 text-black font-bold",
          text: "text-orange-400",
          border: "border-orange-500",
          glow: "shadow-[0_0_15px_rgba(249,115,22,0.15)]",
          hex: "#f97316"
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-950/50 border-amber-500/40 text-amber-400",
          badge: "bg-amber-500 text-black font-semibold",
          text: "text-amber-400",
          border: "border-amber-500",
          glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
          hex: "#f59e0b"
        };
      default:
        return {
          bg: "bg-emerald-950/50 border-emerald-500/40 text-emerald-400",
          badge: "bg-emerald-500 text-black font-semibold",
          text: "text-emerald-400",
          border: "border-emerald-500",
          glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
          hex: "#10b981"
        };
    }
  };

  const currentSeverity = getSeverityStyle(analysisResult?.severity || "LOW");

  return (
    <div className="min-h-screen bg-[#070b13] text-gray-200 font-sans selection:bg-amber-500 selection:text-black">
      {/* Background visual element */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#111827] via-[#0b0f19] to-transparent pointer-events-none -z-10" />

      {/* Header Container */}
      <header className="border-b border-gray-800 bg-[#080d17]/85 backdrop-blur-md sticky top-0 z-40 px-4 py-3.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/15">
              <Flame className="h-5.5 w-5.5 text-black stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                ระบบวิเคราะห์จุดร้อนบนระบบไฟฟ้า <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono font-bold">THERMO AI v3.5</span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Electrical Thermal Anomaly Analyzer & Preventive Maintenance Planner</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-200 transition-colors cursor-pointer border border-gray-700"
              id="upload-button-header"
            >
              <Upload className="h-4 w-4" />
              <span>อัปโหลดรูปความร้อน</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            <button
              onClick={handlePrintReport}
              disabled={!analysisResult}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-lg shadow-amber-500/10"
              id="print-report-header"
            >
              <Printer className="h-4 w-4" />
              <span>ออกใบงานซ่อมบำรุง</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:py-8">
        
        {/* Banner informing about the API capabilities */}
        <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 text-sm text-blue-300 flex gap-3.5">
          <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-200">ℹ️ ข้อมูลการใช้งานระบบวิเคราะห์อัจฉริยะ</p>
            <p className="mt-1 leading-relaxed text-gray-300">
              ระบบนี้ใช้อินทิเกรชันระดับสูงร่วมกับ <strong className="text-white">Gemini 3.5 Flash</strong> บนฝั่งเซิร์ฟเวอร์ในการวิเคราะห์ภาพอินฟราเรด (IR) 
              ท่านสามารถเลือกทดลองจากเคสตัวอย่างด้านล่าง หรือ <strong className="text-amber-400">อัปโหลดภาพถ่ายกล้องความร้อนของท่านเอง</strong> เพื่อให้ระบบสแกน วิเคราะห์พิกัด และประเมินค่าผลต่างอุณหภูมิ (Delta T) ตามเกณฑ์มาตรฐานได้ทันที
            </p>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT PANEL: Image Viewer & Sample Selectors (Columns 1-7) */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            
            {/* 1. Selection Tab of Hotspot Samples */}
            <div className="bg-[#0c1220] rounded-xl border border-gray-800 p-4 shadow-xl">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-amber-500" />
                เลือกดูเคสตัวอย่างจุดร้อนในระบบไฟฟ้า
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HOTSPOT_SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`flex flex-col text-left p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                      selectedSampleId === sample.id
                        ? "bg-amber-500/10 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.05)]"
                        : "bg-[#080d18] border-gray-800/80 hover:border-gray-700"
                    }`}
                    id={`sample-select-${sample.id}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white truncate">{sample.title}</span>
                      <span className={`px-1.5 py-0.5 rounded-[3px] font-mono font-bold text-[9px] ${
                        getSeverityStyle(sample.precalculated.severity).badge
                      }`}>
                        {sample.precalculated.severity}
                      </span>
                    </div>
                    <span className="text-gray-400 mt-1 line-clamp-1">{sample.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Primary Thermal Image Display Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative bg-[#05080e] rounded-2xl border-2 transition-all overflow-hidden aspect-[4/3] flex flex-col items-center justify-center ${
                dragOver 
                  ? "border-amber-500 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.15)]" 
                  : "border-gray-800"
              }`}
              ref={imageContainerRef}
            >
              {/* Overlay with subtle grid for telemetry look */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.15)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

              {/* Status Header on Top of Image Workspace */}
              <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-center pointer-events-none">
                <span className="bg-black/75 text-gray-300 border border-gray-800 text-[10px] font-mono px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  THERMOGRAPHY SCREEN
                </span>
                
                {selectedSampleId !== "custom" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerLiveAIOnSample();
                    }}
                    disabled={isAnalyzing}
                    className="pointer-events-auto bg-black/85 hover:bg-gray-800 border border-amber-500/40 hover:border-amber-500 text-amber-400 text-[10px] font-semibold px-2.5 py-1 rounded backdrop-blur-sm transition-all flex items-center gap-1.5 shadow-md"
                    title="ทดสอบส่งภาพพรีเซ็ตนี้ไปประเมินด้วย AI จริง"
                    id="trigger-live-ai"
                  >
                    <RefreshCw className={`h-3 w-3 ${isAnalyzing ? "animate-spin text-amber-500" : ""}`} />
                    <span>วิเคราะห์ด้วย AI สด</span>
                  </button>
                )}
              </div>

              {/* Display Content depending on state */}
              {isAnalyzing ? (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
                  <div className="relative mb-5">
                    {/* Glowing outer rings */}
                    <div className="h-16 w-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                    <Flame className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-7 w-7 text-amber-500 animate-pulse" />
                  </div>
                  <h3 className="font-semibold text-white text-base">กำลังประมวลผลวิเคราะห์ด้วย AI</h3>
                  <p className="text-xs text-amber-400 font-mono mt-1 h-5">{loadingStep}</p>
                  
                  <div className="max-w-xs mt-6 bg-gray-900/60 border border-gray-800 p-2.5 rounded text-[11px] text-gray-400 leading-normal">
                    ระบบกำลังส่งภาพไปยัง Gemini Multi-modal API เพื่อระบุตำแหน่งอุปกรณ์ ตรวจจับอุณหภูมิ และค้นหาความผิดปกติของวัสดุ
                  </div>
                </div>
              ) : null}

              {/* Image Container */}
              <div className="w-full h-full flex items-center justify-center relative">
                {customImage ? (
                  <img
                    src={customImage.base64}
                    alt={customImage.name}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  // Predefined sample render (SVG directly so we retain full vectorial heat glow)
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{
                      __html: HOTSPOT_SAMPLES.find((s) => s.id === selectedSampleId)?.svgMarkup || "",
                    }}
                  />
                )}

                {/* Hotspot Reticle Overlay */}
                {analysisResult?.hotspotCoordinates && !isAnalyzing && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                    className="absolute pointer-events-none z-10"
                    style={{
                      left: `${analysisResult.hotspotCoordinates.x}%`,
                      top: `${analysisResult.hotspotCoordinates.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {/* Glowing outer ring */}
                    <div 
                      className="absolute -inset-8 rounded-full border-2 border-dashed opacity-75 animate-spin"
                      style={{ 
                        borderColor: currentSeverity.hex,
                        animationDuration: "12s"
                      }}
                    />
                    {/* Pulsing expander ring */}
                    <div 
                      className="absolute -inset-5 rounded-full border-2 opacity-50 animate-ping"
                      style={{ borderColor: currentSeverity.hex }}
                    />
                    {/* Target solid crosshair */}
                    <div className="relative h-6 w-6 flex items-center justify-center">
                      <div className="absolute h-0.5 w-6" style={{ backgroundColor: currentSeverity.hex }} />
                      <div className="absolute h-6 w-0.5" style={{ backgroundColor: currentSeverity.hex }} />
                      <div className="h-2 w-2 rounded-full bg-white border border-black shadow" />
                    </div>

                    {/* AI Tag Marker */}
                    <div className="absolute top-4 left-4 bg-black/90 border border-gray-800 text-white rounded px-2 py-1 text-[10px] font-mono backdrop-blur-sm whitespace-nowrap shadow-xl flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                      <span>HOTSPOT DETECTED ({analysisResult.maxTemp}°C)</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Drop / Upload Prompt when no custom image and empty state */}
              {selectedSampleId === "custom" && !customImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/90 p-8 text-center">
                  <div className="h-14 w-14 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="text-white font-semibold">ลากรูปภาพมาวางที่นี่ หรือคลิกเพื่อเปิดไฟล์</h3>
                  <p className="text-xs text-gray-400 mt-1.5 max-w-sm">รองรับรูปถ่ายความร้อนแบบปกติหรือรังสีความร้อนอินฟราเรด (JPG, PNG, WEBP) เพื่อนำมาประมวลวิเคราะห์ความปลอดภัยด้วยระบบ AI</p>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                    id="trigger-file-select-workspace"
                  >
                    เลือกรูปภาพความร้อน
                  </button>
                </div>
              )}
            </div>

            {/* 3. Drag-and-drop instruction panel / quick action */}
            <div className="bg-[#080c16] rounded-xl border border-gray-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-md">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Upload className="h-4.5 w-4.5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">ต้องการทดสอบด้วยภาพหน้างานจริง?</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">อัปโหลดภาพจุดเกิดความร้อนสะสมของระบบบัสบาร์, สวิตช์เกียร์, หรือมอเตอร์แบริ่งได้เลย</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCustomImage(null);
                  setSelectedSampleId("custom");
                  setAnalysisResult(null);
                  setApiError(null);
                }}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-medium text-xs px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer align-self-start sm:align-self-auto"
                id="reset-custom-workspace"
              >
                เคลียร์พื้นที่และอัปโหลดใหม่
              </button>
            </div>
            
          </section>

          {/* RIGHT PANEL: Diagnosis, Risk Levels & Action Plan (Columns 8-12) */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            
            {/* API Error Notification */}
            {apiError && (
              <div className="bg-red-950/40 border border-red-500/30 p-4 rounded-xl flex gap-3 text-red-300">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-red-200">❌ เกิดข้อผิดพลาดในการวิเคราะห์ AI</p>
                  <p className="mt-1 leading-relaxed text-gray-300">{apiError}</p>
                  <button
                    onClick={() => {
                      if (customImage) {
                        analyzeImageWithAI(customImage.base64, customImage.name, customImage.mimeType);
                      } else {
                        handleTriggerLiveAIOnSample();
                      }
                    }}
                    className="mt-2 text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" /> ลองอีกครั้ง
                  </button>
                </div>
              </div>
            )}

            {/* If analysis exists, show details */}
            {analysisResult ? (
              <div className="flex flex-col gap-6">
                
                {/* A. Diagnosis Summary Header Card */}
                <div className={`rounded-xl border p-5 shadow-xl transition-all ${currentSeverity.bg} ${currentSeverity.glow}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-gray-400 block mb-1">
                        EQUIPMENT CLASSIFICATION
                      </span>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {analysisResult.equipmentType}
                      </h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${currentSeverity.badge}`}>
                      {analysisResult.severity}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800/80 flex items-center gap-2.5 text-xs">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">
                      พิจารณาตามเกณฑ์: <strong className="text-white font-mono">{analysisResult.standardsCompliance}</strong>
                    </span>
                  </div>
                </div>

                {/* B. Telemetry Tele-Dashboard with Gauges (Max, Ambient, Delta-T) */}
                <div className="bg-[#0c1220] rounded-xl border border-gray-800 p-5 shadow-xl">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-amber-500" />
                    แดชบอร์ดอุณหภูมิความร้อน (Telemetry)
                  </h3>

                  <div className="grid grid-cols-3 gap-3.5">
                    {/* Max Temp Card */}
                    <div className="bg-[#070b13] border border-gray-800 p-3 rounded-lg text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
                      <span className="text-[10px] text-gray-400 font-medium block">อุณหภูมิจุดร้อนสุด</span>
                      <span className="text-xl sm:text-2xl font-bold font-mono text-red-400 block mt-1">
                        {analysisResult.maxTemp}
                        <span className="text-xs text-gray-500 ml-0.5">°C</span>
                      </span>
                      <div className="flex items-center justify-center gap-0.5 text-[9px] text-gray-500 font-mono mt-0.5">
                        <Thermometer className="h-2.5 w-2.5 text-red-500" /> Max
                      </div>
                    </div>

                    {/* Ambient Temp Card */}
                    <div className="bg-[#070b13] border border-gray-800 p-3 rounded-lg text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
                      <span className="text-[10px] text-gray-400 font-medium block">อุณหภูมิแวดล้อม</span>
                      <span className="text-xl sm:text-2xl font-bold font-mono text-blue-400 block mt-1">
                        {analysisResult.ambientTemp}
                        <span className="text-xs text-gray-500 ml-0.5">°C</span>
                      </span>
                      <div className="flex items-center justify-center gap-0.5 text-[9px] text-gray-500 font-mono mt-0.5">
                        <Thermometer className="h-2.5 w-2.5 text-blue-500" /> Ref
                      </div>
                    </div>

                    {/* Delta-T (Differential) Card */}
                    <div className="bg-[#070b13] border border-gray-800 p-3 rounded-lg text-center relative overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 right-0 h-1" 
                        style={{ backgroundColor: currentSeverity.hex }}
                      />
                      <span className="text-[10px] text-gray-400 font-medium block">ผลต่าง Delta T</span>
                      <span className="text-xl sm:text-2xl font-bold font-mono block mt-1" style={{ color: currentSeverity.hex }}>
                        {analysisResult.tempDiff}
                        <span className="text-xs text-gray-500 ml-0.5">°C</span>
                      </span>
                      <div className="flex items-center justify-center gap-0.5 text-[9px] text-gray-500 font-mono mt-0.5">
                        <Activity className="h-2.5 w-2.5" style={{ color: currentSeverity.hex }} /> &Delta;T
                      </div>
                    </div>
                  </div>

                  {/* Interpretation Summary */}
                  <div className="mt-4 p-3 bg-gray-900/40 rounded-lg border border-gray-800/80 text-xs leading-relaxed flex items-start gap-2.5">
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-300">ผลการประเมินอ้างอิง:</span>{" "}
                      <span className="text-white">
                        อุณหภูมิสูงกว่าจุดอ้างอิงส่งผลต่าง{" "}
                        <strong className="font-mono text-amber-400 font-bold">{analysisResult.tempDiff}°C</strong> ซึ่งจัดอยู่ในเกณฑ์ความรุนแรงระดับ{" "}
                        <strong className="underline" style={{ color: currentSeverity.hex }}>
                          {analysisResult.severity}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* C. Description & Causes Analysis */}
                <div className="bg-[#0c1220] rounded-xl border border-gray-800 p-5 shadow-xl flex flex-col gap-5">
                  
                  {/* Detailed Explanation */}
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-amber-500" />
                      รายงานผลการวิเคราะห์ด้วย AI
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed bg-[#070b13] border border-gray-800 p-3.5 rounded-lg">
                      {analysisResult.anomalyDescription}
                    </p>
                  </div>

                  {/* Probable Causes */}
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      สมมติฐานสาเหตุที่ทำให้เกิดจุดร้อน (Probable Causes)
                    </h3>
                    <ul className="space-y-1.5 bg-[#070b13] border border-gray-800 p-3.5 rounded-lg text-xs">
                      {analysisResult.causes?.map((cause: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 leading-relaxed text-gray-300">
                          <span className="text-amber-500 font-semibold mt-0.5 font-mono shrink-0">{i+1}.</span>
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Timeframe of urgency */}
                  <div className="p-3 bg-red-950/15 border border-red-500/10 rounded-lg flex items-center gap-3 text-xs">
                    <Clock className="h-4.5 w-4.5 text-red-400 shrink-0" />
                    <div>
                      <span className="text-gray-400">กรอบเวลาแก้ไขที่แนะนำ:</span>{" "}
                      <strong className="text-red-300">{analysisResult.urgencyWindow}</strong>
                    </div>
                  </div>

                </div>

                {/* D. Action Plan with Interactive Checklist */}
                <div className="bg-[#0c1220] rounded-xl border border-gray-800 p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ใบตรวจแผนการซ่อมบำรุงที่แนะนำ (Maintenance Action Plan)
                    </h3>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded">
                      CHECKLIST
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 mb-4 leading-normal">
                    กรุณากดเลือกรายการงานเมื่อช่างซ่อมบำรุงได้ลงพื้นที่ปฏิบัติการและแก้ไขจุดสัมผัสเรียบร้อยแล้ว เพื่อใช้รายงานในใบงานปฏิบัติการ:
                  </p>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {analysisResult.actions?.map((action: string, idx: number) => {
                      const isChecked = !!checkedActions[idx];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleAction(idx)}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-xs leading-relaxed transition-all cursor-pointer ${
                            isChecked
                              ? "bg-emerald-950/25 border-emerald-500/40 text-emerald-300"
                              : "bg-[#070b13] border-gray-800 hover:border-gray-700 text-gray-300"
                          }`}
                          id={`action-item-${idx}`}
                        >
                          <div className={`h-4.5 w-4.5 rounded flex items-center justify-center shrink-0 border mt-0.5 transition-all ${
                            isChecked
                              ? "bg-emerald-500 border-emerald-400 text-black"
                              : "bg-gray-900 border-gray-700 text-transparent"
                          }`}>
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                          <span>{action}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress Bar of Completed Maintenance Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-800/80">
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1.5">
                      <span>ความคืบหน้างานซ่อมบำรุง</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {Object.values(checkedActions).filter(Boolean).length} / {analysisResult.actions?.length || 0} รายการ
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{
                          width: `${
                            ((Object.values(checkedActions).filter(Boolean).length) /
                              (analysisResult.actions?.length || 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              // Empty State prompt
              <div className="bg-[#0c1220] rounded-xl border border-gray-800 p-8 text-center text-gray-400 shadow-xl min-h-[400px] flex flex-col items-center justify-center">
                <Flame className="h-12 w-12 text-gray-700 animate-pulse mb-3" />
                <h3 className="text-white font-semibold">ไม่พบข้อมูลการวิเคราะห์ภาพถ่ายความร้อน</h3>
                <p className="text-xs text-gray-500 mt-2 max-w-xs leading-normal">
                  กรุณาอัปโหลดรูปภาพความร้อนหน้างานจริง หรือเลือกเคสตัวอย่างที่ต้องการสแกนความร้อนจากเมนูด้านซ้าย เพื่อเริ่มใช้งานระบบผู้เชี่ยวชาญ AI
                </p>
              </div>
            )}

          </section>

        </div>

        {/* SECTION 3: Standard Guidelines & Threshold Table (Reference Standard) */}
        <section className="mt-8 bg-[#0c1220] rounded-xl border border-gray-800 p-5 shadow-xl">
          <div className="flex items-center gap-2.5 mb-4">
            <Shield className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-semibold text-white">ตารางเกณฑ์ประเมินระดับความรุนแรงตามมาตรฐานสากล (Thermographic Assessment Criteria)</h3>
              <p className="text-xs text-gray-400 mt-0.5">อ้างอิงจากมาตรฐานสมาคมวิศวกรไฟฟ้าแห่งอเมริกา (IEEE) และสมาคมทดสอบวัสดุระหว่างประเทศ (NETA MTS & NFPA 70B)</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300 border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-[#070c14] text-gray-400 font-medium">
                  <th className="py-2.5 px-4 font-semibold text-gray-200">ผลต่างอุณหภูมิ (&Delta;T)</th>
                  <th className="py-2.5 px-4 font-semibold text-gray-200">ระดับความรุนแรง (Severity)</th>
                  <th className="py-2.5 px-4 font-semibold text-gray-200">ความหมายเชิงวิศวกรรม</th>
                  <th className="py-2.5 px-4 font-semibold text-gray-200">คำสั่งการแก้ไขที่เหมาะสม (Action Required)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-sans">
                <tr className="hover:bg-gray-900/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-400">1°C – 10°C</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">LOW</span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">เริ่มมีความคลาดเคลื่อนความร้อนเล็กน้อยมาก</td>
                  <td className="py-3 px-4 text-gray-400">ทำการตรวจสอบซ้ำและเฝ้าระวังอุณหภูมิในรอบบำรุงรักษาประจำปีตามปกติ</td>
                </tr>
                <tr className="hover:bg-gray-900/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-amber-400">11°C – 20°C</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-500/20 font-bold text-[10px]">MEDIUM</span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">มีความต้านทานหน้าสัมผัสระดับเริ่มต้นในระบบไฟฟ้า</td>
                  <td className="py-3 px-4 text-gray-400">วางแผนดับกระแสไฟขันแน่นสายและขจัดคราบสกปรกในรอบซ่อมบำรุงปกติ (ประจำเดือน)</td>
                </tr>
                <tr className="hover:bg-gray-900/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-orange-400">21°C – 40°C</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-orange-950/60 text-orange-400 border border-orange-500/20 font-bold text-[10px]">HIGH</span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">เกิดความร้อนสะสมรุนแรง มีความเสี่ยงอุปกรณ์เสียหาย</td>
                  <td className="py-3 px-4 text-gray-400">วางแผนดับไฟซ่อมแซมอย่างเร่งด่วนที่สุดภายในกำหนดเวลาที่มีการจัดรอบสั้น (ภายใน 7 วัน)</td>
                </tr>
                <tr className="hover:bg-gray-900/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-red-400">&gt; 40°C</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-500/20 font-bold text-[10px]">CRITICAL</span>
                  </td>
                  <td className="py-3 px-4 text-gray-300 font-semibold text-red-300">ความร้อนสะสมสูงขั้นวิกฤต เสี่ยงเกิดการอาร์กระเบิดและไฟฟ้าลัดวงจร</td>
                  <td className="py-3 px-4 text-gray-300 font-semibold">ขออนุมัติตัดกระแสไฟทันที (Emergency Shutdown) เพื่อหยุดเปลี่ยนอุปกรณ์และซ่อมบำรุงความปลอดภัย</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-gray-900 bg-[#04070d] py-8 px-4 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ระบบวิเคราะห์จุดร้อนบนระบบไฟฟ้าด้วย AI และระเบียบซ่อมบำรุงเชิงรุก</p>
          <p className="flex items-center gap-1.5 justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            โครงสร้างทำงานแบบปลอดภัยเซิร์ฟเวอร์ไซด์ซ่อน API คีย์ 100%
          </p>
        </div>
      </footer>

      {/* PRINT-ONLY CONTAINER (Hidden on Screen, formatted for beautiful physical or PDF report) */}
      <div className="hidden print:block p-8 text-black bg-white font-sans text-xs">
        {/* Report Header */}
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-black uppercase">ELECTRICAL MAINTENANCE JOB SHEET</h1>
              <p className="text-[10px] text-gray-600">ใบนำงานปฏิบัติการซ่อมบำรุงระบบไฟฟ้าเชิงวิเคราะห์ด้วยกล้องถ่ายความร้อน AI</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-xs">วันที่พิมพ์รายงาน: {new Date().toLocaleDateString("th-TH")}</p>
              <p className="text-[10px] text-gray-600">วิเคราะห์อ้างอิง: THERMO AI v3.5</p>
            </div>
          </div>
        </div>

        {/* Primary Data Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border border-black p-3 rounded">
            <h2 className="text-xs font-bold uppercase border-b border-black pb-1.5 mb-2 text-gray-800">1. ข้อมูลอุปกรณ์และระดับความปลอดภัย</h2>
            <p className="mb-1"><strong>ประเภทอุปกรณ์หลัก:</strong> {analysisResult?.equipmentType}</p>
            <p className="mb-1"><strong>ระดับความบกพร่องสะสม (Severity):</strong> <span className="font-bold underline">{analysisResult?.severity}</span></p>
            <p className="mb-1"><strong>มาตรฐานความปลอดภัยที่ใช้ทดสอบ:</strong> {analysisResult?.standardsCompliance}</p>
            <p className="mb-1"><strong>กรอบเวลาซ่อมบำรุง (Urgency):</strong> {analysisResult?.urgencyWindow}</p>
          </div>

          <div className="border border-black p-3 rounded">
            <h2 className="text-xs font-bold uppercase border-b border-black pb-1.5 mb-2 text-gray-800">2. ข้อมูลผลการตรวจจับระดับอุณหภูมิ</h2>
            <p className="mb-1"><strong>อุณหภูมิจุดร้อนสูงสุด (Hotspot Temp):</strong> {analysisResult?.maxTemp} °C</p>
            <p className="mb-1"><strong>อุณหภูมิสัมพัทธ์แวดล้อม (Ambient Temp):</strong> {analysisResult?.ambientTemp} °C</p>
            <p className="mb-1"><strong>ค่าผลต่างความร้อนสะสม (Delta T):</strong> {analysisResult?.tempDiff} °C</p>
            <p className="mb-1"><strong>พิกัดจุดพิกัดร้อนผิดปกติ (Relative Coordinate):</strong> X: {analysisResult?.hotspotCoordinates?.x}%, Y: {analysisResult?.hotspotCoordinates?.y}%</p>
          </div>
        </div>

        {/* Detailed Anomaly report */}
        <div className="border border-black p-3 rounded mb-6">
          <h2 className="text-xs font-bold uppercase border-b border-black pb-1.5 mb-2 text-gray-800">3. รายงานสรุปความผิดปกติของวัสดุอุปกรณ์</h2>
          <p className="leading-relaxed text-gray-800">{analysisResult?.anomalyDescription}</p>
        </div>

        {/* Probable Causes */}
        <div className="border border-black p-3 rounded mb-6">
          <h2 className="text-xs font-bold uppercase border-b border-black pb-1.5 mb-2 text-gray-800">4. สาเหตุที่ประเมินทางวิศวกรรม (Probable Causes)</h2>
          <ul className="list-decimal pl-5 space-y-1">
            {analysisResult?.causes?.map((cause: string, i: number) => (
              <li key={i} className="text-gray-800">{cause}</li>
            ))}
          </ul>
        </div>

        {/* Checklist of completed/to-do actions */}
        <div className="border border-black p-3 rounded mb-8">
          <h2 className="text-xs font-bold uppercase border-b border-black pb-1.5 mb-2 text-gray-800">5. รายการแผนปฏิบัติงานซ่อมบำรุงหน้างานจริง (Maintenance Actions)</h2>
          <p className="text-[10px] text-gray-500 mb-2">แสดงผลสถานะการดำเนินงานอัปเดตปัจจุบัน:</p>
          <div className="space-y-1.5">
            {analysisResult?.actions?.map((action: string, idx: number) => {
              const isChecked = !!checkedActions[idx];
              return (
                <div key={idx} className="flex items-center gap-2 text-gray-800 text-[11px]">
                  <div className="h-4.5 w-4.5 border border-black rounded flex items-center justify-center shrink-0">
                    {isChecked ? "✓" : " "}
                  </div>
                  <span className={isChecked ? "line-through text-gray-500" : ""}>{action}</span>
                  {isChecked && <span className="text-[9px] text-emerald-700 ml-auto font-bold">(เสร็จสิ้น)</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-12 text-center pt-8 border-t border-gray-400">
          <div>
            <div className="h-12 border-b border-black max-w-xs mx-auto" />
            <p className="mt-2 text-xs font-semibold">ผู้ปฏิบัติการ / ช่างวิเคราะห์เทคโนโลยีความร้อน</p>
            <p className="text-[10px] text-gray-500">วันที่: ____ / ____ / ________</p>
          </div>
          <div>
            <div className="h-12 border-b border-black max-w-xs mx-auto" />
            <p className="mt-2 text-xs font-semibold">หัวหน้าแผนกตรวจสอบระบบไฟฟ้า (Electrical Supervisor)</p>
            <p className="text-[10px] text-gray-500">วันที่: ____ / ____ / ________</p>
          </div>
        </div>
      </div>

    </div>
  );
}
