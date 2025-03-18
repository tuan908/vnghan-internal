"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemWithIcon,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import json from "@/i18n/locales/vi.json";
import { client } from "@/lib/client";
import {
  type CreateInstructionDto,
  createInstructionSchema,
  type CreateQuestionDto,
  createQuestionSchema,
  type CreateScrewDto,
  createScrewSchema,
} from "@/lib/validations";
import type { ScrewMaterialDto, ScrewTypeDto } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import {
  Check,
  CircleX,
  FileText,
  HelpCircle,
  Plus,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { InstructionForm } from "../form/instruction";
import { QuestionForm } from "../form/question";
import { ScrewForm } from "../form/screw";

// Dialog types
type DialogType = "screw" | "instruction" | "question" | null;

// Main component
export function AddOptionDropdown({
  screwMaterials,
  screwTypes,
}: {
  screwMaterials: ScrewMaterialDto[];
  screwTypes: ScrewTypeDto[];
}) {
  const queryClient = useQueryClient();
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Create form methods
  const screwForm = useForm<CreateScrewDto>({
    resolver: zodResolver(createScrewSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      quantity: 0,
      price: 0,
      componentType: "",
      material: "",
      notes: "",
    },
  });

  const instructionForm = useForm<CreateInstructionDto>({
    resolver: zodResolver(createInstructionSchema),
    mode: "onChange",
    defaultValues: {
      componentType: "",
      instruction: "",
    },
  });

  const questionForm = useForm<CreateQuestionDto>({
    resolver: zodResolver(createQuestionSchema),
    mode: "onChange",
    defaultValues: {
      componentType: "",
      question: "",
      answer: "",
    },
  });

  // Track form changes
  useEffect(() => {
    const subscription = screwForm.watch(() => {
      if (activeDialog === "screw") {
        setHasUnsavedChanges(screwForm.formState.isDirty);
      }
    });
    return () => subscription.unsubscribe();
  }, [screwForm, activeDialog]);

  useEffect(() => {
    const subscription = instructionForm.watch(() => {
      if (activeDialog === "instruction") {
        setHasUnsavedChanges(instructionForm.formState.isDirty);
      }
    });
    return () => subscription.unsubscribe();
  }, [instructionForm, activeDialog]);

  useEffect(() => {
    const subscription = questionForm.watch(() => {
      if (activeDialog === "question") {
        setHasUnsavedChanges(questionForm.formState.isDirty);
      }
    });
    return () => subscription.unsubscribe();
  }, [questionForm, activeDialog]);

  // Mutation for creating a screw
  const { mutate: createScrew, isPending: isCreatingScrew } = useMutation({
    mutationFn: async (data: CreateScrewDto) => {
      const res = await client.screw.create.$post(data);
      return await res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["get-screws"] });
      handleCloseDialog();
      toast.success(json.success.operation, {
        description: "Linh kiện đã được thêm thành công",
        action: <Check className="text-green-500" />,
      });
    },
    onError: (error) => {
      toast.error(error.message, {
        description: "Có lỗi xảy ra khi thêm linh kiện",
        action: <CircleX className="text-red-500" />,
      });
    },
  });

  // Mutation for creating an instruction
  const { mutate: createInstruction, isPending: isCreatingInstruction } =
    useMutation({
      mutationFn: async (data: CreateInstructionDto) => {
        // Implement your API call here
        console.log("Creating instruction:", data);
        // Simulate API call
        return new Promise<CreateInstructionDto>((resolve) => {
          setTimeout(() => resolve(data), 1000);
        });
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["get-instructions"] });
        handleCloseDialog();
        toast.success(json.success.operation, {
          description: "Hướng dẫn đã được thêm thành công",
          action: <Check className="text-green-500" />,
        });
      },
      onError: (error) => {
        toast.error(error.message, {
          description: "Có lỗi xảy ra khi thêm hướng dẫn",
          action: <CircleX className="text-red-500" />,
        });
      },
    });

  // Mutation for creating a question
  const { mutate: createQuestion, isPending: isCreatingQuestion } = useMutation(
    {
      mutationFn: async (data: CreateQuestionDto) => {
        // Implement your API call here
        console.log("Creating question:", data);
        // Simulate API call
        return new Promise<CreateQuestionDto>((resolve) => {
          setTimeout(() => resolve(data), 1000);
        });
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["get-questions"] });
        handleCloseDialog();
        toast.success(json.success.operation, {
          description: "Câu hỏi đã được thêm thành công",
          action: <Check className="text-green-500" />,
        });
      },
      onError: (error) => {
        toast.error(error.message, {
          description: "Có lỗi xảy ra khi thêm câu hỏi",
          action: <CircleX className="text-red-500" />,
        });
      },
    }
  );

  // Form submission handlers
  const handleSubmitScrew = screwForm.handleSubmit((data) => {
    createScrew(data);
  });

  const handleSubmitInstruction = instructionForm.handleSubmit((data) => {
    createInstruction(data);
  });

  const handleSubmitQuestion = questionForm.handleSubmit((data) => {
    createQuestion(data);
  });

  // Dialog management
  const handleOpenDialog = (type: DialogType) => {
    setActiveDialog(type);
    setHasUnsavedChanges(false);

    // Reset the appropriate form
    if (type === "screw") {
      screwForm.reset();
    } else if (type === "instruction") {
      instructionForm.reset();
    } else if (type === "question") {
      questionForm.reset();
    }
  };

  const handleCloseDialog = () => {
    if (hasUnsavedChanges) {
      if (
        confirm("Bạn có chắc chắn muốn đóng? Dữ liệu chưa được lưu sẽ bị mất.")
      ) {
        setActiveDialog(null);
        setHasUnsavedChanges(false);
      }
    } else {
      setActiveDialog(null);
    }
  };

  // Render dialog content based on active dialog
  const renderDialogContent = () => {
    switch (activeDialog) {
      case "screw":
        return (
          <FormProvider {...screwForm}>
            <ScrewForm
              onSubmit={handleSubmitScrew}
              isSubmitting={isCreatingScrew}
              screwTypes={screwTypes}
              screwMaterials={screwMaterials}
            />
          </FormProvider>
        );
      case "instruction":
        return (
          <FormProvider {...instructionForm}>
            <InstructionForm
              onSubmit={handleSubmitInstruction}
              isSubmitting={isCreatingInstruction}
              screwTypes={screwTypes}
            />
          </FormProvider>
        );
      case "question":
        return (
          <FormProvider {...questionForm}>
            <QuestionForm
              onSubmit={handleSubmitQuestion}
              isSubmitting={isCreatingQuestion}
              screwTypes={screwTypes}
            />
          </FormProvider>
        );
      default:
        return null;
    }
  };

  // Dialog title based on active dialog
  const getDialogTitle = () => {
    switch (activeDialog) {
      case "screw":
        return "Thêm mới linh kiện";
      case "instruction":
        return "Thêm mới hướng dẫn lắp đặt";
      case "question":
        return "Thêm mới câu hỏi thường gặp";
      default:
        return "Thêm mới";
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm mới
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItemWithIcon
            icon={Settings}
            label="Linh kiện"
            onClick={() => handleOpenDialog("screw")}
          />
          <DropdownMenuItemWithIcon
            icon={FileText}
            label="Các bước lắp đặt"
            onClick={() => handleOpenDialog("instruction")}
          />
          <DropdownMenuItemWithIcon
            icon={HelpCircle}
            label="Câu hỏi thường gặp"
            onClick={() => handleOpenDialog("question")}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <AnimatePresence>
        {activeDialog && (
          <Dialog
            open={!!activeDialog}
            onOpenChange={(open) => {
              if (!open) handleCloseDialog();
            }}
          >
            <DialogContent
              className="sm:max-w-[500px] overflow-hidden"
              onEscapeKeyDown={(e) => {
                if (hasUnsavedChanges) {
                  e.preventDefault();
                  handleCloseDialog();
                }
              }}
              onInteractOutside={(e) => {
                if (hasUnsavedChanges) {
                  e.preventDefault();
                }
              }}
            >
              <DialogHeader>
                <DialogTitle>{getDialogTitle()}</DialogTitle>
              </DialogHeader>
              {renderDialogContent()}
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
