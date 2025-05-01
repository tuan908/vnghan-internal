import { Button } from "@/frontend/components/ui/button";
import { DialogFooter } from "@/frontend/components/ui/dialog";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/frontend/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/frontend/components/ui/select";
import { Textarea } from "@/frontend/components/ui/textarea";
import type { ScrewTypeDto } from "@/shared/types";
import { CreateInstructionDto } from "@/shared/validations";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

// Instruction form component
export const InstructionForm = ({
	onSubmit,
	isSubmitting,
	screwTypes,
}: {
	onSubmit: () => void;
	isSubmitting: boolean;
	screwTypes: ScrewTypeDto[];
}) => {
	const { control } = useFormContext<CreateInstructionDto>();

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
				name="instruction"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Hướng dẫn</FormLabel>
						<FormControl>
							<Textarea
								{...field}
								className="resize-none min-h-24"
								placeholder="Nhập chi tiết hướng dẫn lắp đặt"
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
