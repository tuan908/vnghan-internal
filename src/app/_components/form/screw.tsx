import { Button } from "@/components/ui/button";
import { VndCurrencyInput } from "@/components/ui/currency-input";
import { DialogFooter } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EditScrewDto } from "@/lib/validations";
import { ScrewMaterialDto, ScrewTypeDto } from "@/types";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

// Screw form component
export const ScrewForm = ({
  onSubmit,
  isSubmitting,
  screwTypes,
  screwMaterials,
  screw,
}: {
  onSubmit: (e: React.FormEvent) => void; // Updated type to accept event
  isSubmitting: boolean;
  screwTypes: ScrewTypeDto[];
  screwMaterials: ScrewMaterialDto[];
  screw?: EditScrewDto;
}) => {
  const { register, setValue, watch, reset } = useFormContext<EditScrewDto>();

  // Watch fields for real-time validation
  const componentType = watch("componentType");
  const material = watch("material");

  // Initialize form with screw data when in edit mode
  useEffect(() => {
    if (screw) {
      console.log("Initializing form with screw data:", screw);
      // Pre-populate form fields with screw data
      reset({
        id: screw.id, // Make sure to include the ID for editing
        name: screw.name || "",
        quantity: screw.quantity || "",
        price: screw.price || "",
        componentType: screw.componentType || "",
        material: screw.material || "",
        note: screw.note || "",
      });
    }
  }, [screw, reset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    console.log("Form submission triggered");
    onSubmit(e); // Call the provided onSubmit handler
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
      {/* If editing, include a hidden input for the ID */}
      {screw && <input type="hidden" {...register("id")} />}

      <FormField label="Tên sản phẩm" name="name">
        <Input
          type="text"
          {...register("name")}
          autoFocus
          placeholder="Nhập tên sản phẩm"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Số lượng" name="quantity">
          <Input {...register("quantity")} placeholder="Nhập số lượng" />
        </FormField>

        <FormField label="Giá tiền tham khảo" name="price">
          <VndCurrencyInput
            {...register("price")}
            placeholder="Nhập giá tiền"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Loại phụ kiện" name="componentType">
          <Select
            onValueChange={(value) => setValue("componentType", value)}
            value={componentType}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn loại phụ kiện" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Loại phụ kiện</SelectLabel>
                {screwTypes.map((x) => (
                  <SelectItem key={x.id + "#" + x.name} value={x.name!}>
                    {x.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Chất liệu" name="material">
          <Select
            onValueChange={(value) => setValue("material", value)}
            value={material}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn chất liệu" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Chất liệu</SelectLabel>
                {screwMaterials.map((x) => (
                  <SelectItem key={x.id + "#" + x.name} value={x.name!}>
                    {x.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField label="Lưu ý" name="notes">
        <Textarea
          {...register("note")}
          cols={3}
          className="resize-none min-h-24"
          placeholder="Nhập lưu ý (nếu có)"
        />
      </FormField>

      <DialogFooter className="mt-4">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Hủy
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : screw ? (
            "Cập nhật"
          ) : (
            "Lưu"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};
