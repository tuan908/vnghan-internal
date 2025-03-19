import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrewDto } from "@/lib/validations";
import { ScrewMaterialDto, ScrewTypeDto } from "@/types";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { FC, useEffect } from "react";
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
  const { register, reset, control, setValue } = useFormContext<ScrewDto>();

  useEffect(() => {
    if (screw) {
      reset({
        id: screw.id,
        name: screw.name,
        quantity: screw.quantity,
        price: screw.price,
        note: screw.note,
        componentType: screw.componentType,
        category: screw.category,
        material: screw.material,
      });
    }
  }, [screw, reset, setValue]);

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
          name="componentType"
          render={({ field }) => (
            <FormItem  key={field.value}>
              <FormLabel>Loại phụ kiện</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
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
          render={({ field }) => (
            <FormItem key={field.value}>
              <FormLabel>Chất liệu</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lưu ý</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                className="resize-none min-h-24"
                placeholder="Nhập lưu ý (nếu có)"
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
