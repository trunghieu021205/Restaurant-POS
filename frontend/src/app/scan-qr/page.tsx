"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Keyboard, Loader2, Upload, X } from "lucide-react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

import { parseTableQrValue } from "@/lib/tableQr";
import { resolveTable } from "@/services/table";

export default function ScanQRPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanControlsRef = useRef<IScannerControls | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [scannerOpen, setScannerOpen] = useState(true);
  const [manualCode, setManualCode] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const stopScanner = useCallback(() => {
    scanControlsRef.current?.stop();
    scanControlsRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    setScannerOpen(false);
  }, []);

  const handleQrValue = useCallback(
    async (value: string) => {
      const parsed = parseTableQrValue(value, window.location.origin);

      if (!parsed.ok) {
        const message =
          parsed.reason === "foreign"
            ? "QR không thuộc hệ thống này."
            : "QR không hợp lệ. Mã cần có dạng table/12 hoặc /table/12.";
        setScanError(message);
        setScanStatus(null);
        return;
      }

      try {
        setValidating(true);
        setScanError(null);
        setScanStatus("Đang kiểm tra bàn...");

        if (!parsed.qrToken) {
          setScanError("QR không hợp lệ hoặc thiếu mã truy cập.");
          setScanStatus(null);
          return;
        }

        const table = await resolveTable(parsed.tableId);

        if (!table) {
          setScanError("Không tìm thấy bàn này.");
          setScanStatus(null);
          return;
        }

        if (table.status === "occupied") {
          setScanError(
            `Bàn số ${table.number} đang được sử dụng. Vui lòng quét bàn khác hoặc liên hệ nhân viên.`,
          );
          setScanStatus(null);
          return;
        }

        const href = `/table/${encodeURIComponent(parsed.tableId)}?qrToken=${encodeURIComponent(parsed.qrToken)}`;
        router.push(href);
      } catch (error) {
        console.error("QR validation failed:", error);
        setScanError("Không thể kiểm tra bàn. Vui lòng thử lại.");
        setScanStatus(null);
      } finally {
        setValidating(false);
      }
    },
    [router],
  );

  const handleImageUpload = useCallback(
    async (file: File) => {
      // Revoke previous object URL to avoid memory leak
      if (uploadedImage) {
        URL.revokeObjectURL(uploadedImage);
      }

      setScanError(null);
      setScanStatus("Đang xử lý ảnh...");

      const objectUrl = URL.createObjectURL(file);
      setUploadedImage(objectUrl);

      try {
        const img = new Image();
        img.src = objectUrl;

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Không thể tải ảnh."));
        });

        const reader = new BrowserMultiFormatReader();
        const result = await reader.decodeFromImageElement(img);

        URL.revokeObjectURL(objectUrl);
        await handleQrValue(result.getText());
      } catch (error) {
        // ZXing throws NotFoundException when no QR found — treat separately
        const message =
          error instanceof Error && error.name === "NotFoundException"
            ? "Không thể phát hiện QR trong ảnh. Vui lòng thử ảnh khác hoặc nhập mã thủ công."
            : "Không thể đọc QR từ ảnh. Vui lòng thử lại hoặc nhập mã thủ công.";

        console.error("Image QR detection failed:", error);
        setScanError(message);
        setScanStatus(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleQrValue],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
      // Reset input value so the same file can be re-selected
      e.target.value = "";
    }
  };

  useEffect(() => {
    if (!scannerOpen) return;

    let stopped = false;

    const startScanner = async () => {
      try {
        setScanError(null);
        setScanStatus("Đang mở camera...");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        if (stopped) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setScanStatus("Đưa mã QR vào khung camera.");

        const reader = new BrowserMultiFormatReader();

        const controls = await reader.decodeFromVideoElement(
          videoRef.current!,
          async (result, error) => {
            if (stopped) return;

            if (result) {
              stopped = true;
              stopScanner();
              await handleQrValue(result.getText());
              return;
            }

            // error here is typically NotFoundException (no QR in frame yet) — ignore
            if (error && error.name !== "NotFoundException") {
              console.error("Camera decode error:", error);
            }
          },
        );

        if (stopped) {
          controls.stop();
          return;
        }

        scanControlsRef.current = controls;
      } catch (error) {
        console.error("Camera QR scanner failed:", error);
        setScanError(
          "Không thể mở camera. Vui lòng cấp quyền camera hoặc nhập mã thủ công.",
        );
        setScanStatus(null);
      }
    };

    void startScanner();

    return () => {
      stopped = true;
      scanControlsRef.current?.stop();
      scanControlsRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [handleQrValue, scannerOpen, stopScanner]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (uploadedImage) {
        URL.revokeObjectURL(uploadedImage);
      }
    };
  }, [uploadedImage]);

  const submitManualCode = async () => {
    if (!manualCode.trim()) {
      setScanError("Vui lòng nhập nội dung QR.");
      return;
    }

    await handleQrValue(manualCode);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Quét mã QR</h1>
          <p className="text-sm text-neutral-500">
            Quét mã QR để truy cập vào bàn
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-btn p-2 text-neutral-500 hover:bg-neutral-100"
          aria-label="Quay về trang chủ"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-4">
        {scannerOpen && (
          <div className="overflow-hidden rounded-card bg-neutral-900">
            <video
              ref={videoRef}
              muted
              playsInline
              className="aspect-square w-full object-cover"
            />
          </div>
        )}

        {uploadedImage && (
          <div className="overflow-hidden rounded-card bg-neutral-50">
            <img
              src={uploadedImage}
              alt="Uploaded QR"
              className="aspect-square w-full object-contain"
            />
          </div>
        )}

        {scanStatus && (
          <div className="flex items-center gap-2 rounded-btn bg-primary-50 px-3 py-2 text-sm text-primary-700">
            {validating && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{scanStatus}</span>
          </div>
        )}

        {scanError && (
          <div className="rounded-btn border border-error-500/20 bg-error-500/10 px-3 py-2 text-sm text-error-600">
            {scanError}
          </div>
        )}

        <div className="space-y-3 border-t border-neutral-200 pt-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 rounded-btn border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-500 hover:text-primary-600"
            >
              <Upload className="h-4 w-4" />
              Tải ảnh QR
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!scannerOpen && (
              <button
                type="button"
                onClick={() => {
                  setScannerOpen(true);
                  setScanError(null);
                  setScanStatus(null);
                  if (uploadedImage) {
                    URL.revokeObjectURL(uploadedImage);
                    setUploadedImage(null);
                  }
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-btn border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-500 hover:text-primary-600"
              >
                <Camera className="h-4 w-4" />
                Mở camera
              </button>
            )}
          </div>

          <p className="text-xs text-neutral-500">
            Bạn có thể tải ảnh QR từ máy tín
          </p>
        </div>
      </div>
    </main>
  );
}
