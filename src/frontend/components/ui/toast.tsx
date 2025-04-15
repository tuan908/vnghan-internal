import json from "@/shared/i18n/locales/vi.json";
import { Check, CircleX } from "lucide-react";
import { toast } from "sonner";

export function successToast() {
  toast(
    <div className="flex gap-x-4 items-center">
      <Check className="text-green-400" size="2rem" />
      <h1 className="text-sm py-2">{json.successOperation}</h1>
    </div>,
  );
}

export function errorToast(message: string) {
  toast(
    <div className="flex gap-x-4 items-center">
      <CircleX className="text-red-400" size="2rem" />
      <h1 className="text-sm py-2">{message}</h1>
    </div>,
  );
}
