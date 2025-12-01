import { Button } from "@/core/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog";
import type { ScrewDto } from "@/core/validations";

interface ScrewDeleteDialogProps {
	isOpen: boolean;
	currentItem: ScrewDto | null;
	isDeleting: boolean;
	onClose: () => void;
	onDelete: () => Promise<void>;
}

export function ScrewDeleteDialog({
	isOpen,
	currentItem,
	isDeleting,
	onClose,
	onDelete,
}: ScrewDeleteDialogProps) {
	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Xác nhận xóa</DialogTitle>
					<DialogDescription>
						Bạn có chắc chắn muốn xóa sản phẩm "{currentItem?.name}
						"?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={isDeleting}
					>
						Hủy
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={onDelete}
						disabled={isDeleting}
					>
						Xóa
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
