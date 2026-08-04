import { Loader2 } from "lucide-react"

type LoadingOverlayProps = {
  transparent?: boolean;
};

export default function LoadingOverlay({ transparent = false }: LoadingOverlayProps) {
  if (transparent) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-background/80">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <Loader2 className="animate-spin" size={32} />
    </div>
  );
}