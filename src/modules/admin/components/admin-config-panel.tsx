"use client";

import { Button } from "@/core/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog";
import { Label } from "@/core/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/core/components/ui/radio-group";
import { useState } from "react";
import { useAdminConfig } from "../lib/providers/AdminConfigProvider";

interface AdminConfigPanelProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const AdminConfigPanel: React.FC<AdminConfigPanelProps> = ({
	open,
	onOpenChange,
}) => {
	const { config, updateConfig } = useAdminConfig();
	const [selectedColor, setSelectedColor] = useState<string>(
		config.todayHighlightColor,
	);

	const handleSubmit = (e: React.FormEvent): void => {
		e.preventDefault();
		updateConfig({ todayHighlightColor: selectedColor });
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Cấu hình Bảng</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Màu nền cho hàng với ngày nhắc hôm nay</Label>
							<RadioGroup
								value={selectedColor}
								onValueChange={setSelectedColor}
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="bg-red-200" id="red" />
									<Label htmlFor="red" className="px-3 py-1 bg-red-200 rounded">
										Đỏ
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="bg-yellow-200" id="yellow" />
									<Label
										htmlFor="yellow"
										className="px-3 py-1 bg-yellow-200 rounded"
									>
										Vàng
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="bg-green-200" id="green" />
									<Label
										htmlFor="green"
										className="px-3 py-1 bg-green-200 rounded"
									>
										Xanh lá
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="bg-blue-200" id="blue" />
									<Label
										htmlFor="blue"
										className="px-3 py-1 bg-blue-200 rounded"
									>
										Xanh dương
									</Label>
								</div>
							</RadioGroup>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit">Lưu cấu hình</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
