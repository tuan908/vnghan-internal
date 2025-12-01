import { SelectItem } from "@/core/components/ui/select";
import { ScrewMaterialDto, ScrewTypeDto } from "@/core/types";
import { memo } from "react";

// Memoized SelectItem components to prevent re-renders
export const TypeSelectItem = memo(({ type }: { type: ScrewTypeDto }) => (
	<SelectItem key={type.id} value={type.name || ""}>
		{type.name}
	</SelectItem>
));
TypeSelectItem.displayName = "TypeSelectItem";

export const MaterialSelectItem = memo(
	({ material }: { material: ScrewMaterialDto }) => (
		<SelectItem key={material.id} value={material.name || ""}>
			{material.name}
		</SelectItem>
	),
);
MaterialSelectItem.displayName = "MaterialSelectItem";
