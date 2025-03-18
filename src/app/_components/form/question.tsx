import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
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
import { CreateQuestionDto } from "@/lib/validations";
import { ScrewTypeDto } from "@/types";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

export // Question form component
const QuestionForm = ({
  onSubmit,
  isSubmitting,
  screwTypes,
}: {
  onSubmit: () => void;
  isSubmitting: boolean;
  screwTypes: ScrewTypeDto[];
}) => {
  const { register, setValue, watch } = useFormContext<CreateQuestionDto>();
  const componentType = watch("componentType");

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-y-4">
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

      <FormField label="Câu hỏi" name="question">
        <Textarea
          {...register("question")}
          cols={3}
          className="resize-none"
          placeholder="Nhập câu hỏi thường gặp"
          autoFocus
        />
      </FormField>

      <FormField label="Câu trả lời" name="answer">
        <Textarea
          {...register("answer")}
          cols={3}
          className="resize-none min-h-24"
          placeholder="Nhập câu trả lời"
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
          ) : (
            "Lưu"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};
