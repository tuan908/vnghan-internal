import { motion } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { Label } from "./label";

// Form field component for consistent styling and error handling
export const FormField = ({
  label,
  name,
  children,
  className = "",
}: {
  label: string;
  name: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const { formState } = useFormContext();
  const error = formState.errors[name]?.message as string | undefined;

  return (
    <div className={`flex flex-col gap-y-2 ${className}`}>
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="text-red-500 text-sm"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};
