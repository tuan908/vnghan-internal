import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  category: z.string().min(1, "Vui lòng chọn phân loại"),
  material: z.string().min(1, "Vui lòng chọn chất liệu"),
  features: z.string().optional(),
  price: z.number().min(1000, "Giá bán phải từ 1.000 VND"),
  image: z.instanceof(File, { message: "Vui lòng tải lên hình ảnh" }),
  notes: z.string().optional(),
});
