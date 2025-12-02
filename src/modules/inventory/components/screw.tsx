import { Autocomplete } from "@/core/components/ui/autocomplete";
import { Button } from "@/core/components/ui/button";
import { DialogFooter } from "@/core/components/ui/dialog";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import json from "@/core/i18n/locales/vi/vi.json";
import type { ScrewMaterialDto, ScrewTypeDto } from "@/core/types";
import { mapToAutocompleteOptions } from "@/core/utils";
import type { ScrewDto } from "@/core/validations";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { type FC } from "react";
import { useFormContext } from "react-hook-form";

type ScrewFormProps = {
	mode: "create" | "edit";
	onSubmit: (e: React.FormEvent) => void;
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
					render={({ field }) => {
						const screwTypeOptions = mapToAutocompleteOptions(
							screwTypes,
							"name",
						);
						const selectedOption = screwTypeOptions.find(
							(opt) => opt.value === field.value,
						);
						return (
							<FormItem>
								<FormLabel>Loại phụ kiện</FormLabel>
								<FormControl>
									<Autocomplete
										options={screwTypeOptions}
										value={selectedOption || null}
										onChange={(option) => field.onChange(option?.value || "")}
										placeholder="Chọn loại phụ kiện"
										disabled={field.disabled}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						);
					}}
				/>

				<FormField
					control={control}
					name="material"
					disabled={isSubmitting}
					render={({ field }) => {
						const screwMaterialOptions = mapToAutocompleteOptions(
							screwMaterials,
							"name",
						);
						const selectedMaterialOption = screwMaterialOptions.find(
							(opt) => opt.value === field.value,
						);
						return (
							<FormItem>
								<FormLabel>Chất liệu</FormLabel>
								<FormControl>
									<Autocomplete
										options={screwMaterialOptions}
										value={selectedMaterialOption || null}
										onChange={(option) => field.onChange(option?.value || "")}
										placeholder="Chọn chất liệu"
										disabled={field.disabled}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						);
					}}
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
