import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreateQuestionDto } from "@/lib/validations";
import { ScrewTypeDto } from "@/types";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

 // Question form component
export const QuestionForm = ({
  onSubmit,
  isSubmitting,
  screwTypes,
}: {
  onSubmit: () => void;
  isSubmitting: boolean;
  screwTypes: ScrewTypeDto[];
}) => {
  const { control } = useFormContext<CreateQuestionDto>();

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-y-4">
      <FormField
        name="componentType"
        control={control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Loại phụ kiện</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        name="question"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Câu hỏi thường gặp</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                cols={3}
                className="resize-none"
                placeholder="Nhập câu hỏi thường gặp"
                autoFocus
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="answer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Câu trả lời</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                className="resize-none min-h-24"
                placeholder="Nhập câu trả lời"
              />
            </FormControl>
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
          ) : (
            "Lưu"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};
