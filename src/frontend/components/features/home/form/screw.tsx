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
import json from "@/shared/i18n/locales/vi/vi.json";
import type { ScrewMaterialDto, ScrewTypeDto } from "@/shared/types";
import type { ScrewDto } from "@/shared/validations";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { type FC, memo } from "react";
import { useFormContext } from "react-hook-form";

type ScrewFormProps = {
  mode: "create" | "edit";
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  screwTypes: ScrewTypeDto[];
  screwMaterials: ScrewMaterialDto[];
  screw?: ScrewDto;
};

// Memoized SelectItem components to prevent re-renders
const TypeSelectItem = memo(({ type }: { type: ScrewTypeDto }) => (
  <SelectItem key={type.id} value={type.name || ""}>
    {type.name}
  </SelectItem>
));
TypeSelectItem.displayName = "TypeSelectItem";

const MaterialSelectItem = memo(
  ({ material }: { material: ScrewMaterialDto }) => (
    <SelectItem key={material.id} value={material.name || ""}>
      {material.name}
    </SelectItem>
  ),
);
MaterialSelectItem.displayName = "MaterialSelectItem";

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
    control,
    register,
    formState: { errors },
  } = useFormContext<ScrewDto>();

  // Simplified form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

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
            <FormItem>
              <FormLabel>Loại phụ kiện</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
                disabled={field.disabled}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn loại phụ kiện" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {screwTypes.map((type) => (
                    <TypeSelectItem key={type.id} type={type} />
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
            <FormItem>
              <FormLabel>Chất liệu</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
                disabled={field.disabled}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn chất liệu" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {screwMaterials.map((material) => (
                    <MaterialSelectItem key={material.id} material={material} />
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
              <span>{json.common.saving}</span>
            </>
          ) : mode === "edit" ? (
            <span>{json.common.edit}</span>
          ) : (
            <span>{json.common.save}</span>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};
