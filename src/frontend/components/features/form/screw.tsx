import { Button } from "@/frontend/components/ui/button";
import { DialogFooter } from "@/frontend/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/frontend/components/ui/form";
import { Input } from "@/frontend/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import { Textarea } from "@/frontend/components/ui/textarea";
import type { ScrewMaterialDto, ScrewTypeDto } from "@/shared/types";
import type { ScrewDto } from "@/shared/validations";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { type FC, useEffect } from "react";
import { useFormContext } from "react-hook-form";

type ScrewFormProps = {
  mode: "create" | "edit";
  onSubmit: (e: React.FormEvent) => void; // Updated type to accept event
  isSubmitting: boolean;
  screwTypes: ScrewTypeDto[];
  screwMaterials: ScrewMaterialDto[];
  screw?: ScrewDto;
};

// Screw form component
export const ScrewForm: FC<ScrewFormProps> = ({
  mode,
  onSubmit,
  isSubmitting,
  screwTypes,
  screwMaterials,
  screw,
}) => {
  const {
    register,
    reset,
    control,
    setValue,
    formState: { errors, isValid },
  } = useFormContext<ScrewDto>();

  // Diagnostic logging
  useEffect(() => {
    console.group("ScrewForm Initialization");
    console.log("Mode:", mode);
    console.log("Screw Data:", screw);
    console.log("Form Errors:", errors);
    console.log("Form Valid:", isValid);
    console.groupEnd();
  }, [mode, screw, errors, isValid]);

  // Robust form initialization
  useEffect(() => {
    if (screw) {
      try {
        // Explicitly set each field
        Object.keys(screw).forEach((key) => {
          const value = screw[key as keyof ScrewDto];

          // Handle potential undefined or null values
          setValue(key as keyof ScrewDto, value ?? "", {
            shouldValidate: true,
            shouldDirty: true,
          });
        });

        // Fallback reset for complete state management
        reset(screw, {
          keepErrors: false,
          keepDirty: false,
          keepDefaultValues: false,
        });
      } catch (error) {
        console.error("Form Initialization Error:", error);
      }
    }
  }, [screw, reset, setValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting Form:", {
      mode,
      screw,
      isValid,
      errors,
    });
    onSubmit(e);
  };

  // Memoized rendering of select options to prevent unnecessary re-renders

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
      {screw && <input type="hidden" {...register("id")} />}

      <FormField
        control={control}
        name="name"
        disabled={isSubmitting}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-y-2">
            <FormLabel>Tên sản phẩm</FormLabel>
            <FormControl>
              <Input placeholder="Nhập tên sản phẩm" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="quantity"
          disabled={isSubmitting}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số lượng</FormLabel>
              <FormControl>
                <Input placeholder="Nhập số lượng" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="price"
          disabled={isSubmitting}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giá tham khảo</FormLabel>
              <FormControl>
                <div className="relative flex items-center">
                  <Input placeholder="Nhập giá tiền tham khảo" {...field} />
                  <div className="absolute right-3 text-gray-500 pointer-events-none">
                    VND
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          disabled={isSubmitting}
          name="componentType"
          render={({ field }) => (
            <FormItem key={field.value}>
              <FormLabel>Loại phụ kiện</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={field.disabled}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn loại phụ kiện" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {screwTypes.map((x) => (
                    <SelectItem key={x.id + "#" + x.name} value={x.name!}>
                      {x.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="material"
          disabled={isSubmitting}
          render={({ field }) => (
            <FormItem key={field.value}>
              <FormLabel>Chất liệu</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={field.disabled}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn chất liệu" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {screwMaterials.map((x) => (
                    <SelectItem key={x.id + "#" + x.name} value={x.name!}>
                      {x.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="note"
        disabled={isSubmitting}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lưu ý</FormLabel>
            <FormControl>
              <Textarea
                className="resize-none min-h-24"
                placeholder="Nhập lưu ý (nếu có)"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
          ) : mode === "edit" ? (
            "Cập nhật"
          ) : (
            "Lưu"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};
