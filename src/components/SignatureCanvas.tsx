import { useRef, useEffect, useState } from "react";
import ReactSignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { signatureSrc } from "@/lib/records";

interface SignatureCanvasProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  label?: string;
}

/**
 * Signature pad. A new signature is a PNG data URL; a saved one is a storage
 * path, shown as an image with a "Sign again" button.
 */
const SignatureCanvas = ({ value, onChange, label = "Sign here" }: SignatureCanvasProps) => {
  if (value && !value.startsWith("data:")) {
    return <SavedSignature value={value} label={label} onResign={() => onChange("")} />;
  }
  return <SignaturePad value={value} onChange={onChange} label={label} />;
};

const SignaturePad = ({ value, onChange, label }: SignatureCanvasProps) => {
  const sigRef = useRef<ReactSignatureCanvas>(null);

  useEffect(() => {
    if (value && sigRef.current && sigRef.current.isEmpty()) {
      sigRef.current.fromDataURL(value);
    }
  }, [value]);

  const handleEnd = () => {
    if (sigRef.current) {
      onChange(sigRef.current.toDataURL("image/png"));
    }
  };

  const handleClear = () => {
    sigRef.current?.clear();
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="border border-input rounded-md bg-background overflow-hidden">
        <ReactSignatureCanvas
          ref={sigRef}
          penColor="#222"
          canvasProps={{
            className: "w-full",
            style: { width: "100%", height: 120, touchAction: "none" },
          }}
          onEnd={handleEnd}
        />
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
        Clear Signature
      </Button>
    </div>
  );
};

const SavedSignature = ({ value, label, onResign }: { value: string; label: string; onResign: () => void }) => {
  const [src, setSrc] = useState("");
  useEffect(() => {
    signatureSrc(value).then(setSrc);
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="border border-input rounded-md bg-background h-[120px] flex items-center justify-center">
        {src ? (
          <img src={src} alt={label} className="max-h-[110px]" />
        ) : (
          <span className="text-xs text-muted-foreground">Loading…</span>
        )}
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onResign}>
        Sign again
      </Button>
    </div>
  );
};

export default SignatureCanvas;
