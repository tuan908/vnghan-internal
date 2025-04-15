"use client";

import { useCreateScrew } from "@/frontend/hooks/useCreateScrew";
import { useGetScrewMaterials } from "@/frontend/hooks/useGetScrewMaterials";
import { useGetScrewTypes } from "@/frontend/hooks/useGetScrewTypes";
import {
  type CreateInstructionDto,
  createInstructionSchema,
  type CreateQuestionDto,
  createQuestionSchema,
  ScrewDto,
  ScrewSchema,
} from "@/shared/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { FileText, HelpCircle, Plus, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "../..//ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../..//ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemWithIcon,
  DropdownMenuTrigger,
} from "../..//ui/dropdown-menu";
import { errorToast, successToast } from "../..//ui/toast";
import { InstructionForm } from "../form/instruction";
import { QuestionForm } from "../form/question";
import { ScrewForm } from "../form/screw";

// Dialog types
type DialogType = "screw" | "instruction" | "question" | null;

// Main component
export function AddOptionDropdown() {
  const queryClient = useQueryClient();
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const {screwTypes} = useGetScrewTypes();
  const {screwMaterials} = useGetScrewMaterials();

  // Create form methods
  const createScrewForm = useForm<ScrewDto>({
    resolver: zodResolver(ScrewSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      quantity: "",
      price: "",
      componentType: "",
      material: "",
      note: "",
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
    const subscription = createScrewForm.watch(() => {
      if (activeDialog === "screw") {
        setHasUnsavedChanges(createScrewForm.formState.isDirty);
      }
    });
    return () => subscription.unsubscribe();
  }, [createScrewForm, activeDialog]);

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
  const {createScrew, isCreatingScrew} = useCreateScrew();

  // Mutation for creating an instruction
  const {mutate: createInstruction, isPending: isCreatingInstruction} =
    useMutation({
      mutationFn: async (data: CreateInstructionDto) => {
        // Implement your API call here
        console.log("Creating instruction:", data);
        // Simulate API call
        return new Promise<CreateInstructionDto>(resolve => {
          setTimeout(() => resolve(data), 1000);
        });
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({queryKey: ["get-instructions"]});
        setActiveDialog(null)
        successToast();
      },
      onError: error => errorToast(error.message),
    });

  // Mutation for creating a question
  const {mutate: createQuestion, isPending: isCreatingQuestion} = useMutation({
    mutationFn: async (data: CreateQuestionDto) => {
      // Implement your API call here
      console.log("Creating question:", data);
      // Simulate API call
      return new Promise<CreateQuestionDto>(resolve => {
        setTimeout(() => resolve(data), 1000);
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ["get-questions"]});
      setActiveDialog(null)
      successToast();
    },
    onError: error => errorToast(error.message),
  });

  // Form submission handlers
  const handleSubmitScrew = createScrewForm.handleSubmit(async data => {
    await createScrew(data);
    setActiveDialog(null)
  });

  const handleSubmitInstruction = instructionForm.handleSubmit(data => {
    createInstruction(data);
  });

  const handleSubmitQuestion = questionForm.handleSubmit(data => {
    createQuestion(data);
  });

  // Dialog management
  const handleOpenDialog = (type: DialogType) => {
    setActiveDialog(type);
    setHasUnsavedChanges(false);

    // Reset the appropriate form
    if (type === "screw") {
      createScrewForm.reset();
    } else if (type === "instruction") {
      instructionForm.reset();
    } else if (type === "question") {
      questionForm.reset();
    }
  };

  // Render dialog content based on active dialog
  const renderDialogContent = () => {
    switch (activeDialog) {
      case "screw":
        return (
          <FormProvider {...createScrewForm}>
            <ScrewForm
              mode="create"
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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (hasUnsavedChanges) {
        setHasUnsavedChanges(false);
      }
      setActiveDialog(null);
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
          <Dialog open={!!activeDialog} onOpenChange={handleOpenChange}>
            <DialogContent
              className="sm:max-w-[48rem] overflow-hidden"
              onEscapeKeyDown={e => {
                if (hasUnsavedChanges) {
                  e.preventDefault();
                  setActiveDialog(null);
                }
              }}
              onInteractOutside={e => {
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
