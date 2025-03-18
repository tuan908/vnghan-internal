import { z } from "zod";

export const createScrewSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  componentType: z.string().min(1, "Vui lòng chọn phân loại"),
  material: z.string().min(1, "Vui lòng chọn chất liệu"),
  category: z.string().optional(),
  price: z.number().min(1000, "Giá bán phải từ 1.000 VND"),
  notes: z.string().optional(),
  size: z.string().optional(),
});

export type CreateScrewDto = z.infer<typeof createScrewSchema>;


// Define schemas for each form type
export const createInstructionSchema = z.object({
  componentType: z.string().min(1, "Vui lòng chọn loại phụ kiện"),
  instruction: z.string().min(1, "Vui lòng nhập hướng dẫn"),
});

export type CreateInstructionDto = z.infer<typeof createInstructionSchema>;

export const createQuestionSchema = z.object({
  componentType: z.string().min(1, "Vui lòng chọn loại phụ kiện"),
  question: z.string().min(1, "Vui lòng nhập câu hỏi"),
  answer: z.string().min(1, "Vui lòng nhập câu trả lời"),
});

export type CreateQuestionDto = z.infer<typeof createQuestionSchema>;

// Define the schema for editScrewDto
export const editScrewSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  quantity: z.string().optional(),
  componentType: z.string().optional(),
  material: z.string().optional(),
  category: z.string().optional(),
  price: z.string().optional(),
  note: z.string().optional(),
});

export type EditScrewDto = z.infer<typeof editScrewSchema>;
