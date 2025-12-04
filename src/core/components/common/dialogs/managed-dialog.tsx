import { cn } from "@/core/utils/cn";
import * as React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../../ui/dialog";

type ManagedDialogProps<T> = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	preventCloseOnDirty?: boolean;
	isDirty?: boolean;
	className?: string;
	children: (props: { close: () => void }) => React.ReactNode;
};

export function ManagedDialog<T>({
	open,
	onOpenChange,
	title,
	description,
	preventCloseOnDirty = false,
	isDirty = false,
	className,
	children,
}: ManagedDialogProps<T>) {
	const close = React.useCallback(() => onOpenChange(false), [onOpenChange]);

	return (
		<>
			{open && (
				<Dialog open={open} onOpenChange={onOpenChange}>
					<DialogContent
						className={cn("sm:max-w-3xl overflow-hidden", className)}
						onEscapeKeyDown={(e) => {
							if (preventCloseOnDirty && isDirty) {
								e.preventDefault();
							}
						}}
						onInteractOutside={(e) => {
							if (preventCloseOnDirty && isDirty) {
								e.preventDefault();
							}
						}}
					>
						<DialogHeader>
							<DialogTitle>{title}</DialogTitle>
							{description && (
								<DialogDescription>{description}</DialogDescription>
							)}
						</DialogHeader>
						{children({ close })}
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
