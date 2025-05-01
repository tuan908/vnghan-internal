import { z } from "zod";
import json from "../i18n/locales/vi/vi.json";
import { format } from "../utils";

export const ScrewSchema = z.object({
	id: z.number().optional(),
	name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
	quantity: z.string().min(1, "Vui lòng nhập số lượng"),
	componentType: z.string().min(1, "Vui lòng chọn phân loại"),
	material: z.string().min(1, "Vui lòng chọn chất liệu"),
	category: z.string().optional(),
	price: z.string().superRefine((value, ctx) => {
		if (value === "") {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Vui lòng nhập giá tham khảo",
			});
		}

		if (Number.isNaN(value)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Vui lòng nhập số",
			});
		}

		if (Number(value) < 1000) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Giá tham khảo phải lớn hơn 1000 VND",
			});
		}
	}),
	note: z.string().optional(),
	size: z.string().optional(),
});

export type ScrewDto = z.infer<typeof ScrewSchema>;

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

export const CustomerSchema = z.object({
	id: z.number().optional(),
	name: z
		.string({
			message: format(json.error.fieldRequired, json.form.createCustomer.name),
		})
		.min(1, {
			message: format(json.error.fieldRequired, json.form.createCustomer.name),
		}),
	phone: z
		.string({
			message: format(json.error.fieldRequired, json.form.createCustomer.phone),
		})
		.min(1, {
			message: format(json.error.fieldRequired, json.form.createCustomer.phone),
		}),
	address: z
		.string({
			message: format(
				json.error.fieldRequired,
				json.form.createCustomer.address,
			),
		})
		.min(1, {
			message: format(
				json.error.fieldRequired,
				json.form.createCustomer.address,
			),
		}),
	platform: z
		.string({
			message: format(
				json.error.fieldRequired,
				json.form.createCustomer.platform,
			),
		})
		.min(1, {
			message: format(
				json.error.fieldRequired,
				json.form.createCustomer.platform,
			),
		}),
	need: z
		.string({
			message: format(json.error.fieldRequired, json.form.createCustomer.need),
		})
		.optional(),
	money: z
		.string({
			message: format(json.error.fieldRequired, json.form.createCustomer.money),
		})
		.min(1, {
			message: format(json.error.fieldRequired, json.form.createCustomer.money),
		})
		.superRefine((value, ctx) => {
			const parsedNum = Number(value);

			if (isNaN(parsedNum)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Hãy nhập 1 số",
				});
				return;
			}

			if (parsedNum <= 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Số tiền phải lớn hơn 0",
				});
			}
		}),
	nextMessageTime: z
		.date({
			invalid_type_error: format(
				json.error.fieldRequired,
				json.form.createCustomer.nextMessageTime,
			),
			required_error: format(
				json.error.fieldRequired,
				json.form.createCustomer.nextMessageTime,
			),
		})
		.refine((x) => x.toISOString()),
});

export type CustomerDto = z.infer<typeof CustomerSchema>;

export const SignInSchema = z.object({
	username: z
		.string({
			message: format(json.error.fieldRequired, json.form.login.username),
		})
		.min(1, {
			message: format(json.error.fieldRequired, json.form.login.username),
		}),
	password: z
		.string({
			message: format(json.error.fieldRequired, json.form.login.password),
		})
		.min(6, {
			message: format(json.error.fieldRequired, json.form.login.password),
		}),
});

export type SignInFormValues = z.infer<typeof SignInSchema>;
